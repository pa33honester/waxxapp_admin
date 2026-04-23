const mongoose = require("mongoose");

const Giveaway = require("./giveaway.model");
const Follower = require("../follower/follower.model");
const LiveSellingHistory = require("../liveSellingHistory/liveSellingHistory.model");
const Product = require("../product/product.model");
const User = require("../user/user.model");
const Order = require("../order/order.model");
const SellerWallet = require("../sellerWallet/sellerWallet.model");

const admin = require("../../util/privateKey");

// Emit helper — tolerates running without global.io (e.g. one-shot tests)
function emitToLiveRoom(liveSellingHistoryId, event, payload) {
  try {
    if (global.io && liveSellingHistoryId) {
      global.io.in("liveSellerRoom:" + liveSellingHistoryId.toString()).emit(event, payload);
    }
  } catch (err) {
    console.error("emitToLiveRoom error:", err);
  }
}

// --------------------------------------------------------------------------------------
// POST /giveaway/start — seller starts a giveaway during a live broadcast
// --------------------------------------------------------------------------------------
exports.startGiveaway = async (req, res) => {
  try {
    const created = await startGiveawayInternal(req.body || {});
    if (!created.status) return res.status(200).json(created);
    return res.status(200).json(created);
  } catch (error) {
    console.error("startGiveaway error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// Extracted so the socket handler and HTTP route can share the same code path.
async function startGiveawayInternal({ sellerId, liveSellingHistoryId, productId, type, entryWindowSeconds }) {
  if (!sellerId || !liveSellingHistoryId || !productId) {
    return { status: false, message: "sellerId, liveSellingHistoryId and productId are required." };
  }

  const typeNum = Number(type) === 2 ? 2 : 1;
  const windowSec = Math.min(Math.max(Number(entryWindowSeconds) || 60, 10), 300);

  const [live, product] = await Promise.all([
    LiveSellingHistory.findById(liveSellingHistoryId).select("_id sellerId endTime").lean(),
    Product.findById(productId).select("_id productName mainImage shippingCharges seller").lean(),
  ]);

  if (!live) return { status: false, message: "Live broadcast not found." };
  if (live.endTime) return { status: false, message: "Broadcast has already ended." };
  if (!product) return { status: false, message: "Product not found." };

  const now = new Date();
  const closesAt = new Date(now.getTime() + windowSec * 1000);
  const shippingCharge = Number(product.shippingCharges || 0);

  const doc = await Giveaway.create({
    sellerId,
    liveSellingHistoryId,
    productId,
    type: typeNum,
    status: 1,
    entryWindowSeconds: windowSec,
    startedAt: now,
    closesAt,
    shippingCharge,
  });

  const payload = {
    giveawayId: doc._id,
    sellerId,
    liveSellingHistoryId,
    productId,
    productName: product.productName || "",
    mainImage: product.mainImage || "",
    type: typeNum,
    entryWindowSeconds: windowSec,
    startedAt: now,
    closesAt,
  };
  emitToLiveRoom(liveSellingHistoryId, "giveawayStarted", payload);

  // Schedule the auto-draw job. Require lazily to avoid circular import at module load.
  try {
    const { giveawayQueue } = require("../../workers/giveawayWorker");
    await giveawayQueue.add(
      "autoDrawGiveaway",
      { giveawayId: doc._id.toString() },
      {
        delay: windowSec * 1000,
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  } catch (err) {
    console.error("Failed to enqueue autoDrawGiveaway (worker not ready?):", err.message);
  }

  return { status: true, message: "Giveaway started", giveaway: doc };
}

exports.startGiveawayInternal = startGiveawayInternal;

// --------------------------------------------------------------------------------------
// POST /giveaway/enter — buyer enters a giveaway
// --------------------------------------------------------------------------------------
exports.enterGiveaway = async (req, res) => {
  try {
    const result = await enterGiveawayInternal(req.body || {});
    return res.status(result.httpStatus || 200).json(result.payload);
  } catch (error) {
    console.error("enterGiveaway error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

async function enterGiveawayInternal({ userId, giveawayId }) {
  if (!userId || !giveawayId) {
    return { httpStatus: 200, payload: { status: false, message: "userId and giveawayId are required." } };
  }

  const giveaway = await Giveaway.findById(giveawayId);
  if (!giveaway) return { httpStatus: 200, payload: { status: false, message: "Giveaway not found." } };
  if (giveaway.status !== 1) return { httpStatus: 200, payload: { status: false, message: "Giveaway is not open." } };
  if (giveaway.closesAt && new Date() > giveaway.closesAt) {
    return { httpStatus: 200, payload: { status: false, message: "Entry window has closed." } };
  }

  if (giveaway.type === 2) {
    const follows = await Follower.findOne({ userId, sellerId: giveaway.sellerId }).lean();
    if (!follows) {
      return { httpStatus: 403, payload: { status: false, message: "Follow this seller to enter.", code: "FOLLOW_REQUIRED" } };
    }
  }

  const already = giveaway.entries.some((e) => e.userId?.toString() === userId.toString());
  if (already) {
    return {
      httpStatus: 200,
      payload: { status: true, message: "Already entered", entryCount: giveaway.entries.length, alreadyEntered: true },
    };
  }

  giveaway.entries.push({ userId, enteredAt: new Date() });
  await giveaway.save();

  emitToLiveRoom(giveaway.liveSellingHistoryId, "giveawayEntryAdded", {
    giveawayId: giveaway._id,
    entryCount: giveaway.entries.length,
  });

  return { httpStatus: 200, payload: { status: true, message: "Entered", entryCount: giveaway.entries.length } };
}

exports.enterGiveawayInternal = enterGiveawayInternal;

// --------------------------------------------------------------------------------------
// POST /giveaway/draw — seller forces an early draw (also called by worker on timer)
// --------------------------------------------------------------------------------------
exports.drawGiveaway = async (req, res) => {
  try {
    const result = await drawGiveawayInternal(req.body || {});
    return res.status(200).json(result);
  } catch (error) {
    console.error("drawGiveaway error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

async function drawGiveawayInternal({ giveawayId }) {
  if (!giveawayId) return { status: false, message: "giveawayId is required." };

  const giveaway = await Giveaway.findById(giveawayId);
  if (!giveaway) return { status: false, message: "Giveaway not found." };
  if (giveaway.status !== 1) return { status: true, message: "Giveaway already finalised", giveaway };

  // No entries → close silently, notify room.
  if (!giveaway.entries.length) {
    giveaway.status = 2; // closed
    await giveaway.save();
    emitToLiveRoom(giveaway.liveSellingHistoryId, "giveawayClosed", {
      giveawayId: giveaway._id,
      reason: "no_entries",
    });
    return { status: true, message: "Closed with no entries", giveaway };
  }

  const winnerEntry = giveaway.entries[Math.floor(Math.random() * giveaway.entries.length)];

  const [winner, product] = await Promise.all([
    User.findById(winnerEntry.userId).select("_id firstName lastName image fcmToken isBlock").lean(),
    Product.findById(giveaway.productId).select("_id productName mainImage shippingCharges productCode seller").lean(),
  ]);

  if (!winner || !product) {
    return { status: false, message: "Winner or product missing; cannot finalise draw." };
  }

  // Create a zero-price order so the win is tracked in the buyer's order history.
  const orderId = "GW#" + Math.floor(10000 + Math.random() * 90000);
  const shippingCharges = Number(product.shippingCharges || giveaway.shippingCharge || 0);
  const order = await Order.create({
    orderId,
    userId: winner._id,
    items: [
      {
        productId: product._id,
        sellerId: product.seller,
        purchasedTimeProductPrice: 0,
        purchasedTimeShippingCharges: shippingCharges,
        productCode: product.productCode || "",
        productQuantity: 1,
        attributesArray: [],
        commissionPerProductQuantity: 0,
        itemDiscount: 0,
        status: "Giveaway Win",
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      },
    ],
    totalShippingCharges: shippingCharges,
    subTotal: 0,
    total: 0,
    finalTotal: shippingCharges,
    totalItems: 1,
    totalQuantity: 1,
    paymentStatus: 2, // treat as "paid" — seller covers shipping
    paymentGateway: "GIVEAWAY",
  });

  // Seller wallet: record the shipping debit (type=2 deduction) so the ledger shows the cost.
  await SellerWallet.create({
    orderId: order._id,
    productId: product._id,
    itemId: order.items[0]._id,
    sellerId: product.seller,
    shippingCharges,
    amount: -shippingCharges,
    transactionType: 2,
    date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
  });

  giveaway.status = 3;
  giveaway.winnerUserId = winner._id;
  giveaway.winnerDrawnAt = new Date();
  giveaway.winnerOrderId = order._id;
  await giveaway.save();

  emitToLiveRoom(giveaway.liveSellingHistoryId, "giveawayWinnerRevealed", {
    giveawayId: giveaway._id,
    winnerId: winner._id,
    firstName: winner.firstName || "",
    lastName: winner.lastName || "",
    image: winner.image || "",
    productId: product._id,
    productName: product.productName || "",
    mainImage: product.mainImage || "",
    orderId: order._id,
  });

  try {
    const { emitLiveSystemMessage } = require("../../util/liveSystemMessage");
    emitLiveSystemMessage({
      liveSellingHistoryId: giveaway.liveSellingHistoryId,
      systemType: "GIVEAWAY_WIN",
      userName: `${winner.firstName || ""} ${winner.lastName || ""}`.trim(),
      text: `won the giveaway: ${product.productName || ""}`,
    });
  } catch (_) {}

  if (global.io) {
    global.io.to("liveRoom:" + winner._id.toString()).emit("giveawayPrizeClaim", {
      giveawayId: giveaway._id,
      orderId: order._id,
      productId: product._id,
      productName: product.productName || "",
      mainImage: product.mainImage || "",
    });
  }

  // FCM push to winner if they're offline.
  if (!winner.isBlock && winner.fcmToken && product.productName) {
    try {
      const adminApp = await admin;
      adminApp
        .messaging()
        .send({
          token: winner.fcmToken,
          notification: {
            title: "🎉 You won a giveaway!",
            body: `You've won "${product.productName}". Tap to confirm your shipping address.`,
          },
          data: {
            type: "GIVEAWAY_WIN",
            giveawayId: giveaway._id.toString(),
            orderId: order._id.toString(),
            productId: product._id.toString(),
          },
        })
        .catch(console.error);
    } catch (err) {
      console.error("FCM giveaway win send failed:", err);
    }
  }

  return { status: true, message: "Winner drawn", giveaway, order };
}

exports.drawGiveawayInternal = drawGiveawayInternal;

// --------------------------------------------------------------------------------------
// GET /giveaway/byLive — giveaways for a broadcast (buyer side on join)
// --------------------------------------------------------------------------------------
exports.giveawaysByLive = async (req, res) => {
  try {
    const { liveSellingHistoryId } = req.query;
    if (!liveSellingHistoryId) return res.status(200).json({ status: false, message: "liveSellingHistoryId required" });

    const list = await Giveaway.find({ liveSellingHistoryId })
      .sort({ createdAt: -1 })
      .populate("productId", "productName mainImage")
      .lean();

    return res.status(200).json({
      status: true,
      giveaways: list.map((g) => ({
        ...g,
        entryCount: g.entries?.length || 0,
        entries: undefined, // don't ship the full entries list to buyers
      })),
    });
  } catch (error) {
    console.error("giveawaysByLive error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// --------------------------------------------------------------------------------------
// GET /giveaway/sellerHistory — seller's past giveaways
// --------------------------------------------------------------------------------------
exports.sellerHistory = async (req, res) => {
  try {
    const { sellerId } = req.query;
    if (!sellerId) return res.status(200).json({ status: false, message: "sellerId required" });

    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(50, Number(req.query.pageSize) || 20);

    const match = { sellerId: new mongoose.Types.ObjectId(sellerId) };

    const [rows, total] = await Promise.all([
      Giveaway.find(match)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate("productId", "productName mainImage")
        .populate("winnerUserId", "firstName lastName image")
        .lean(),
      Giveaway.countDocuments(match),
    ]);

    return res.status(200).json({
      status: true,
      page,
      pageSize,
      total,
      giveaways: rows.map((g) => ({ ...g, entryCount: g.entries?.length || 0, entries: undefined })),
    });
  } catch (error) {
    console.error("sellerHistory error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// --------------------------------------------------------------------------------------
// GET /giveaway/myWins — buyer's giveaway wins
// --------------------------------------------------------------------------------------
exports.myWins = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(200).json({ status: false, message: "userId required" });

    const rows = await Giveaway.find({ winnerUserId: userId, status: 3 })
      .sort({ winnerDrawnAt: -1 })
      .populate("productId", "productName mainImage")
      .populate("sellerId", "firstName lastName image storeName")
      .lean();

    return res.status(200).json({
      status: true,
      wins: rows.map((g) => ({ ...g, entryCount: g.entries?.length || 0, entries: undefined })),
    });
  } catch (error) {
    console.error("myWins error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// --------------------------------------------------------------------------------------
// GET /giveaway/adminList — admin panel listing
// --------------------------------------------------------------------------------------
exports.adminList = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const pageSize = Math.min(100, Number(req.query.pageSize) || 25);
    const match = {};
    if (req.query.status) match.status = Number(req.query.status);

    const [rows, total] = await Promise.all([
      Giveaway.find(match)
        .sort({ createdAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .populate("productId", "productName mainImage")
        .populate("sellerId", "firstName lastName storeName")
        .populate("winnerUserId", "firstName lastName")
        .lean(),
      Giveaway.countDocuments(match),
    ]);

    return res.status(200).json({
      status: true,
      page,
      pageSize,
      total,
      giveaways: rows.map((g) => ({ ...g, entryCount: g.entries?.length || 0, entries: undefined })),
    });
  } catch (error) {
    console.error("adminList error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// --------------------------------------------------------------------------------------
// PATCH /giveaway/adminCancel — admin-only cancel of an open giveaway
// --------------------------------------------------------------------------------------
exports.adminCancel = async (req, res) => {
  try {
    const { giveawayId } = req.body || {};
    if (!giveawayId) return res.status(200).json({ status: false, message: "giveawayId required" });

    const giveaway = await Giveaway.findById(giveawayId);
    if (!giveaway) return res.status(200).json({ status: false, message: "Giveaway not found." });
    if (giveaway.status !== 1) return res.status(200).json({ status: false, message: "Only open giveaways can be cancelled." });

    giveaway.status = 4;
    await giveaway.save();

    emitToLiveRoom(giveaway.liveSellingHistoryId, "giveawayClosed", {
      giveawayId: giveaway._id,
      reason: "cancelled_by_admin",
    });

    return res.status(200).json({ status: true, message: "Giveaway cancelled", giveaway });
  } catch (error) {
    console.error("adminCancel error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};
