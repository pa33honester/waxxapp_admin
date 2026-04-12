const Seller = require("./seller.model");

//fs
const fs = require("fs");

//config
const config = require("../../config");

//bcrypt
const bcrypt = require("bcryptjs");

//Cryptr
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

//deleteFile
const { deleteFile } = require("../../util/deleteFile");

//deleteFiles
const { deleteFiles } = require("../../util/deleteFile");

//import model
const Reel = require("../reel/reel.model");
const Product = require("../product/product.model");
const ProductRequest = require("../productRequest/productRequest.model");
const Cart = require("../cart/cart.model");
const Order = require("../order/order.model");
const Favorite = require("../favorite/favorite.model");
const Rating = require("../rating/rating.model");
const Review = require("../review/review.model");
const LikeHistoryOfReel = require("../likeHistoryOfReel/likeHistoryOfReel.model");
const User = require("../user/user.model");
const AuctionBid = require("../auctionBid/auctionBid.model");
const ReportReel = require("../reportoReel/reportoReel.model");
const WithdrawRequest = require("../withdrawRequest/withdrawRequest.model");
const SellerWallet = require("../sellerWallet/sellerWallet.model");

const mongoose = require("mongoose");

//generate UniqueId
const generateUniqueId = async () => {
  const random = () => {
    return Math.floor(Math.random() * (999999999 - 100000000)) + 100000000;
  };

  var uniqueId = random();

  let seller = await Seller.findOne({ uniqueId: uniqueId });
  while (seller) {
    uniqueId = random();
    seller = await Seller.findOne({ uniqueId: uniqueId });
  }

  return uniqueId;
};

//seller login
exports.sellerLogin = async (req, res) => {
  try {
    if (!req.body.identity || req.body.loginType === undefined || !req.body.fcmToken) return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    var seller;
    if (req.body.loginType == 1 || req.body.loginType == 2) {
      if (!req.body.email) {
        return res.status(200).json({ status: false, message: "email is required!!" });
      }

      if (req.body.identity) {
        seller = await Seller.findOne({
          $and: [{ identity: req.body.identity }, { email: req.body.email }],
        });
      }
    } else if (req.body.loginType == 3) {
      if (!req.body.email || !req.body.password) {
        return res.status(200).json({
          status: false,
          message: "email and password both must be required!!",
        });
      }

      seller = await Seller.findOne({ email: req.body.email });

      if (seller) {
        // bcrypt password match
        // const isPassword = await bcrypt.compareSync(
        //   req.body.password,
        //   seller?.password
        // );

        // if (!isPassword) {
        //   return res.status(200).json({
        //     status: false,
        //     message: "Oops ! Password doesn't match!!",
        //   });
        // }

        if (cryptr.decrypt(seller?.password) !== req.body.password)
          return res.status(200).json({
            status: false,
            message: "Oops ! Password doesn't match!!",
          });
      }
    }

    if (!seller) {
      return res.status(200).json({ status: false, message: "seller does not found!!" });
    }

    if (seller.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by admin!!" });
    }

    if (seller) {
      seller.fcmToken = req.body.fcmToken ? req.body.fcmToken : seller.fcmToken;
      seller.firstName = req.body.firstName ? req.body.firstName : seller.firstName;
      seller.lastName = req.body.lastName ? req.body.lastName : seller.lastName;

      seller.loginType = req.body.loginType;
      seller.identity = req.body.identity;

      //Update the seller's address fields
      seller.address.address = req.body.address ? req.body.address : seller.address.address;
      seller.address.landMark = req.body.landMark ? req.body.landMark : seller.address.landMark;
      seller.address.city = req.body.city ? req.body.city : seller.address.city;
      seller.address.pinCode = parseInt(req.body.pinCode) ? parseInt(req.body.pinCode) : seller.address.pinCode;
      seller.address.state = req.body.state ? req.body.state : seller.address.state;
      seller.address.country = req.body.country ? req.body.country : seller.address.country;

      //Update the seller's bankDetails fields
      seller.bankDetails.bankBusinessName = req.body.bankBusinessName ? req.body.bankBusinessName : seller.bankDetails.bankBusinessName;
      seller.bankDetails.bankName = req.body.bankName ? req.body.bankName : seller.bankDetails.bankName;
      seller.bankDetails.accountNumber = parseInt(req.body.accountNumber) ? parseInt(req.body.accountNumber) : seller.bankDetails.accountNumber;
      seller.bankDetails.IFSCCode = req.body.IFSCCode ? req.body.IFSCCode : seller.bankDetails.IFSCCode;
      seller.bankDetails.branchName = req.body.branchName ? req.body.branchName : seller.bankDetails.branchName;

      await seller.save();

      return res.status(200).json({ status: true, message: "Seller login Successfully!!", seller });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error!!",
    });
  }
};

