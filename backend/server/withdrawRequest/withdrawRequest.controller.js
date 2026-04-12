const WithDrawRequest = require("../../server/withdrawRequest/withdrawRequest.model");
const Seller = require("../../server/seller/seller.model");
const SellerWallet = require("../../server/sellerWallet/sellerWallet.model");

//private key
const admin = require("../../util/privateKey");

const mongoose = require("mongoose");

const { generateHistoryUniqueId } = require("../../util/generateHistoryUniqueId");

//Withdraw request made by particular seller ( seller )
exports.initiateCashOut = async (req, res) => {
  try {
    const { sellerId, paymentGateway, paymentDetails, amount } = req.body;
    console.log("req.body : ", req.body);

    if (!sellerId || !paymentGateway || !paymentDetails || !amount) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const withdrawalAmount = Number(amount);

    const [seller, pendingRequest, declinedRequest] = await Promise.all([
      Seller.findOne({ _id: sellerObjectId }).select("_id netPayout isBlock fcmToken").lean(),
      WithDrawRequest.findOne({ sellerId: sellerObjectId, status: 1 }).select("_id").lean(),
      WithDrawRequest.findOne({ sellerId: sellerObjectId, status: 3 }).select("_id").lean(),
    ]);

    if (!seller) {
      return res.status(200).json({ status: false, message: "User not found." });
    }

    if (seller.isBlock) {
      return res.status(403).json({ status: false, message: "You are blocked by admin!" });
    }

    if (!settingJSON) {
      return res.status(200).json({ status: false, message: "Settings not found." });
    }

    if (withdrawalAmount > seller.netPayout) {
      return res.status(200).json({ status: false, message: "Insufficient funds to withdraw." });
    }

    if (withdrawalAmount < settingJSON.minPayout) {
      return res.status(200).json({ status: false, message: "Requested amount must be greater than the minimum payout." });
    }

    if (pendingRequest) {
      return res.status(200).json({
        status: false,
        message: "Your withdrawal request is already pending with the admin.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Your withdrawal request has been successfully submitted.",
    });

    const uniqueId = generateHistoryUniqueId();
    const trimmedPaymentGateway = paymentGateway.trim();
    const formattedDetails = paymentDetails.map((detail) => detail.replace("[", "").replace("]", ""));

    if (declinedRequest) {
      await WithDrawRequest.deleteOne({ _id: declinedRequest._id });
    }

    await Promise.all([
      WithDrawRequest.create({
        sellerId: sellerObjectId,
        amount: withdrawalAmount,
        paymentGateway: trimmedPaymentGateway,
        paymentDetails: formattedDetails,
        uniqueId: uniqueId,
        requestDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      }),
    ]);

    if (seller.fcmToken !== null) {
      const payload = {
        token: seller.fcmToken,
        notification: {
          title: "💰 Withdrawal Request Received! 🚀",
          body: "Great news! Your withdrawal request has been submitted successfully. Our team is on it! ✅",
        },
        data: { type: "WITHDRAWREQUEST" },
      };

      const adminPromise = await admin;
      adminPromise
        .messaging()
        .send(payload)
        .then((response) => console.log("Notification sent:", response))
        .catch((error) => console.error("Error sending notification:", error));
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//get all withdraw requests ( seller )
exports.getWithdrawalRequestsBySeller = async (req, res) => {
  try {
    const { startDate, endDate, sellerId } = req.query;

    if (!startDate || !endDate || !sellerId) {
      return res.status(200).json({
        status: false,
        message: "Missing required parameters: startDate, endDate, or sellerId",
      });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    let dateFilterQuery = {};
    if (startDate !== "All" && endDate !== "All") {
      const startDateObj = new Date(startDate);
      const endDateObj = new Date(endDate);
      endDateObj.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: startDateObj,
          $lte: endDateObj,
        },
      };
    }

    const withdrawalRequests = await WithDrawRequest.find({
      ...dateFilterQuery,
      sellerId: sellerId,
    })
      .skip((start - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: true,
      message: "Seller withdrawal requests fetched successfully!",
      data: withdrawalRequests,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get all withdraw requests ( admin )
exports.listWithdrawalRequests = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate || !req.query.type) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    let typeQuery = {};
    if (req.query.type !== "All") {
      typeQuery.status = parseInt(req.query.type);
    }

    let dateFilterQuery = {};
    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const [total, request] = await Promise.all([
      WithDrawRequest.countDocuments({ ...dateFilterQuery, ...typeQuery }),
      WithDrawRequest.find({ ...dateFilterQuery, ...typeQuery })
        .populate("sellerId", "firstName lastName businessTag businessName uniqueId image")
        .skip((start - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean(),
    ]);

    return res.status(200).json({
      status: true,
      message: "Withdrawal requests fetched successfully!",
      total,
      data: request,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//accept withdraw request ( admin )
exports.approveWithdrawalRequest = async (req, res) => {
  try {
    const { requestId, personId } = req.query;

    if (!requestId || !personId) {
      return res.status(200).json({ status: false, message: "Invalid details." });
    }

    const [request, sellerAccount] = await Promise.all([
      WithDrawRequest.findById(requestId).select("status userId amount uniqueId").lean(),
      Seller.findById(personId).select("isBlock fcmToken netPayout").lean(),
    ]);

    if (!request) {
      return res.status(200).json({ status: false, message: "Withdrawal Request not found." });
    }

    if (request.status === 2) {
      return res.status(200).json({ status: false, message: "Withdrawal request already accepted." });
    }

    if (request.status === 3) {
      return res.status(200).json({ status: false, message: "Withdrawal request already declined." });
    }

    if (!sellerAccount) {
      return res.status(200).json({ status: false, message: "Seller does not found." });
    }

    if (sellerAccount.isBlock) {
      return res.status(403).json({ status: false, message: "Seller is blocked by admin." });
    }

    if (sellerAccount.netPayout < request.amount) {
      return res.status(200).json({ status: false, message: "Insufficient balance to approve this withdrawal request." });
    }

    res.status(200).json({
      status: true,
      message: "Withdrawal request accepted and processed.",
    });

    const updates = [];

    updates.push(
      Seller.updateOne(
        { _id: personId, netPayout: { $gte: request.amount } },
        {
          $inc: {
            netPayout: -request.amount,
            amountWithdrawn: request.amount,
          },
        }
      ),
      SellerWallet.create({
        transactionType: 2,
        sellerId: sellerAccount._id,
        amount: request.amount,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      })
    );

    updates.push(
      WithDrawRequest.updateOne(
        { _id: request._id },
        {
          $set: {
            status: 2,
            acceptOrDeclineDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
          },
        }
      )
    );

    await Promise.all(updates);

    if (sellerAccount.fcmToken !== null) {
      const payload = {
        token: sellerAccount.fcmToken,
        notification: {
          title: "🔔 Withdrawal Request Accepted! 🔔",
          body: "Good news! Your withdrawal request has been accepted and is being processed. Thank you for using our service!",
        },
        data: {
          type: "WITHDRAWREQUEST",
        },
      };

      try {
        const adminInstance = await admin;
        await adminInstance.messaging().send(payload);
        console.log("Notification sent successfully.");
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//decline withdraw request ( admin )
exports.rejectWithdrawalRequest = async (req, res) => {
  try {
    const { requestId, reason, personId } = req.query;

    if (!requestId || !reason || !personId) {
      return res.status(200).json({ status: false, message: "requestId, personId, and reason are required." });
    }

    const trimmedReason = reason.trim();

    const [request, sellerAccount] = await Promise.all([
      WithDrawRequest.findById(requestId).select("status userId amount uniqueId").lean(),
      Seller.findById(personId).select("isBlock fcmToken").lean(),
    ]);

    if (!request) {
      return res.status(200).json({ status: false, message: "Withdrawal Request not found." });
    }

    if (request.status === 2) {
      return res.status(200).json({ status: false, message: "Withdrawal request already accepted." });
    }

    if (request.status === 3) {
      return res.status(200).json({ status: false, message: "Withdrawal request already declined." });
    }

    if (!sellerAccount) {
      return res.status(200).json({ status: false, message: "Seller does not found." });
    }

    if (sellerAccount.isBlock) {
      return res.status(403).json({ status: false, message: "Seller is blocked by admin." });
    }

    res.status(200).json({ status: true, message: "Withdrawal Request has been declined by the admin." });

    await Promise.all([
      WithDrawRequest.updateOne(
        { _id: request._id },
        {
          $set: {
            status: 3,
            reason: trimmedReason,
            acceptOrDeclineDate: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
          },
        }
      ),
    ]);

    if (sellerAccount.fcmToken !== null) {
      const payload = {
        token: sellerAccount.fcmToken,
        notification: {
          title: "🔔 Withdrawal Request Declined! 🔔",
          body: "We're sorry, but your withdrawal request has been declined. Please contact support for more information.",
        },
        data: {
          type: "WITHDRAWREQUEST",
        },
      };

      try {
        const adminInstance = await admin;
        await adminInstance.messaging().send(payload);
        console.log("Notification sent successfully.");
      } catch (notificationError) {
        console.error("Error sending notification:", notificationError);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
