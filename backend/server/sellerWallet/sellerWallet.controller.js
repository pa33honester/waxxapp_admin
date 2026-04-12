const SellerWallet = require("./sellerWallet.model");

//import model
const Seller = require("../seller/seller.model");
const Order = require("../order/order.model");

//mongoose
const mongoose = require("mongoose");

//retrive wallet history of particular seller ( admin )
exports.retrieveSellerTransactions = async (req, res) => {
  try {
    if (!req.query.sellerId || !req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Invalid request: Missing required fields." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;
    const sellerObjId = new mongoose.Types.ObjectId(req.query.sellerId);

    let dateFilterQuery = {};
    if (req.query.startDate !== "All" && req.query.endDate !== "All") {
      const startDate = new Date(req.query.startDate);
      const endDate = new Date(req.query.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    let transactionTypeQuery = {};
    if (req.query.status !== "All") {
      transactionTypeQuery.transactionType = parseInt(req.query.status);
    }

    const [seller, total, data] = await Promise.all([
      Seller.findOne({ _id: sellerObjId, isBlock: false }).select("_id").lean(),
      SellerWallet.countDocuments({ ...dateFilterQuery, ...transactionTypeQuery, sellerId: sellerObjId }),
      SellerWallet.aggregate([
        {
          $match: {
            ...dateFilterQuery,
            ...transactionTypeQuery,
            sellerId: sellerObjId,
          },
        },
        {
          $lookup: {
            from: "orders",
            localField: "orderId",
            foreignField: "_id",
            as: "order",
          },
        },
        {
          $unwind: {
            path: "$order",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "sellers",
            localField: "sellerId",
            foreignField: "_id",
            as: "seller",
          },
        },
        { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: "users",
            localField: "order.userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: {
            path: "$user",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "order.items.productId",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $unwind: {
            path: "$product",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $addFields: {
            orderAmount: {
              $add: [{ $ifNull: ["$amount", 0] }, { $ifNull: ["$commissionPerProductQuantity", 0] }],
            },
          },
        },
        {
          $project: {
            sellerName: "$seller.firstName",
            lastName: "$seller.lastName",
            businessTag: "$seller.businessTag",
            businessName: "$seller.businessName",
            buyerName: "$user.firstName",
            productName: "$product.productName",
            orderId: "$order.orderId",
            sellerEarning: "$amount",
            adminEarning: "$commissionPerProductQuantity",
            transactionType: 1,
            date: 1,
            orderAmount: 1,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Success",
      total: total,
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//retrive wallet history ( admin )
exports.fetchAdminEarnings = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const startDate = req?.query?.startDate || "All";
    const endDate = req?.query?.endDate || "All";

    let dateFilterQuery = {};
    if (startDate !== "All" && endDate !== "All") {
      const formatStartDate = new Date(startDate);
      const formatEndDate = new Date(endDate);
      formatEndDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: formatStartDate,
          $lte: formatEndDate,
        },
      };
    }

    const [total, transactions, totalEarnings] = await Promise.all([
      SellerWallet.countDocuments(dateFilterQuery),
      SellerWallet.aggregate([
        {
          $match: {
            ...dateFilterQuery,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $lookup: {
            from: "orders",
            localField: "orderId",
            foreignField: "_id",
            as: "orderDetails",
          },
        },
        {
          $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$orderDetails", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "sellers",
            localField: "sellerId",
            foreignField: "_id",
            as: "seller",
          },
        },
        { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            amount: 1,
            commissionPerProductQuantity: 1,
            date: 1,
            sellerName: "$seller.firstName",
            lastName: "$seller.lastName",
            businessTag: "$seller.businessTag",
            businessName: "$seller.businessName",
            orderId: "$orderDetails.orderId",
            productName: "$productDetails.productName",
            productImage: "$productDetails.mainImage",
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
      SellerWallet.aggregate([
        {
          $match: {
            ...dateFilterQuery,
          },
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$commissionPerProductQuantity" }, // Sum of admin commissions
          },
        },
      ]),
    ]);

    return res.status(200).json({
      status: true,
      message: "Success",
      totalEarnings: totalEarnings.length > 0 ? totalEarnings[0].totalEarnings : 0,
      total: total,
      data: transactions,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//retrive wallet history ( seller )
exports.retrieveSellerWalletHistory = async (req, res) => {
  try {
    const { sellerId } = req.query;

    if (!sellerId || !req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Invalid request: Missing required fields." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 20;

    const startDate = req?.query?.startDate || "All";
    const endDate = req?.query?.endDate || "All";

    const sellerObjId = new mongoose.Types.ObjectId(sellerId);

    let dateFilterQuery = {};
    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const formatStartDate = new Date(startDate);
      const formatEndDate = new Date(endDate);
      formatEndDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        createdAt: {
          $gte: formatStartDate,
          $lte: formatEndDate,
        },
      };
    }

    const [seller, data] = await Promise.all([
      Seller.findOne({ _id: sellerObjId }).select("_id isBlock netPayout").lean(),
      SellerWallet.aggregate([
        {
          $match: {
            ...dateFilterQuery,
            sellerId: sellerObjId,
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $lookup: {
            from: "orders",
            localField: "orderId",
            foreignField: "_id",
            as: "orderDetails",
          },
        },
        {
          $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$orderDetails", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            transactionType: 1,
            amount: 1,
            date: 1,
            orderId: { $ifNull: ["$orderDetails.orderId", ""] },
            productName: { $ifNull: ["$productDetails.productName", ""] },
            productImage: { $ifNull: ["$productDetails.mainImage", ""] },
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller not found." });
    }

    if (seller.isBlock) {
      return res.status(200).json({ status: false, message: "Your account is blocked by the admin." });
    }

    const totalAmount = seller.netPayout || 0;

    return res.status(200).json({
      status: true,
      message: "Success",
      totalAmount: totalAmount,
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
