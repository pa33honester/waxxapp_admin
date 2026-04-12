const User = require("./user.model");

//fs
const fs = require("fs");

//config
const config = require("../../config");

//Cryptr
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

//mongoose
const mongoose = require("mongoose");

//deleteFile
const { deleteFile } = require("../../util/deleteFile");

//import model
const Address = require("../address/address.model");
const Cart = require("../cart/cart.model");
const Favorite = require("../favorite/favorite.model");
const Follower = require("../follower/follower.model");
const LikeHistoryOfReel = require("../likeHistoryOfReel/likeHistoryOfReel.model");
const Notification = require("../notification/notification.model");
const Order = require("../order/order.model");
const PromoCodeCheck = require("../promoCodeCheck/promoCodeCheck.model");
const Rating = require("../rating/rating.model");
const ReportReel = require("../reportoReel/reportoReel.model");
const Review = require("../review/review.model");
const SellerRequest = require("../sellerRequest/sellerRequest.model");
const Reel = require("../reel/reel.model");
const Seller = require("../seller/seller.model");
const LiveSeller = require("../liveSeller/liveSeller.model");
const LiveSellingHistory = require("../liveSellingHistory/liveSellingHistory.model");
const SellerWallet = require("../sellerWallet/sellerWallet.model");
const Product = require("../product/product.model");
const ProductRequest = require("../productRequest/productRequest.model");
const AuctionBid = require("../auctionBid/auctionBid.model");
const WithdrawRequest = require("../withdrawRequest/withdrawRequest.model");

//generate UniqueId
const generateUniqueId = async () => {
  const random = () => {
    return Math.floor(Math.random() * (999999999 - 100000000)) + 100000000;
  };

  var uniqueId = random();

  let user = await User.findOne({ uniqueId: uniqueId });
  while (user) {
    uniqueId = random();
    user = await User.findOne({ uniqueId: uniqueId });
  }

  return uniqueId;
};

const userFunction = async (user, data_) => {
  const data = data_.body;
  const file = data_.file;

  // const randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  // let password = "";
  // for (let i = 0; i < 8; i++) {
  //   password += randomChars.charAt(
  //     Math.floor(Math.random() * randomChars.length)
  //   );
  // }
  // user.password = !user.password ? password : user.password;

  //user.image = data.image ? data.image : user?.image;

  user.image = data.image
    ? data.image
    : !user.image
      ? !file
        ? user.gender === "female"
          ? `${config.baseURL}storage/erashopUser.png`
          : `${config.baseURL}storage/erashopUser.png`
        : config.baseURL + file.path
      : user.image;

  user.firstName = data.firstName ? data.firstName : user.firstName;
  user.lastName = data.lastName ? data.lastName : user.lastName;
  user.email = data.email.trim() ? data.email.trim() : user.email;
  user.dob = data.dob ? data.dob : user.dob;
  user.gender = data.gender ? data.gender : user.gender;
  user.location = data.location ? data.location : user.location;
  user.countryCode = data.countryCode ? data.countryCode : user.countryCode;
  user.mobileNumber = data.mobileNumber ? data.mobileNumber : user.mobileNumber;
  user.loginType = data.loginType ? data.loginType : user.loginType;

  user.password = data.password ? cryptr.encrypt(data.password) : user.password;
  user.identity = data.identity ? data.identity : user.identity;
  user.fcmToken = data.fcmToken ? data.fcmToken : user.fcmToken;
  user.uniqueId = !user.uniqueId ? await Promise.resolve(generateUniqueId()) : user.uniqueId;
  await user.save();

  //return user with decrypt password
  user.password = data.password ? await cryptr.decrypt(user.password) : user.password;

  return user;
};

