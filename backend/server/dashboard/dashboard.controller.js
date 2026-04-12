//import model
const Order = require("../order/order.model");
const User = require("../user/user.model");
const Seller = require("../seller/seller.model");
const Product = require("../product/product.model");
const Category = require("../category/category.model");
const SubCategory = require("../subCategory/subCategory.model");
const SellerWallet = require("../sellerWallet/sellerWallet.model");
const ProductRequest = require("../productRequest/productRequest.model");

//get admin panel dashboard
exports.dashboard = async (req, res) => {
  try {
    const [totalCategory, totalSubCategory, totalProducts, totalOrders, totalUsers, totalSeller, totalLiveSeller, totalAdminCommission] = await Promise.all([
      Category.countDocuments(),
      SubCategory.countDocuments(),
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      Seller.countDocuments(),
      Seller.countDocuments({ isLive: true }),
      SellerWallet.aggregate([
        //{ $match: dateFilterQuery },
        { $group: { _id: null, totalCommission: { $sum: "$commissionPerUnit" } } },
      ]).then((result) => (result.length > 0 ? result[0].totalCommission : 0)),
    ]);

    const dashboard = {
      totalCategory,
      totalSubCategory,
      totalProducts,
      totalOrders,
      totalUsers,
      totalSeller,
      totalLiveSeller,
      totalAdminCommission,
    };

    return res.status(200).json({ status: true, message: "Success", dashboard });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get date wise analytic for users
exports.analyticOfUsers = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    //get today's date range
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);

    //get yesterday's date range
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);

    //get weekly date range
    const weekStartDate = new Date(currentDate);
    weekStartDate.setDate(weekStartDate.getDate() - 7);
    const startOfWeek = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate());
    const endOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);

    //get dateWise date range
    let dateFilterQuery = {};

    if (req?.query?.startDate !== "All" && req?.query?.endDate !== "All") {
      const startDate = new Date(req?.query?.startDate);
      const endDate = new Date(req?.query?.endDate);
      endDate.setHours(23, 59, 59, 999);

      dateFilterQuery = {
        analyticDate: {
          $gte: startDate,
          $lte: endDate,
        },
      };
    }

    const [todayUsers, yesterdayUsers, weeklyUsers, analyticdata] = await Promise.all([
      User.aggregate([{ $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } }, { $group: { _id: null, total: { $sum: 1 } } }]),
      User.aggregate([{ $match: { createdAt: { $gte: startOfYesterday, $lte: endOfYesterday } } }, { $group: { _id: null, total: { $sum: 1 } } }]),
      User.aggregate([{ $match: { createdAt: { $gte: startOfWeek, $lte: endOfWeek } } }, { $group: { _id: null, total: { $sum: 1 } } }]),
      User.aggregate([{ $addFields: { analyticDate: { $toDate: "$createdAt" } } }, { $match: dateFilterQuery }, { $group: { _id: null, total: { $sum: 1 } } }]),
    ]);

    return res.status(200).json({
      status: true,
      message: "Success",
      users: {
        totalUsers: analyticdata[0]?.total > 0 ? analyticdata[0]?.total : 0,
        todayUsers: todayUsers[0]?.total > 0 ? todayUsers[0]?.total : 0,
        yesterdayUsers: yesterdayUsers[0]?.total > 0 ? yesterdayUsers[0]?.total : 0,
        weeklyUsers: weeklyUsers[0]?.total > 0 ? weeklyUsers[0]?.total : 0,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get date wise analytic for orders
exports.analyticOfOrders = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    //get today's date range
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    const endOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);

    //get yesterday's date range
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1);

    //get weekly date range
    const weekStartDate = new Date(currentDate);
    weekStartDate.setDate(weekStartDate.getDate() - 7);
    const startOfWeek = new Date(weekStartDate.getFullYear(), weekStartDate.getMonth(), weekStartDate.getDate());
    const endOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1);

    //get dateWise date range
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
    console.log("dateFilterQuery:   ", dateFilterQuery);

    const [todayOrders, yesterdayOrders, weeklyOrders, analyticdata] = await Promise.all([
      Order.aggregate([{ $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } }, { $group: { _id: null, total: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfYesterday, $lte: endOfYesterday } } }, { $group: { _id: null, total: { $sum: 1 } } }]),
      Order.aggregate([{ $match: { createdAt: { $gte: startOfWeek, $lte: endOfWeek } } }, { $group: { _id: null, total: { $sum: 1 } } }]),
      Order.aggregate([{ $match: dateFilterQuery }, { $group: { _id: null, total: { $sum: 1 } } }]),
    ]);

    return res.status(200).json({
      status: true,
      message: "Success",
      orders: {
        totalOrders: analyticdata[0]?.total > 0 ? analyticdata[0]?.total : 0,
        todayOrders: todayOrders[0]?.total > 0 ? todayOrders[0]?.total : 0,
        yesterdayOrders: yesterdayOrders[0]?.total > 0 ? yesterdayOrders[0]?.total : 0,
        weeklyOrders: weeklyOrders[0]?.total > 0 ? weeklyOrders[0]?.total : 0,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get date wise chartAnalytic for users
exports.chartAnalyticOfUsers = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops!! Invalid Details!!" });
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
    //console.log("dateFilterQuery:   ", dateFilterQuery);

    const data = await User.aggregate([
      {
        $match: dateFilterQuery,
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    return res.status(200).json({ status: true, message: "Success", chartAnalyticOfUsers: data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get date wise chartAnalytic for admin revenue ( commission )
exports.revenueAnalyticsChartData = async (req, res) => {
  try {
    if (!req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
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

    const [totalCommission, totalEarningWithCommission, totalEarningWithoutCommission] = await Promise.all([
      SellerWallet.aggregate([
        {
          $match: dateFilterQuery,
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalCommission: { $sum: "$commissionPerUnit" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),
      SellerWallet.aggregate([
        {
          $match: dateFilterQuery,
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalEarningWithCommission: { $sum: { $sum: ["$totalAmount", "$commissionPerUnit"] } },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),
      SellerWallet.aggregate([
        {
          $match: dateFilterQuery,
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalEarningWithoutCommission: { $sum: "$totalAmount" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ]),
    ]);

    return res.status(200).json({
      status: true,
      message: "Success",
      totalCommission,
      totalEarningWithCommission,
      totalEarningWithoutCommission,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
