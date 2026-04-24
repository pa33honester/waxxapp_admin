const Reel = require("../reel/reel.model");

//import model
const Seller = require("../seller/seller.model");
const Product = require("../product/product.model");
const User = require("../user/user.model");
const LikeHistoryOfReel = require("../likeHistoryOfReel/likeHistoryOfReel.model");
const ReportReel = require("../reportoReel/reportoReel.model");
const Notification = require("../notification/notification.model");

//fs
const fs = require("fs");

//config
const config = require("../../config");

//deleteFiles
const { deleteFiles } = require("../../util/deleteFile");

//firebase admin (FCM)
const admin = require("../../util/privateKey");

//mongoose
const mongoose = require("mongoose");

//get real reels by the admin
exports.getRealReels = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const [totalReels, reels] = await Promise.all([
      Reel.countDocuments({ isFake: false }),
      Reel.aggregate([
        { $match: { isFake: false } },
        {
          $lookup: {
            from: "sellers",
            localField: "sellerId",
            foreignField: "_id",
            as: "sellerId",
          },
        },
        { $unwind: { path: "$sellerId", preserveNullAndEmptyArrays: false } },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "products",
          },
        },
        {
          $lookup: {
            from: "likehistoryofreels",
            localField: "_id",
            foreignField: "reelId",
            as: "totalLikes",
          },
        },
        {
          $addFields: {
            like: { $size: "$totalLikes" },
          },
        },
        {
          $project: {
            thumbnail: 1,
            video: 1,
            description: 1,
            thumbnailType: 1,
            videoType: 1,
            isFake: 1,
            like: 1,
            createdAt: 1,
            products: {
              _id: 1,
              productCode: 1,
              price: 1,
              shippingCharges: 1,
              createStatus: 1,
              attributes: 1,
              productName: 1,
              mainImage: 1,
              seller: 1,
            },
            "sellerId._id": 1,
            "sellerId.firstName": 1,
            "sellerId.lastName": 1,
            "sellerId.businessTag": 1,
            "sellerId.businessName": 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrieve the real reels by the admin!",
      totalReels,
      reels,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//upload fake reels by the admin
exports.uploadReelByAdmin = async (req, res) => {
  try {
    const { sellerId } = req.body;
    let { productIds } = req.body;

    if (typeof productIds === "string") {
      try {
        productIds = JSON.parse(productIds);
      } catch (e) {
        productIds = productIds.replace(/[\[\]\s]/g, "").split(",");
      }
    }

    if (!sellerId || !Array.isArray(productIds) || productIds.length === 0 || !req.files) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    if (typeof productIds === "string") {
      try {
        productIds = JSON.parse(productIds);
      } catch (e) {
        productIds = productIds.replace(/[\[\]\s]/g, "").split(",");
      }
    }

    const [seller, validProducts] = await Promise.all([
      Seller.findOne({ _id: sellerId, isFake: true }),
      Product.find({
        _id: { $in: productIds },
        createStatus: "Approved",
      }),
    ]);

    if (!seller) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Seller not found!" });
    }

    if (seller.isBlock) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "You are blocked by admin!" });
    }

    if (!validProducts || validProducts.length === 0) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "No valid approved products found!" });
    }

    const reel = new Reel();

    reel.sellerId = seller._id;
    reel.productId = validProducts.map((p) => p._id);
    reel.duration = req?.body?.duration;
    reel.isFake = true;

    if (req?.files?.video) {
      const video = reel?.video?.split("storage");

      if (video) {
        if (fs.existsSync("storage" + video[1])) {
          fs.unlinkSync("storage" + video[1]);
        }
      }

      reel.videoType = 1;
      reel.video = config.baseURL + req.files.video[0].path;
    } else {
      reel.videoType = 2;
      reel.video = req?.body?.video;
    }

    if (req?.files?.thumbnail) {
      const thumbnail = reel?.thumbnail?.split("storage");
      if (thumbnail) {
        if (fs.existsSync("storage" + thumbnail[1])) {
          fs.unlinkSync("storage" + thumbnail[1]);
        }
      }

      reel.thumbnailType = 1;
      reel.thumbnail = config.baseURL + req.files.thumbnail[0].path;
    } else {
      reel.thumbnailType = 2;
      reel.thumbnail = req?.body?.thumbnail;
    }

    await reel.save();

    const data = await Reel.findById(reel._id).populate([
      { path: "sellerId", select: "firstName lastName businessTag businessName" },
      { path: "productId", select: "productName productCode price shippingCharges mainImage seller createStatus attributes" },
    ]);

    return res.status(200).json({
      status: true,
      message: "Reel has been uploaded by the seller!",
      reel: data,
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

//update fake reel by the admin
exports.updateReelByAdmin = async (req, res) => {
  try {
    if (!req.query.sellerId || !req.query.reelId) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const reel = await Reel.findOne({ _id: req.query.reelId, sellerId: req.query.sellerId, isFake: true });
    if (!reel) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ satus: false, message: "reel does not found for that seller!" });
    }

    if (req.body.productId) {
      const product = await Product.findOne({ _id: req.body.productId, createStatus: "Approved" });
      if (!product) {
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({ status: false, message: "Product does not found!" });
      }

      reel.productId = req.body.productId ? product._id : reel.productId;
    }

    if (req?.files?.video) {
      const video = reel?.video?.split("storage");
      if (video) {
        if (fs.existsSync("storage" + video[1])) {
          fs.unlinkSync("storage" + video[1]);
        }
      }

      reel.video = config?.baseURL + req?.files?.video[0].path;
    }

    if (req?.files?.thumbnail) {
      const thumbnail = reel?.thumbnail?.split("storage");
      if (thumbnail) {
        if (fs.existsSync("storage" + thumbnail[1])) {
          fs.unlinkSync("storage" + thumbnail[1]);
        }
      }

      reel.thumbnail = config.baseURL + req.files.thumbnail[0].path;
    }

    if (Number(req?.body.videoType) === 2) {
      if (reel.videoType === 1) {
        const video = reel?.video?.split("storage");
        if (video) {
          if (fs.existsSync("storage" + video[1])) {
            fs.unlinkSync("storage" + video[1]);
          }
        }
      }

      reel.videoType = 2;
      reel.video = req?.body?.video;
    }

    if (Number(req?.body.thumbnailType) === 2) {
      if (reel.thumbnailType === 1) {
        const thumbnail = reel?.thumbnail?.split("storage");
        if (thumbnail) {
          if (fs.existsSync("storage" + thumbnail[1])) {
            fs.unlinkSync("storage" + thumbnail[1]);
          }
        }
      }

      reel.thumbnailType = 2;
      reel.thumbnail = req?.body?.thumbnail;
    }

    reel.duration = req.body.duration ? req.body.duration : reel.duration;
    await reel.save();

    const data = await Reel.findById(reel._id).populate([
      { path: "sellerId", select: "firstName lastName businessTag businessName" },
      { path: "productId", select: "productName productCode price shippingCharges mainImage seller createStatus attributes" },
    ]);

    return res.status(200).json({
      status: true,
      message: "Reel has been updated by the admin.",
      reel: data,
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

//get fake reels by the admin
exports.getFakeReels = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const [totalReels, reels] = await Promise.all([
      Reel.find({ isFake: true }).countDocuments(),
      Reel.find({ isFake: true })
        .populate([
          { path: "sellerId", select: "firstName lastName businessTag businessName" },
          { path: "productId", select: "productName productCode price shippingCharges mainImage seller createStatus attributes" },
        ])
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit),
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrive the fake reels by the admin!",
      totalReels: totalReels,
      reels: reels,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//delete reel by the admin and seller
exports.deleteReel = async (req, res) => {
  try {
    if (!req.query.reelId) {
      return res.status(200).json({ status: false, message: "reelId must be requried!" });
    }

    const reelId = new mongoose.Types.ObjectId(req.query.reelId);

    const reel = await Reel.findOne({ _id: reelId });
    if (!reel) {
      return res.status(200).json({ satus: false, message: "reel does not found!" });
    }

    res.status(200).json({
      status: true,
      message: "Reel has been deleted!",
    });

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

    await Promise.all([LikeHistoryOfReel.deleteMany({ reelId: reelId }), ReportReel.deleteMany({ reelId: reelId })]);

    await reel.deleteOne();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get particular reels information for the admin
exports.detailsOfReel = async (req, res, next) => {
  try {
    if (!req.query.reelId) {
      return res.status(200).json({ status: false, message: "reelId must be requried!" });
    }

    const reel = await Reel.findOne({ _id: req.query.reelId })
      .populate("sellerId", "firstName lastName businessTag businessName image")
      .populate("productId", "productName productCode price shippingCharges mainImage seller createStatus attributes");

    if (!reel) {
      return res.status(200).json({ satus: false, message: "Reel does not found!" });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive details of the reel by the admin!",
      reel: reel,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//upload reel by the seller
exports.uploadReel = async (req, res) => {
  try {
    const { sellerId, duration, description, video, thumbnail } = req.body;
    let { productIds } = req.body;

    if (typeof productIds === "string") {
      try {
        productIds = JSON.parse(productIds);
      } catch (e) {
        productIds = productIds.replace(/[\[\]\s]/g, "").split(",");
      }
    }

    if (!sellerId || !Array.isArray(productIds) || productIds.length === 0 || !req.files) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const [seller, validProducts] = await Promise.all([
      Seller.findOne({ _id: sellerId, isFake: false }),
      Product.find({
        _id: { $in: productIds },
        createStatus: "Approved",
      }),
    ]);

    if (!seller) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Seller not found!" });
    }

    if (seller.isBlock) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "You are blocked by admin!" });
    }

    if (!validProducts || validProducts.length === 0) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "No valid approved products found!" });
    }

    const reel = new Reel();
    reel.sellerId = seller._id;
    reel.productId = validProducts.map((p) => p._id);
    reel.duration = duration || 0;
    reel.description = description || validProducts[0].description;

    if (req.files.video && req.files.video[0]) {
      const videoParts = reel?.video?.split("storage");
      if (videoParts && videoParts[1] && fs.existsSync("storage" + videoParts[1])) {
        fs.unlinkSync("storage" + videoParts[1]);
      }

      reel.videoType = 1;
      reel.video = config.baseURL + req.files.video[0].path;
    } else {
      reel.videoType = 2;
      reel.video = video;
    }

    if (req.files.thumbnail && req.files.thumbnail[0]) {
      const thumbParts = reel?.thumbnail?.split("storage");
      if (thumbParts && thumbParts[1] && fs.existsSync("storage" + thumbParts[1])) {
        fs.unlinkSync("storage" + thumbParts[1]);
      }

      reel.thumbnailType = 1;
      reel.thumbnail = config.baseURL + req.files.thumbnail[0].path;
    } else {
      reel.thumbnailType = 2;
      reel.thumbnail = thumbnail;
    }

    await reel.save();

    const data = await Reel.findById(reel._id).populate([
      { path: "sellerId", select: "firstName lastName businessTag businessName" },
      {
        path: "productId",
        select: "productName productCode price shippingCharges mainImage seller createStatus attributes",
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Reel uploaded successfully for multiple products!",
      reel: data,
    });
  } catch (error) {
    if (req.files) deleteFiles(req.files);
    console.error("uploadReel error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//if isFakeData switch on then get all (real + fake) reels by the user otherwise only get all real reels by the user
exports.getReelsForUser = async (req, res) => {
  try {
    const { userId, reelId } = req.query;

    if (!userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const skip = (start - 1) * limit;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    const basePipeline = [
      {
        $lookup: {
          from: "likehistoryofreels",
          let: { reelId: "$_id", userId: user._id },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$reelId", "$$reelId"] }, { $eq: ["$userId", "$$userId"] }],
                },
              },
            },
          ],
          as: "likeHistoryofReel",
        },
      },
      {
        $project: {
          video: 1,
          videoType: 1,
          thumbnail: 1,
          thumbnailType: 1,
          duration: 1,
          productId: 1,
          sellerId: 1,
          like: 1,
          isFake: 1,
          description: 1,
          createdAt: 1,
          isLike: {
            $cond: [{ $eq: [{ $size: "$likeHistoryofReel" }, 0] }, false, true],
          },
        },
      },
      { $sort: { createdAt: -1 } },
    ];

    let allReels = [];

    if (global.settingJSON.isFakeData) {
      const [realReels, fakeReels] = await Promise.all([
        Reel.aggregate([{ $match: { isFake: false } }, ...basePipeline, { $skip: skip }, { $limit: limit }]),
        Reel.aggregate([{ $match: { isFake: true } }, ...basePipeline, { $skip: skip }, { $limit: limit }]),
      ]);
      allReels = [...realReels, ...fakeReels];
    } else {
      allReels = await Reel.aggregate([{ $match: { isFake: false } }, ...basePipeline, { $skip: skip }, { $limit: limit }]);
    }

    if (reelId) {
      const reelIndex = allReels.findIndex((r) => r._id.toString() === reelId.toString());
      if (reelIndex !== -1) {
        const [targetReel] = allReels.splice(reelIndex, 1);
        allReels.unshift(targetReel);
      }
    }

    const populatedReels = await Reel.populate(allReels, [
      {
        path: "productId",
        select: "productName productCode price shippingCharges mainImage seller createStatus attributes description productSaleType auctionEndDate",
      },
      {
        path: "sellerId",
        select: "firstName lastName businessTag businessName image",
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Reels retrieved successfully",
      reels: populatedReels,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get particular seller's reel by the seller
exports.reelsOfSeller = async (req, res) => {
  try {
    if (!req.query.sellerId) {
      return res.status(200).json({ status: false, message: "sellerId  must be requried." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const reel = await Reel.find({ sellerId: req.query.sellerId })
      .populate([
        { path: "sellerId", select: "firstName lastName businessTag businessName" },
        { path: "productId", select: "productName productCode price shippingCharges mainImage seller createStatus attributes description" },
      ])
      .sort({ createdAt: -1 })
      .skip((start - 1) * limit)
      .limit(limit);

    if (!reel) {
      return res.status(200).json({ satus: false, message: "reel does not found for that seller!" });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive reels by the seller!",
      reels: reel,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//create like or dislike of reel by the user
exports.likeOrDislikeOfReel = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.reelId)
      return res.status(200).json({
        status: false,
        message: "Oops ! Invalid details!",
      });

    const [user, reel, alreadylikedReel] = await Promise.all([
      User.findOne({ _id: req.query.userId }),
      Reel.findById(req.query.reelId),
      LikeHistoryOfReel.findOne({
        userId: req.query.userId,
        reelId: req.query.reelId,
      }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!reel) {
      return res.status(200).json({ status: false, message: "reel does not found!" });
    }

    if (alreadylikedReel) {
      await Promise.all([LikeHistoryOfReel.deleteOne({ userId: user._id, reelId: reel._id }), Reel.updateOne({ _id: reel._id, like: { $gt: 0 } }, { $inc: { like: -1 } })]);

      return res.status(200).json({
        status: true,
        message: "finally, reel dislike done by the user!",
        isLike: false,
      });
    } else {
      const likeHistoryOfReel = new LikeHistoryOfReel();

      likeHistoryOfReel.userId = user._id;
      likeHistoryOfReel.reelId = reel._id;

      await Promise.all([likeHistoryOfReel.save(), reel.updateOne({ $inc: { like: 1 } })]);

      res.status(200).json({
        status: true,
        message: "finally, reel like done by the user!",
        isLike: true,
      });

      // Fire-and-forget seller notification. The HTTP response is already
      // sent so the buyer's like button is never blocked on FCM latency.
      (async () => {
        try {
          if (!reel.sellerId) return;
          const seller = await Seller.findById(reel.sellerId).select("fcmToken isBlock").lean();
          if (!seller || seller.isBlock) return;

          const likerName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.userName || "Someone";

          const notif = new Notification();
          notif.userId = user._id;
          notif.sellerId = reel.sellerId;
          notif.title = `${likerName} liked your video`;
          notif.message = "";
          notif.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
          await notif.save();

          if (seller.fcmToken) {
            const adminPromise = await admin;
            await adminPromise.messaging().send({
              token: seller.fcmToken,
              notification: { title: `${likerName} liked your video` },
              data: {
                type: "REEL_LIKED",
                reelId: reel._id.toString(),
                userId: user._id.toString(),
              },
            });
          }
        } catch (err) {
          console.error("reel like notification error:", err);
        }
      })();

      return;
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get particular reel's like history for the admin
exports.likeHistoryOfReel = async (req, res, next) => {
  try {
    if (!req.query.reelId) {
      return res.status(200).json({ status: false, message: "reelId must be requried!" });
    }

    const [reel, likeHistoryOfReel] = await Promise.all([
      Reel.findOne({ _id: req?.query?.reelId }),
      LikeHistoryOfReel.find({ reelId: req?.query?.reelId }).populate("userId", "firstName lastName image"),
    ]);

    if (!reel) {
      return res.status(200).json({ status: false, message: "Reel does not found!" });
    }

    if (!likeHistoryOfReel) {
      return res.status(200).json({ satus: false, message: "likeHistoryOfReel does not found!" });
    }

    return res.status(200).json({ satus: true, message: "finally, get likeHistory of the particular reel.", likeHistoryOfReel: likeHistoryOfReel });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
