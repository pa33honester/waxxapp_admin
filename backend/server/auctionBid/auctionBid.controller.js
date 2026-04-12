const AuctionBid = require("../auctionBid/auctionBid.model");
const Product = require("../product/product.model");

const moment = require("moment");
const mongoose = require("mongoose");

//place bid
exports.placeManualBid = async (req, res) => {
  try {
    const { userId, productId, attributes } = req.body;
    const bid = Number(req.body.bidAmount);

    if (!attributes || !userId || !productId || !Number.isFinite(bid) || bid <= 0) {
      return res.status(200).json({ status: false, message: "Missing or invalid userId/productId/bidAmount." });
    }

    const [product, currentBid] = await Promise.all([
      Product.findById(productId).select("productSaleType enableAuction seller scheduleTime auctionDuration auctionStartingPrice auctionStartDate auctionEndDate").lean(),
      AuctionBid.findOne({ productId, mode: 2 }).sort({ currentBid: -1 }).lean(),
    ]);

    if (!product) return res.status(200).json({ status: false, message: "Product not found." });
    if (product.productSaleType !== 2) return res.status(200).json({ status: false, message: "Product is not set for auction." });
    if (!product.enableAuction) return res.status(200).json({ status: false, message: "Auction is not enabled for this product." });

    const startISO = product.auctionStartDate || product.scheduleTime || null;
    let endISO = product.auctionEndDate || null;

    if (!endISO && startISO && Number.isFinite(Number(product.auctionDuration))) {
      endISO = moment(startISO).add(Number(product.auctionDuration), "days").toISOString();
    }

    if (!startISO || !endISO) {
      return res.status(200).json({ status: false, message: "Auction dates are not configured." });
    }

    const startMs = Date.parse(startISO);
    const endMs = Date.parse(endISO);
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      return res.status(200).json({ status: false, message: "Invalid auction date format." });
    }

    const nowMs = Date.now();
    if (nowMs < startMs) return res.status(200).json({ status: false, message: "Auction has not started yet." });
    if (nowMs > endMs) return res.status(200).json({ status: false, message: "Auction has already ended." });

    const startingBid = Number(currentBid?.startingBid ?? product.auctionStartingPrice ?? 0);
    const highestBid = Number(currentBid?.currentBid ?? startingBid);

    if (!Number.isFinite(startingBid) || !Number.isFinite(highestBid)) {
      return res.status(200).json({ status: false, message: "Invalid current bid state." });
    }

    if (bid <= highestBid) {
      return res.status(200).json({ status: false, message: `Your bid must be higher than current bid: ${highestBid}` });
    }

    const newBid = await AuctionBid.create({
      userId,
      productId,
      sellerId: product.seller || null,
      liveHistoryId: null,
      startingBid,
      currentBid: bid,
      attributes,
      mode: 2,
    });

    return res.status(200).json({ status: true, message: "Bid placed successfully", bid: newBid });
  } catch (error) {
    console.error("Place Bid Error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

//get bids placed by a specific user ( user )
exports.getUserAuctionBids = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(200).json({ status: false, message: "userId is required" });
    }

    const objectUserId = new mongoose.Types.ObjectId(userId);

    const results = await AuctionBid.aggregate([
      {
        $match: {
          userId: objectUserId,
          mode: 2,
        },
      },
      {
        $group: {
          _id: "$productId",
          myBids: {
            $push: {
              _id: "$_id",
              currentBid: "$currentBid",
              startingBid: "$startingBid",
              createdAt: "$createdAt",
            },
          },
          myHighestBid: { $max: "$currentBid" },
        },
      },
      {
        $addFields: {
          myBids: {
            $sortArray: {
              input: "$myBids",
              sortBy: { currentBid: -1 },
            },
          },
        },
      },
      {
        $lookup: {
          from: "auctionbids",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$productId", "$$productId"] },
                mode: 2,
              },
            },
            { $sort: { currentBid: -1, createdAt: -1 } },
            {
              $project: {
                currentBid: 1,
              },
            },
          ],
          as: "allBids",
        },
      },
      {
        $addFields: {
          highestBidOnProduct: { $max: "$allBids.currentBid" },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product",
        },
      },
      {
        $unwind: "$product",
      },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: {
          path: "$category",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "product.subCategory",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      {
        $unwind: {
          path: "$subCategory",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "sellers",
          localField: "product.sellerId",
          foreignField: "_id",
          as: "seller",
        },
      },
      {
        $unwind: {
          path: "$seller",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          productId: "$product._id",
          productName: "$product.productName",
          productCode: "$product.productCode",
          mainImage: "$product.mainImage",
          attributes: "$product.attributes",
          auctionEndTime: "$product.auctionEndDate",
          categoryName: "$category.name",
          subCategoryName: "$subCategory.name",
          seller: {
            _id: "$seller._id",
            firstName: "$seller.firstName",
            lastName: "$seller.lastName",
            businessName: "$seller.businessName",
            businessTag: "$seller.businessTag",
            image: "$seller.image",
          },
          myBids: 1,
          myHighestBid: 1,
          highestBidOnProduct: 1,
        },
      },
      {
        $sort: { myHighestBid: -1 },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "User auction fetched successfully",
      products: results,
    });
  } catch (err) {
    console.error("Auction bid fetch error:", err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

//get bids received by a specific seller ( seller )
exports.getSellerAuctionBids = async (req, res) => {
  try {
    const { sellerId } = req.query;
    if (!sellerId) {
      return res.status(200).json({ status: false, message: "sellerId is required" });
    }

    const objectSellerId = new mongoose.Types.ObjectId(sellerId);

    const products = await AuctionBid.aggregate([
      { $match: { sellerId: objectSellerId, mode: 2 } },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "categories",
          localField: "product.category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "subcategories",
          localField: "product.subCategory",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$product._id",
          product: { $first: "$product" },
          categoryName: { $first: "$category.name" },
          subCategoryName: { $first: "$subCategory.name" },
          bids: {
            $push: {
              _id: "$_id",
              user: {
                _id: "$user._id",
                firstName: "$user.firstName",
                lastName: "$user.lastName",
                image: "$user.image",
              },
              currentBid: "$currentBid",
              startingBid: "$startingBid",
              isWinningBid: "$isWinningBid",
              createdAt: "$createdAt",
            },
          },
        },
      },
      {
        $addFields: {
          bids: { $sortArray: { input: "$bids", sortBy: { createdAt: -1 } } },
          highestBid: {
            $first: { $sortArray: { input: "$bids", sortBy: { currentBid: -1 } } },
          },
        },
      },
      {
        $project: {
          _id: 0,
          product: {
            _id: "$product._id",
            productName: "$product.productName",
            mainImage: "$product.mainImage",
            productCode: "$product.productCode",
            attributes: "$product.attributes",
            auctionDuration: "$product.auctionDuration",
            auctionStartDate: "$product.auctionStartDate",
            auctionEndDate: "$product.auctionEndDate",
            categoryName: "$categoryName",
            subCategoryName: "$subCategoryName",
          },
          bids: 1,
          highestBid: 1,
        },
      },
      {
        $sort: {
          "highestBid.currentBid": -1, // Sort by highest bid value descending
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Seller auction bids fetched successfully",
      products,
    });
  } catch (err) {
    console.error("Seller Auction Bids Error:", err);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

//get bids received by a specific product
exports.getProductWiseUserBids = async (req, res) => {
  try {
    const { productId } = req.query;
    if (!productId) {
      return res.status(200).json({ status: false, message: "productId is required" });
    }

    const bids = await AuctionBid.find({ productId }).populate("userId", "firstName lastName image").sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      status: true,
      message: "Seller auction bids fetched successfully",
      bids,
    });
  } catch (err) {
    console.error("Seller Auction Bids Error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
