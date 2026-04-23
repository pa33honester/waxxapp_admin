const AutoBid = require("./autoBid.model");
const AuctionBid = require("../auctionBid/auctionBid.model");
const Product = require("../product/product.model");
const User = require("../user/user.model");
const mongoose = require("mongoose");
const admin = require("../../util/privateKey");

// ─── Public endpoints ────────────────────────────────────────────────────────

exports.setAutoBid = async (req, res) => {
  try {
    const { userId, productId, maxBidAmount, attributes } = req.body;
    const maxBid = Number(maxBidAmount);

    if (!userId || !productId || !Number.isFinite(maxBid) || maxBid <= 0) {
      return res.status(200).json({ status: false, message: "Missing or invalid userId/productId/maxBidAmount." });
    }

    const [product, currentHighest] = await Promise.all([
      Product.findById(productId).select("seller enableAuction auctionEndDate productSaleType").lean(),
      AuctionBid.findOne({ productId, mode: 2 }).sort({ currentBid: -1 }).lean(),
    ]);

    if (!product) return res.status(200).json({ status: false, message: "Product not found." });
    if (!product.enableAuction) return res.status(200).json({ status: false, message: "Auction not enabled for this product." });

    const highestBid = Number(currentHighest?.currentBid ?? 0);
    if (maxBid <= highestBid) {
      return res.status(200).json({
        status: false,
        message: `Max bid must be higher than current highest bid: ${highestBid}`,
      });
    }

    const autoBid = await AutoBid.findOneAndUpdate(
      { userId, productId },
      {
        userId,
        productId,
        sellerId: product.seller || null,
        maxBidAmount: maxBid,
        attributes: attributes || [],
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Immediately place an initial bid on user's behalf if their max beats the current highest
    if (maxBid > highestBid) {
      const initialBid = highestBid + 1;
      await AuctionBid.create({
        userId,
        productId,
        sellerId: product.seller || null,
        startingBid: highestBid,
        currentBid: initialBid,
        attributes: attributes || [],
        mode: 2,
      });
      await AutoBid.findByIdAndUpdate(autoBid._id, { currentBid: initialBid });
    }

    return res.status(200).json({ status: true, message: "Auto-bid set successfully", data: autoBid });
  } catch (error) {
    console.error("SetAutoBid Error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

exports.getAutoBid = async (req, res) => {
  try {
    const { userId, productId } = req.query;
    if (!userId || !productId) {
      return res.status(200).json({ status: false, message: "userId and productId are required." });
    }

    const autoBid = await AutoBid.findOne({ userId, productId, isActive: true }).lean();

    return res.status(200).json({
      status: true,
      message: "Auto-bid fetched",
      data: autoBid || null,
    });
  } catch (error) {
    console.error("GetAutoBid Error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

exports.cancelAutoBid = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    if (!userId || !productId) {
      return res.status(200).json({ status: false, message: "userId and productId are required." });
    }

    await AutoBid.findOneAndUpdate({ userId, productId }, { isActive: false });

    return res.status(200).json({ status: true, message: "Auto-bid cancelled", data: null });
  } catch (error) {
    console.error("CancelAutoBid Error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// ─── Internal helper (called after any bid is placed) ────────────────────────

/**
 * After a bid is placed, find the best competing auto-bid and counter it.
 * Also sends OUTBID notifications to displaced bidders.
 */
exports.triggerAutoBid = async ({ productId, currentBid, currentBidderId, sellerId, startingBid, productName }) => {
  try {
    // Find the highest active auto-bid that can beat the current bid (excluding current bidder)
    const bestAutoBid = await AutoBid.findOne({
      productId,
      userId: { $ne: currentBidderId },
      isActive: true,
      maxBidAmount: { $gt: currentBid },
    })
      .sort({ maxBidAmount: -1 })
      .lean();

    if (!bestAutoBid) {
      // Nobody can auto-counter — notify the previous top bidder if they were outbid
      await _notifyOutbid({ productId, newBid: currentBid, newBidderId: currentBidderId, productName });
      return;
    }

    // Place counter bid at currentBid + 1, capped at maxBidAmount
    const counterBidAmount = Math.min(currentBid + 1, bestAutoBid.maxBidAmount);

    await Promise.all([
      AuctionBid.create({
        userId: bestAutoBid.userId,
        productId,
        sellerId,
        startingBid,
        currentBid: counterBidAmount,
        attributes: bestAutoBid.attributes || [],
        mode: 2,
      }),
      AutoBid.findByIdAndUpdate(bestAutoBid._id, { currentBid: counterBidAmount }),
    ]);

    // Notify the manual bidder that they were instantly outbid
    await _sendOutbidNotification({
      userId: currentBidderId,
      newBid: counterBidAmount,
      productId,
      productName,
    });
  } catch (err) {
    console.error("TriggerAutoBid Error:", err);
  }
};

// ─── Private helpers ─────────────────────────────────────────────────────────

async function _notifyOutbid({ productId, newBid, newBidderId, productName }) {
  // Find the second-highest bidder (the one just displaced)
  const displacedBid = await AuctionBid.findOne({
    productId,
    userId: { $ne: newBidderId },
    mode: 2,
  })
    .sort({ currentBid: -1 })
    .lean();

  if (!displacedBid) return;

  await _sendOutbidNotification({
    userId: displacedBid.userId,
    newBid,
    productId,
    productName,
  });
}

async function _sendOutbidNotification({ userId, newBid, productId, productName }) {
  try {
    const user = await User.findById(userId).select("fcmToken").lean();
    if (!user?.fcmToken) return;

    const adminInstance = await admin;
    await adminInstance.messaging().send({
      token: user.fcmToken,
      notification: {
        title: "You've been outbid!",
        body: `Someone bid ${newBid} on ${productName || "an item"}. Tap to bid again.`,
      },
      data: {
        type: "OUTBID",
        productId: productId.toString(),
        productName: productName || "",
        newBidAmount: String(newBid),
      },
    });
  } catch (err) {
    console.error("SendOutbidNotification Error:", err);
  }
}