//update real seller profile by admin
exports.updateSellerProfile = async (req, res) => {
  try {
    if (!req.query.sellerId) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "sellerId must be requried." });
    }

    const seller = await Seller.findOne({ _id: req.query.sellerId, isFake: false });
    if (!seller) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "seller does not found." });
    }

    if (seller.isBlock) {
      return res.status(200).json({ status: false, message: "you are block by the admin.!" });
    }

    seller.fcmToken = req.body.fcmToken ? req.body.fcmToken : seller.fcmToken;
    seller.firstName = req.body.firstName ? req.body.firstName : seller.firstName;
    seller.lastName = req.body.lastName ? req.body.lastName : seller.lastName;
    seller.businessTag = req.body.businessTag ? req.body.businessTag : seller.businessTag;
    seller.businessName = req.body.businessName ? req.body.businessName : seller.businessName;
    seller.dob = req.body.dob ? req.body.dob : seller.dob;
    seller.gender = req.body.gender ? req.body.gender : seller.gender;
    seller.mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : seller.mobileNumber;

    //update the password if it is not null or undefined
    if (req.body.password !== null && req.body.password !== undefined) {
      seller.password = cryptr.encrypt(req.body.password);
    }

    //Update the address fields
    seller.address.address = req.body.address ? req.body.address : seller.address.address;
    seller.address.landMark = req.body.landMark ? req.body.landMark : seller.address.landMark;
    seller.address.city = req.body.city ? req.body.city : seller.address.city;
    seller.address.pinCode = parseInt(req.body.pinCode) ? parseInt(req.body.pinCode) : seller.address.pinCode;
    seller.address.state = req.body.state ? req.body.state : seller.address.state;
    seller.address.country = req.body.country ? req.body.country : seller.address.country;

    //Update the seller's bankDetails fields
    seller.bankDetails.bankBusinessName = req.body.bankBusinessName ? req.body.bankBusinessName : seller.bankDetails.bankBusinessName;
    seller.bankDetails.bankName = req.body.bankName ? req.body.bankName : seller.bankDetails.bankName;
    seller.bankDetails.accountNumber = parseInt(req.body.accountNumber) ? parseInt(req.body.accountNumber) : seller.bankDetails.accountNumber;
    seller.bankDetails.IFSCCode = req.body.IFSCCode ? req.body.IFSCCode : seller.bankDetails.IFSCCode;
    seller.bankDetails.branchName = req.body.branchName ? req.body.branchName : seller.bankDetails.branchName;

    if (req.files.image) {
      const image = seller?.image?.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }

      seller.image = config?.baseURL + req?.files?.image[0]?.path;
    }

    await seller.save();

    const data = await Seller.findById(seller._id);

    if (data.password) {
      data.password = cryptr.decrypt(data.password);
    }

    return res.status(200).json({
      status: true,
      message: "Seller updated Successfully!",
      seller: data,
    });
  } catch (error) {
    if (req.files) deleteFiles(req.files);
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get seller profile who is login
exports.getProfile = async (req, res) => {
  try {
    if (!req.query.sellerId) return res.status(200).json({ status: false, message: "sellerId must be required!!" });

    const seller = await Seller.findById(req.query.sellerId);
    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller does not found!!" });
    }

    if (seller.isBlock) {
      return res.status(200).json({ status: false, message: "you are block by the admin!" });
    }

    return res.status(200).json({ status: true, message: "Success", seller });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get seller profile by admin
exports.getProfileByAdmin = async (req, res) => {
  try {
    if (!req.query.sellerId) return res.status(200).json({ status: false, message: "sellerId must be required!!" });

    const seller = await Seller.findById(req.query.sellerId);
    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller does not found!!" });
    }

    return res.status(200).json({ status: true, message: "Success", seller });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get real seller for admin
exports.getRealSeller = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const sellers = await Seller.aggregate([
      { $match: { isFake: false } },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "seller",
          as: "products",
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "items.sellerId",
          as: "orders",
        },
      },
      {
        $lookup: {
          from: "users", // Added lookup to the 'users' collection
          localField: "userId", // The field that references users
          foreignField: "_id", // Matching it with the '_id' field in the 'users' collection
          as: "user", // Alias for the joined user data
        },
      },
      {
        $unwind: { path: "$user", preserveNullAndEmptyArrays: false }, // Include documents without a matching user
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          businessTag: 1,
          businessName: 1,
          mobileNumber: 1,
          gender: 1,
          image: 1,
          email: 1,
          password: 1,
          loginType: 1,
          identity: 1,
          uniqueId: 1,
          followers: 1,
          following: 1,
          isSeller: 1,
          isBlock: 1,
          isFake: 1,
          date: 1,
          fcmToken: 1,
          address: 1,
          bankDetails: 1,
          totalProduct: { $size: "$products" },
          totalOrder: { $size: "$orders" },
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $facet: {
          totalSellers: [{ $count: "count" }],
          sellers: [
            { $skip: (start - 1) * limit }, //how many records you want to skip
            { $limit: limit },
          ],
        },
      },
    ]);

    await sellers[0].sellers.forEach((seller) => {
      if (seller.password) {
        seller.password = cryptr.decrypt(seller.password);
      }
    });

    const totalSellers = sellers[0]?.totalSellers[0]?.count || 0;
    const sellersData = sellers[0]?.sellers || [];

    return res.status(200).json({
      status: true,
      message: "Retrive seller Successfully!",
      totalSellers: totalSellers,
      sellers: sellersData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//seller is block or not
exports.blockUnblock = async (req, res) => {
  try {
    if (!req.query.sellerId) {
      return res.status(200).json({ status: false, message: "sellerId must be requried!!" });
    }

    const seller = await Seller.findById(req.query.sellerId);
    if (!seller) {
      return res.status(200).json({ status: false, message: "seller does not found!!" });
    }

    seller.isBlock = !seller.isBlock;
    await seller.save();

    return res.status(200).json({
      status: true,
      message: "Success",
      seller,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get the top sellers for admin (dashboard)
exports.topSellers = async (req, res) => {
  try {
    const topSellers = await Seller.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "seller",
          as: "products",
        },
      },
      {
        $project: {
          firstName: 1,
          lastName: 1,
          businessName: 1,
          image: 1,
          email: 1,
          businessTag: 1,
          mobileNumber: 1,
          totalSales: "$pendingAmount",
          totalProduct: { $size: "$products" },
          totalProductsSold: { $sum: "$products.sold" }, //total products sold for each seller
        },
      },
      //{ $sort: { totalSales: -1 } },
      { $sort: { totalProductsSold: -1 } }, //sort based on total products sold
      { $limit: 10 },
    ]);

    return res.status(200).json({
      status: true,
      message: "get the top sellers list!",
      topSellers,
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get seller wallet for admin
exports.sellerWallet = async (req, res) => {
  try {
    if (!req.query.sellerId) {
      return res.status(200).json({ status: false, message: "sellerId must be requried!!" });
    }

    const seller = await Seller.findById(req.query.sellerId).select("firstName lastName businessTag businessName address email mobileNumber");

    if (!seller) {
      return res.status(200).json({ status: false, message: "seller does not found!!" });
    }

    if (seller.isBlock) {
      return res.status(200).json({ status: false, message: "you are block by the admin.!" });
    }

    return res.status(200).json({
      status: false,
      message: "Retrive the seller wallet",
      seller,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//update password
exports.updatePassword = async (req, res) => {
  try {
    if (!req.query.sellerId) {
      return res.status(200).json({ status: false, message: "sellerId must be requried!" });
    }

    if (!req.body.oldPass || !req.body.newPass || !req.body.confirmPass) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const seller = await Seller.findOne({ _id: req.query.sellerId });
    if (!seller) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (cryptr.decrypt(seller.password) !== req.body.oldPass) {
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
    seller.password = hash;

    await seller.save();

    const data = await Seller.findById(seller._id).select("password _id firstName lastName");
    data.password = cryptr.decrypt(data.password);

    return res.status(200).json({
      status: true,
      message: "finally, Password has been changed by the seller!",
      seller: data,
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
    const seller = await Seller.findOne({ email: req.body.email });
    if (!seller) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    if (seller.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!req.body || !req.body.newPassword || !req.body.confirmPassword) return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });

    if (req.body.newPassword === req.body.confirmPassword) {
      seller.password = cryptr.encrypt(req.body.newPassword);
      await seller.save();

      seller.password = await cryptr.decrypt(seller.password);

      return res.status(200).json({
        status: true,
        message: "Password Changed Successfully!!",
        seller,
      });
    } else {
      return res.status(200).json({ status: false, message: "Password does not matched!!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get all fake sellers when reel or product create by the admin (dropdown)
exports.fakeSellers = async (req, res) => {
  try {
    const seller = await Seller.find({ isFake: true, isBlock: false }).select("firstName lastName").sort({ createdAt: -1 });
    if (!seller) {
      return res.status(200).json({ status: false, message: "Oops ! sellers does not found!" });
    }

    return res.status(200).json({
      status: true,
      message: "finally, get all fake sellers by admin!",
      seller: seller,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//create fake seller by admin
exports.createFakeSeller = async (req, res) => {
  try {
    if (!req.body || !req.body.firstName || !req.body.lastName || !req.body.mobileNumber || !req.body.email || !req.body.gender || !req.body.businessName || !req.body.businessTag || !req.files) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const seller = new Seller();

    seller.firstName = req?.body?.firstName;
    seller.lastName = req?.body?.lastName;
    seller.businessName = req?.body?.businessName;
    seller.businessTag = req?.body?.businessTag;
    seller.mobileNumber = req?.body?.mobileNumber;
    seller.gender = req?.body?.gender;
    seller.email = req?.body?.email;
    seller.password = cryptr.encrypt(req?.body?.password);
    seller.isFake = true;
    seller.uniqueId = await Promise.resolve(generateUniqueId());
    seller.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    //seller's address fields
    seller.address.address = req?.body?.address;
    seller.address.landMark = req?.body?.landMark;
    seller.address.city = req?.body?.city;
    seller.address.pinCode = req?.body?.pinCode;
    seller.address.state = req?.body?.state;
    seller.address.country = req?.body?.country;

    //seller's bankDetails fields
    seller.bankDetails.bankBusinessName = req?.body?.bankBusinessName;
    seller.bankDetails.bankName = req?.body?.bankName;
    seller.bankDetails.accountNumber = req?.body?.accountNumber;
    seller.bankDetails.IFSCCode = req?.body?.IFSCCode;
    seller.bankDetails.branchName = req?.body?.branchName;

    if (req.files.image) {
      const image = seller.image?.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }

      seller.image = config.baseURL + req.files.image[0].path;
    }

    if (req.files.video) {
      const video = seller.video?.split("storage");
      if (video) {
        if (fs.existsSync("storage" + video[1])) {
          fs.unlinkSync("storage" + video[1]);
        }
      }

      seller.video = config.baseURL + req.files.video[0].path;
    }

    await seller.save();

    const sellerData = await Seller.findById(seller._id);
    sellerData.password = cryptr.decrypt(sellerData.password);

    return res.status(200).json({
      status: true,
      message: "finally, fakeSeller added by the admin!",
      sellerData,
    });
  } catch (error) {
    if (req.files) deleteFiles(req.files);
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//update fakeSeller profile for admin
exports.updateFakeSellerProfile = async (req, res) => {
  try {
    if (!req.query.sellerId) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "sellerId must be requried." });
    }

    const seller = await Seller.findById(req.query.sellerId);
    if (!seller) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "seller does not found." });
    }

    if (seller.isBlock) {
      return res.status(200).json({ status: false, message: "you are block by the admin.!" });
    }

    seller.firstName = req.body.firstName ? req.body.firstName : seller.firstName;
    seller.lastName = req.body.lastName ? req.body.lastName : seller.lastName;
    seller.businessTag = req.body.businessTag ? req.body.businessTag : seller.businessTag;
    seller.businessName = req.body.businessName ? req.body.businessName : seller.businessName;
    seller.gender = req.body.gender ? req.body.gender : seller.gender;
    seller.mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : seller.mobileNumber;

    if (req.files.image) {
      const image = seller.image?.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }

      seller.image = config.baseURL + req.files.image[0].path;
    }

    if (req.files.video) {
      const video = seller.video?.split("storage");
      if (video) {
        if (fs.existsSync("storage" + video[1])) {
          fs.unlinkSync("storage" + video[1]);
        }
      }

      seller.video = config.baseURL + req.files.video[0].path;
    }

    await seller.save();

    const data = await Seller.findById(seller._id);
    data.password = cryptr.decrypt(data.password);

    return res.status(200).json({
      status: true,
      message: "Fake Seller updated Successfully!",
      seller: data,
    });
  } catch (error) {
    if (req.files) deleteFiles(req.files);
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//fakeSeller is live or not handled for admin
exports.liveOrNot = async (req, res) => {
  try {
    if (!req.query.sellerId) {
      return res.status(200).json({ status: false, message: "sellerId must be requried!!" });
    }

    const seller = await Seller.findById(req.query.sellerId);
    if (!seller) {
      return res.status(200).json({ status: false, message: "seller does not found!" });
    }

    seller.isLive = !seller.isLive;
    await seller.save();

    return res.status(200).json({
      status: true,
      message: "Success",
      seller,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get all fake seller for admin
exports.getFakeSeller = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const [totalSellers, sellers] = await Promise.all([
      Seller.countDocuments({ isFake: true, isBlock: false }),
      Seller.find({ isFake: true, isBlock: false })
        .skip((start - 1) * limit)
        .limit(limit),
    ]);

    await sellers.forEach((seller) => {
      if (seller.password) {
        seller.password = cryptr.decrypt(seller.password);
      }
    });

    return res.status(200).json({
      status: true,
      message: "finally, get the fake sellers Successfully!",
      totalSellers: totalSellers,
      sellers: sellers,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//delete fake seller for admin
exports.deleteSeller = async (req, res) => {
  try {
    if (!req.query.sellerId) {
      return res.status(200).json({ status: false, message: "sellerId must be requried!!" });
    }

    const seller = await Seller.findOne({ _id: req.query.sellerId, isFake: true });
    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller does not found!" });
    }

    res.status(200).json({
      status: true,
      message: "FakeSeller has been deleted!",
    });

    if (seller?.image) {
      const image = seller?.image?.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }
    }

    if (seller?.video) {
      const video = seller?.video?.split("storage");
      if (video) {
        if (fs.existsSync("storage" + video[1])) {
          fs.unlinkSync("storage" + video[1]);
        }
      }
    }

    const products = await Product.find({ seller: seller._id });

    if (products.length > 0) {
      await products.forEach(async (product) => {
        if (product.mainImage) {
          const mainImage = product?.mainImage?.split("storage");
          if (mainImage) {
            if (fs.existsSync("storage" + mainImage[1])) {
              fs.unlinkSync("storage" + mainImage[1]);
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
            await reel?.deleteOne();
          });
        }

        await product.deleteOne();
      });
    }

    await Promise.all([WithdrawRequest.deleteMany({ sellerId: seller?._id }), SellerWallet.deleteMany({ sellerId: seller?._id })]);
    await seller.deleteOne();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get seller profile for user
exports.fetchSellerProfile = async (req, res) => {
  try {
    const { sellerId, loggedInUserId } = req.query;

    if (!sellerId || !loggedInUserId) {
      return res.status(400).json({ status: false, message: "sellerId and loggedInUserId must be provided" });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const userObjectId = new mongoose.Types.ObjectId(loggedInUserId);

    const [user, sellerData] = await Promise.all([
      User.findById(userObjectId).lean(),
      Seller.aggregate([
        { $match: { _id: sellerObjectId } },
        {
          $lookup: {
            from: "followers",
            let: { sellerId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$sellerId", "$$sellerId"] }, { $eq: ["$userId", userObjectId] }],
                  },
                },
              },
            ],
            as: "followStatus",
          },
        },
        {
          $lookup: {
            from: "products",
            let: { sellerId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$seller", "$$sellerId"] },
                },
              },
              {
                $lookup: {
                  from: "favorites",
                  let: { productId: "$_id" },
                  pipeline: [
                    {
                      $match: {
                        $expr: {
                          $and: [{ $eq: ["$productId", "$$productId"] }, { $eq: ["$userId", userObjectId] }],
                        },
                      },
                    },
                  ],
                  as: "favoriteStatus",
                },
              },
              {
                $addFields: {
                  isFavorite: { $gt: [{ $size: "$favoriteStatus" }, 0] },
                },
              },
              {
                $project: {
                  productName: 1,
                  description: 1,
                  price: 1,
                  mainImage: 1,
                  category: 1,
                  enableAuction: 1,
                  auctionEndDate: 1,
                  isFavorite: 1,
                },
              },
              {
                $group: {
                  _id: "$category",
                  products: { $push: "$$ROOT" },
                },
              },
              {
                $lookup: {
                  from: "categories",
                  localField: "_id",
                  foreignField: "_id",
                  as: "categoryData",
                },
              },
              {
                $unwind: {
                  path: "$categoryData",
                  preserveNullAndEmptyArrays: true,
                },
              },
              {
                $project: {
                  _id: 0,
                  categoryId: "$_id",
                  categoryName: "$categoryData.name",
                  products: 1,
                },
              },
            ],
            as: "productsByCategory",
          },
        },
        {
          $project: {
            firstName: 1,
            lastName: 1,
            businessName: 1,
            businessTag: 1,
            image: 1,
            followers: 1,
            following: 1,
            isFollow: { $gt: [{ $size: "$followStatus" }, 0] },
            productsByCategory: 1,
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    const seller = sellerData[0];
    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller not found!" });
    }

    return res.status(200).json({
      status: true,
      message: "Success",
      data: seller,
    });
  } catch (error) {
    console.error("fetchSellerProfile error:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
