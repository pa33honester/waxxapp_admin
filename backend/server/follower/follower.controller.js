const Follower = require("./follower.model");

//import model
const User = require("../user/user.model");
const Seller = require("../seller/seller.model");

//private key
const admin = require("../../util/privateKey");

//mongoose
const mongoose = require("mongoose");

//follow unfollow the seller
exports.followUnfollow = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.sellerId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const user = new mongoose.Types.ObjectId(req.body.userId);
    const seller = new mongoose.Types.ObjectId(req.body.sellerId);

    const [userId, sellerId, follow] = await Promise.all([
      User.findById(user),
      Seller.findById(seller),
      Follower.findOne({
        userId: user,
        sellerId: seller,
      }),
    ]);

    if (!userId) {
      return res.status(200).json({ status: false, message: "user does not found!" });
    }

    if (userId.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!sellerId) {
      return res.status(200).json({ status: false, message: "seller does not found!" });
    }

    if (follow) {
      res.status(200).json({
        status: true,
        message: "Unfollow successfully!",
        isFollow: false,
      });

      await Promise.all([
        Follower.deleteOne({ userId: userId._id, sellerId: sellerId._id }),
        User.updateOne({ _id: userId._id, following: { $gt: 0 } }, { $inc: { following: -1 } }),
        Seller.updateOne({ _id: sellerId._id, followers: { $gt: 0 } }, { $inc: { followers: -1 } }),
      ]);
    } else {
      res.status(200).send({
        status: true,
        message: "follow Successfully!",
        isFollow: true,
      });

      const follower = new Follower({
        userId: userId._id,
        sellerId: sellerId._id,
      });

      await Promise.all([follower.save(), userId.updateOne({ $inc: { following: 1 } }), sellerId.updateOne({ $inc: { followers: 1 } })]);

      // Whatnot-style: surface new follows as a system message in the live
      // chat when the followed seller is currently broadcasting.
      if (sellerId.isLive && sellerId.liveSellingHistoryId) {
        try {
          const { emitLiveSystemMessage } = require("../../util/liveSystemMessage");
          emitLiveSystemMessage({
            liveSellingHistoryId: sellerId.liveSellingHistoryId,
            systemType: "FOLLOW",
            userName: `${userId.firstName || ""} ${userId.lastName || ""}`.trim() || userId.userName || "",
            text: "started following",
          });
        } catch (_) {}
      }

      //notification related
      if (!sellerId.isBlock && sellerId.fcmToken !== null) {
        const payload = {
          token: sellerId.fcmToken,
          notification: {
            title: `${userId.firstName} started following you!`,
          },
          data: {
            data: userId._id.toString(),
            type: "USER",
          },
        };

        const adminPromise = await admin;
        adminPromise
          .messaging()
          .send(payload)
          .then((response) => {
            console.log("Successfully sent with response: ", response);
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get follower list of the particular seller
exports.getSellerFollowers = async (req, res, next) => {
  try {
    if (!req.query.sellerId) {
      const messageText = "sellerId is required.";
      return res.status(200).json({ status: false, message: messageText });
    }

    const sellerId = new mongoose.Types.ObjectId(req.query.sellerId);

    const [seller, followerList] = await Promise.all([
      Seller.findOne({ _id: sellerId }).select("_id isBlock").lean(),
      Follower.find({ sellerId: sellerId }).populate("userId", "_id firstName lastName image").sort({ createdAt: -1 }),
    ]);

    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller not found." });
    }

    if (seller.isBlock) {
      return res.status(200).json({ status: false, message: "This seller is blocked by the admin." });
    }

    return res.status(200).json({
      status: true,
      message: "Seller followers retrieved successfully.",
      followerList,
    });
  } catch (error) {
    console.error(error);
    const messageText = error.message || "Internal Server Error";
    return res.status(500).json({ status: false, message: messageText });
  }
};
