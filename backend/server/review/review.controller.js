const Review = require("./review.model");

//import model
const Product = require("../product/product.model");
const User = require("../user/user.model");
const Notification = require("../notification/notification.model");

//private key
const admin = require("../../util/privateKey");

//dayjs
const dayjs = require("dayjs");

//moment
const moment = require("moment");

//mongoose
const mongoose = require("mongoose");

//create review by user
exports.store = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.productId || !req.body.review) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const [user, product, reviewExist] = await Promise.all([
      User.findById(req.body.userId),
      Product.findOne({ _id: req.body.productId }).populate("seller", "isBlock fcmToken"),
      Review.findOne({ userId: req.body.userId, productId: req.body.productId }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    if (!product) {
      return res.status(200).json({ status: false, message: "No product Was Found!!" });
    }

    if (reviewExist) {
      return res.status(200).json({
        status: false,
        message: "You don't have right to give review because you have already given review on this product!!",
      });
    }

    const review = new Review();

    review.userId = user._id;
    review.productId = product._id;
    review.review = req.body.review;
    review.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    product.review += 1;

    await Promise.all([review.save(), product.save()]);

    res.status(200).json({
      status: true,
      message: "Review given by the user for products!",
      review,
    });

    if (!product?.seller?.isBlock && product?.seller?.fcmToken !== null) {
      const payload = {
        token: product.seller.fcmToken,
        notification: {
          title: `Product Review`,
          message: `Feedback Received from ${user.firstName} for Your Order!`,
        },
      };

      const adminPromise = await admin;
      adminPromise
        .messaging()
        .send(payload)
        .then(async (response) => {
          console.log("Successfully sent with response: ", response);

          const notification = new Notification();
          notification.userId = user._id;
          notification.image = user.image;
          notification.sellerId = product.seller;
          notification.title = payload.notification.title;
          notification.message = payload.notification.message;
          notification.notificationType = 3;
          notification.date = moment(new Date());
          await notification.save();
        })
        .catch((error) => {
          console.log("Error sending message:      ", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(200).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get product reviews for admin and user
exports.getreview = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let now = dayjs();

    if (!req.query.productId) {
      return res.status(200).json({ status: false, message: "OOps ! Invalid details." });
    }

    const productId = new mongoose.Types.ObjectId(req.query.productId);

    const [product, reviews] = await Promise.all([
      Product.findById(productId),
      Review.aggregate([
        {
          $match: { productId: productId },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $lookup: {
            from: "ratings",
            let: { productId: "$productId", userId: "$userId" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$productId", "$$productId"] }, { $eq: ["$userId", "$$userId"] }],
                  },
                },
              },
            ],
            as: "rating",
          },
        },
        {
          $project: {
            review: 1,
            date: 1,
            createdAt: 1,
            productId: 1,
            userId: "$user._id",
            firstName: "$user.firstName",
            lastName: "$user.lastName",
            userImage: "$user.image",
            rating: { $ifNull: [{ $arrayElemAt: ["$rating.rating", 0] }, 0] },
          },
        },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    if (!product) {
      return res.status(200).json({ status: false, message: "No product Was Found." });
    }

    const data = reviews.map((data) => ({
      ...data,
      time:
        now.diff(data.createdAt, "minute") <= 60 && now.diff(data.createdAt, "minute") >= 0
          ? now.diff(data.createdAt, "minute") + " minutes ago"
          : now.diff(data.createdAt, "hour") >= 24
            ? dayjs(data.createdAt).format("DD, MM, YYYY")
            : now.diff(data.createdAt, "hour") + " hours ago",
    }));

    return res.status(200).json({
      status: data.length > 0 ? true : false,
      message: data.length > 0 ? "Success" : "No Data Found.",
      reviews: data.length > 0 ? data : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//destroy review for admin
exports.destroy = async (req, res) => {
  try {
    const review = await Review.findById(req.query.reviewId);
    if (!review) {
      return res.status(200).json({ status: false, message: "review does not found." });
    }

    if (review.productId !== null) {
      await Product.updateOne({ _id: review.productId }, { $inc: { review: -1 } }).where({ review: { $gt: 0 } });
    }

    await review.deleteOne();

    return res.status(200).json({ status: true, message: "Success" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal erver Error" });
  }
};