//user login and sign up
exports.store = async (req, res) => {
  console.log("req.body in login API =================", req.body);

  try {
    if (
      !req.body.identity ||
      req.body.loginType === undefined
      // || !req.body.fcmToken
    ) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    let userQuery;

    if (Number(req.body.loginType) === 1 || Number(req.body.loginType) === 2) {
      console.log("google or apple login");

      if (!req.body.email) {
        return res.status(200).json({ status: false, message: "email must be required." });
      }

      userQuery = await User.findOne({ email: req.body.email.trim() });
    } else if (Number(req.body.loginType) === 3) {
      if (!req.body.email || !req.body.password) {
        return res.status(200).json({
          status: false,
          message: "email and password both must be required.",
        });
      }

      const user = await User.findOne({ email: req.body.email.trim() });

      if (user) {
        if (!user.password) {
          return res.status(200).json({
            status: false,
            message: "User's password not found.",
          });
        }

        if (cryptr.decrypt(user.password) !== req.body.password) {
          return res.status(200).json({
            status: false,
            message: "Oops ! Password doesn't match.",
          });
        }
        userQuery = user;
      } else {
        userQuery = user;
      }
    } else if (Number(req.body.loginType) === 5) {
      console.log("mobile login");

      if (!req.body.mobileNumber) {
        return res.status(200).json({ status: false, message: "mobileNumber must be required." });
      }

      userQuery = await User.findOne({ mobileNumber: req.body.mobileNumber.trim() });
    }

    const user = userQuery;

    if (user) {
      console.log("exist user:    ");

      if (user.isBlock) {
        return res.status(200).json({ status: false, message: "You are blocked by admin!" });
      }

      const newFcmToken = req?.body?.fcmToken;
      if (newFcmToken) {
        if (user.isSeller === true && user.seller !== null) {
          await Seller.updateOne({ userId: user._id }, { $set: { fcmToken: newFcmToken } });
        }
      }

      user.fcmToken = req?.body?.fcmToken || user.fcmToken;
      await user.save();

      // const user_ = await userFunction(user, req);

      return res.status(200).json({
        status: true,
        message: "User has been login Successfully.",
        user: user,
        signUp: false,
      });
    } else {
      console.log("User signup:    ");

      const newUser = new User();
      newUser.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

      const user = await userFunction(newUser, req);

      return res.status(200).json({
        status: true,
        message: "User has been signUp Successfully.",
        user,
        signUp: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};

//check the user's password wrong or true
exports.checkPassword = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });

    const user = await User.findOne({ email: req.body.email, loginType: 3 });

    if (user) {
      if (!user.password) {
        return res.status(200).json({
          status: false,
          message: "User's password not found!",
        });
      }

      if (cryptr.decrypt(user.password) !== req.body.password) {
        return res.status(200).json({
          status: false,
          message: "Oops ! Password doesn't match!!",
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "your password has benn matched!",
        });
      }
    } else {
      return res.status(200).json({
        status: false,
        message: "user does not found with that email!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};

//check the user is exists or not
exports.checkUser = async (req, res) => {
  try {
    if (!req.body.email || req.body.loginType === undefined || !req.body.password) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const user = await User.findOne({ email: req.body.email?.trim(), loginType: 3 });

    if (user) {
      if (cryptr.decrypt(user.password ? user.password.toString() : "") !== req.body.password) {
        return res.status(200).json({
          status: false,
          message: "Password doesn't match for this user!!",
          isLogin: false,
        });
      } else {
        return res.status(200).json({
          status: true,
          message: "User login Successfully!!",
          isLogin: true,
        });
      }
    } else {
      return res.status(200).json({
        status: true,
        message: "User must have sign up!!",
        isLogin: false,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error!!",
    });
  }
};

//update profile of user
exports.updateProfile = async (req, res) => {
  try {
    if (!req.body.userId) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "userId must be requried." });
    }

    const user = await User.findById(req.body.userId);
    if (!user) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (req.file) {
      if (user?.image) {
        const image = user?.image?.split("storage");
        if (image) {
          const imagePath = "storage" + image[1];
          if (fs.existsSync(imagePath)) {
            const imageName = imagePath.split("/").pop();
            if (imageName !== "erashopUser.png") {
              fs.unlinkSync(imagePath);
            }
          }
        }
      }

      user.image = config.baseURL + req.file.path;
    }

    user.firstName = req.body.firstName ? req.body.firstName : user.firstName;
    user.lastName = req.body.lastName ? req.body.lastName : user.lastName;
    user.email = req.body.email.trim() ? req.body.email.trim() : user.email;
    user.dob = req.body.dob ? req.body.dob : user.dob;
    user.gender = req.body.gender ? req.body.gender : user.gender;
    user.location = req.body.location ? req.body.location : user.location;
    user.countryCode = req.body.countryCode ? req.body.countryCode : user.countryCode;
    user.mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : user.mobileNumber;

    await user.save();

    return res.status(200).json({ status: true, message: "Success", user });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update password
exports.updatePassword = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be requried!" });
    }

    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const user = await User.findOne({ _id: req.query.userId });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (cryptr.decrypt(user.password) !== req.body.oldPass) {
      return res.status(200).json({
        status: false,
        message: "Oops ! old password doesn't matched!",
      });
    }

    if (req.body.newPass !== req.body.confirmPass) {
      return res.status(200).json({
        status: false,
        message: "Oops! New Password and Confirm Password don't match!",
      });
    }

    const hash = cryptr.encrypt(req.body.newPass);
    user.password = hash;

    await user.save();

    const data = await User.findById(user._id).select("password _id firstName lastName");
    data.password = cryptr.decrypt(data.password);

    return res.status(200).json({
      status: true,
      message: "Password has been changed by the user!",
      user: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//set Password
exports.setPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email?.trim() });
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!req.body || !req.body.newPassword || !req.body.confirmPassword) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    if (req.body.newPassword === req.body.confirmPassword) {
      user.password = cryptr.encrypt(req.body.newPassword);
      await user.save();

      user.password = await cryptr.decrypt(user.password);

      return res.status(200).json({
        status: true,
        message: "Password Changed Successfully!",
        user,
      });
    } else {
      return res.status(200).json({ status: false, message: "Password does not matched!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//user block or unbolck for admin
exports.blockUnblock = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, massage: "UserId is requried!!" });
    }

    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    user.isBlock = !user.isBlock;
    await user.save();

    return res.status(200).json({
      status: true,
      message: "Success",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get all users for admin
exports.get = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const users = await User.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "orders",
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          dob: 1,
          gender: 1,
          location: 1,
          mobileNumber: 1,
          image: 1,
          password: 1,
          uniqueId: 1,
          followers: 1,
          following: 1,
          isSeller: 1,
          isBlock: 1,
          date: 1,
          loginType: 1,
          identity: 1,
          fcmToken: 1,
          orderCount: { $size: "$orders" },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          totalUsers: [{ $count: "count" }],
          users: [
            { $skip: (start - 1) * limit }, //how many records you want to skip
            { $limit: limit },
          ],
        },
      },
    ]);

    const totalUsers = users[0].totalUsers[0].count;
    const usersData = users[0].users;

    return res.status(200).json({
      status: true,
      message: "finally, get the all users Successfully!",
      totalUsers: totalUsers,
      users: usersData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

//get user profile who login
exports.getProfile = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const user = await User.findById(req.query.userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin!" });
    }

    return res.status(200).json({ status: true, message: "Success", user: user });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get all top customers (users) for admin panel(dashboard)
exports.topCustomers = async (req, res) => {
  try {
    const topCustomers = await User.aggregate([
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "orders",
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          image: 1,
          email: 1,
          uniqueId: 1,
          location: 1,
          orderCount: { $size: "$orders" },
        },
      },
      {
        $sort: { orderCount: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "finally, get all top customers (users) Successfully!",
      topCustomers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error!!",
    });
  }
};

//delete user account
exports.deleteUserAccount = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be required!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, userIsSeller] = await Promise.all([User.findById(userId), Seller.findOne({ userId: userId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    res.status(200).json({ status: true, message: "User account has been deleted." });

    if (user) {
      if (user?.image) {
        const image = user?.image?.split("storage");
        if (image) {
          const imagePath = "storage" + image[1];
          if (fs.existsSync(imagePath)) {
            const imageName = imagePath.split("/").pop();
            if (imageName !== "erashopUser.png") {
              fs.unlinkSync(imagePath);
            }
          }
        }
      }

      await Promise.all([
        Address.deleteMany({ userId: user?._id }),
        Cart.deleteMany({ userId: user?._id }),
        Favorite.deleteMany({ userId: user?._id }),
        Follower.deleteMany({ userId: user?._id }),
        LikeHistoryOfReel.deleteMany({ userId: user?._id }),
        Notification.deleteMany({ userId: user?._id }),
        Order.deleteMany({ userId: user?._id }),
        PromoCodeCheck.deleteMany({ userId: user?._id }),
        Rating.deleteMany({ userId: user?._id }),
        ReportReel.deleteMany({ userId: user?._id }),
        Review.deleteMany({ userId: user?._id }),
        SellerRequest.deleteMany({ userId: user?._id }),
        AuctionBid.deleteMany({ userId: user?._id }),
      ]);
    }

    if (userIsSeller) {
      if (userIsSeller?.image) {
        const image = userIsSeller?.image.split("storage");
        if (image) {
          const imagePath = "storage" + image[1];
          if (fs.existsSync(imagePath)) {
            const imageName = imagePath.split("/").pop();
            if (imageName !== "erashopUser.png") {
              fs.unlinkSync(imagePath);
            }
          }
        }
      }

      const [products, reelsToDelete] = await Promise.all([Product.find({ seller: userIsSeller?._id }), Reel.find({ sellerId: userIsSeller?._id })]);

      if (products.length > 0) {
        await products.forEach(async (product) => {
          if (product?.mainImage) {
            const image = product?.mainImage?.split("storage");
            if (image) {
              if (fs.existsSync("storage" + image[1])) {
                fs.unlinkSync("storage" + image[1]);
              }
            }
          }

          if (product.images) {
            if (product?.images?.length > 0) {
              for (var i = 0; i < product?.images?.length; i++) {
                const images = product?.images[i]?.split("storage");
                if (images) {
                  if (fs.existsSync("storage" + images[1])) {
                    fs.unlinkSync("storage" + images[1]);
                  }
                }
              }
            }
          }

          const [cart, order, favorite, review, rating, productRequest, reels] = await Promise.all([
            Cart.deleteMany({ "items.productId": product?._id }),
            Order.deleteMany({ "items.productId": product?._id }),
            Favorite.deleteMany({ productId: product?._id }),
            Review.deleteMany({ productId: product?._id }),
            Rating.deleteMany({ productId: product?._id }),
            ProductRequest.find({ productCode: product?.productCode }),
            Reel.find({ productId: product?._id }),
            AuctionBid.deleteMany({ productId: product?._id }),
            SellerWallet.deleteMany({ productId: product?._id }),
          ]);

          if (productRequest.length > 0) {
            await productRequest.forEach(async (product) => {
              if (product.mainImage) {
                const image = product?.mainImage?.split("storage");
                if (image) {
                  if (fs.existsSync("storage" + image[1])) {
                    fs.unlinkSync("storage" + image[1]);
                  }
                }
              }

              if (product.images) {
                if (product.images.length > 0) {
                  for (var i = 0; i < product?.images?.length; i++) {
                    const images = product?.images[i]?.split("storage");
                    if (images) {
                      if (fs.existsSync("storage" + images[1])) {
                        fs.unlinkSync("storage" + images[1]);
                      }
                    }
                  }
                }
              }
            });
          }

          if (reels.length > 0) {
            await reels.forEach(async (reel) => {
              if (reel.video) {
                const video = reel?.video?.split("storage");
                if (video) {
                  if (fs.existsSync("storage" + video[1])) {
                    fs.unlinkSync("storage" + video[1]);
                  }
                }
              }

              if (reel.thumbnail) {
                const thumbnail = reel?.thumbnail?.split("storage");
                if (thumbnail) {
                  if (fs.existsSync("storage" + thumbnail[1])) {
                    fs.unlinkSync("storage" + thumbnail[1]);
                  }
                }
              }

              await Promise.all([LikeHistoryOfReel.deleteMany({ reelId: reel?._id }), ReportReel.deleteMany({ reelId: reel?._id })]);
              await reel.deleteOne();
            });
          }

          await product.deleteOne();
        });
      }

      if (reelsToDelete.length > 0) {
        await reelsToDelete.map(async (reel) => {
          if (reel?.thumbnail) {
            const thumbnail = reel?.thumbnail?.split("storage");
            if (thumbnail) {
              if (fs.existsSync("storage" + thumbnail[1])) {
                fs.unlinkSync("storage" + thumbnail[1]);
              }
            }
          }

          if (reel?.video) {
            const video = reel?.video?.split("storage");
            if (video) {
              if (fs.existsSync("storage" + video[1])) {
                fs.unlinkSync("storage" + video[1]);
              }
            }
          }

          await LikeHistoryOfReel.deleteMany({ reelId: reel?._id });
          await Reel.deleteOne({ _id: reel?._id });
        });
      }

      await Promise.all([
        Cart.deleteMany({ "items.sellerId": userIsSeller?._id }),
        Follower.deleteMany({ sellerId: userIsSeller?._id }),
        LiveSeller.deleteMany({ sellerId: userIsSeller?._id }),
        LiveSellingHistory.deleteMany({ sellerId: userIsSeller?._id }),
        Notification.deleteMany({ sellerId: userIsSeller?._id }),
        Order.deleteMany({ "items.sellerId": userIsSeller?._id }),
        SellerWallet.deleteMany({ sellerId: userIsSeller?._id }),
        ProductRequest.deleteMany({ seller: userIsSeller?._id }),
        WithdrawRequest.deleteMany({ sellerId: userIsSeller?._id }),
      ]);
    }

    await userIsSeller?.deleteOne();
    await User.deleteOne({ _id: user?._id });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
