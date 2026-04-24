const AutoBid = require("./autoBid.model");
const AuctionBid = require("../auctionBid/auctionBid.model");
const Product = require("../product/product.model");
const User = require("../user/user.model");
const LiveSeller = require("../liveSeller/liveSeller.model");
const admin = require("../../util/privateKey");

// A per-product in-memory lock so two near-simultaneous triggerAutoBid calls
// on the same product serialise on the counter-placement step. Node's
// event loop serialises within a single process; this lock guards against
// the interleaving of async DB reads/writes, not OS-level concurrency.
const _productLocks = new Map();
async function _withLock(productId, fn) {
  const key = productId.toString();
  const prev = _productLocks.get(key) || Promise.resolve();
  const next = prev.then(fn, fn);
  _productLocks.set(key, next.catch(() => {}));
  try {
    return await next;
  } finally {
    if (_productLocks.get(key) === next) _productLocks.delete(key);
  }
}

// ─── Public endpoints ────────────────────────────────────────────────────────

exports.setAutoBid = async (req, res) => {
  try {
    const { userId, productId, maxBidAmount, attributes, liveHistoryId } = req.body;
    const maxBid = Number(maxBidAmount);

    if (!userId || !productId || !Number.isFinite(maxBid) || maxBid <= 0) {
      return res.status(200).json({ status: false, message: "Missing or invalid userId/productId/maxBidAmount." });
    }

    const product = await Product.findById(productId)
      .select("seller enableAuction auctionEndDate productSaleType bidIncrement productName")
      .lean();

    if (!product) return res.status(200).json({ status: false, message: "Product not found." });

    const increment = Math.max(1, Number(product.bidIncrement) || 5);

    const currentHighest = await _getCurrentHighestBid(productId, liveHistoryId);
    const highestBid = Number(currentHighest?.currentBid ?? 0);

    if (maxBid < highestBid + increment) {
      return res.status(200).json({
        status: false,
        message: `Max bid must be at least ${highestBid + increment}.`,
        minAcceptable: highestBid + increment,
      });
    }

    const autoBid = await AutoBid.findOneAndUpdate(
      { userId, productId },
      {
        userId,
        productId,
        sellerId: product.seller || null,
        liveHistoryId: liveHistoryId || null,
        maxBidAmount: maxBid,
        attributes: attributes || [],
        isActive: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Place an initial bid if our max beats the current top. Use the
    // configured increment instead of +1 so we don't hand the auction over
    // at an awkwardly-high bump.
    if (maxBid > highestBid) {
      const initialBid = Math.min(highestBid + increment, maxBid);
      await AuctionBid.create({
        userId,
        productId,
        sellerId: product.seller || null,
        liveHistoryId: liveHistoryId || null,
        startingBid: highestBid,
        currentBid: initialBid,
        attributes: attributes || [],
        mode: liveHistoryId ? 1 : 2,
      });
      await AutoBid.findByIdAndUpdate(autoBid._id, { currentBid: initialBid });

      // Chain a triggerAutoBid so *other* auto-bidders on this product get a
      // chance to counter our fresh bid. Fire-and-forget.
      exports.triggerAutoBid({
        productId,
        currentBid: initialBid,
        currentBidderId: userId,
        sellerId: product.seller || null,
        startingBid: highestBid,
        productName: product.productName || "",
        liveHistoryId: liveHistoryId || null,
      }).catch(console.error);
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

// Returns all the user's active auto-bids, optionally scoped to a live show.
// Powers the Flutter overlay "Max $X" badge without N queries per product.
exports.myActive = async (req, res) => {
  try {
    const { userId, liveHistoryId } = req.query;
    if (!userId) {
      return res.status(200).json({ status: false, message: "userId is required." });
    }
    const filter = { userId, isActive: true };
    if (liveHistoryId) filter.liveHistoryId = liveHistoryId;
    const list = await AutoBid.find(filter).select("productId maxBidAmount currentBid liveHistoryId").lean();
    return res.status(200).json({ status: true, data: list });
  } catch (e) {
    console.error("myActive autoBid error:", e);
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
 * Per-product lock serialises concurrent triggers so two simultaneous bids
 * don't both counter at the same amount. Chains itself so a cascade of
 * auto-bids resolves until either (a) someone's cap is reached, or
 * (b) no competing auto-bid exists.
 */
exports.triggerAutoBid = async ({ productId, currentBid, currentBidderId, sellerId, startingBid, productName, liveHistoryId }) => {
  return _withLock(productId, async () => {
    try {
      const product = await Product.findById(productId).select("bidIncrement productName").lean();
      const increment = Math.max(1, Number(product?.bidIncrement) || 5);

      // Re-read current top under the lock — another counter may have
      // already fired between us being called and the lock acquiring.
      const actualHighest = await _getCurrentHighestBid(productId, liveHistoryId);
      const latestTop = Number(actualHighest?.currentBid ?? currentBid);
      const latestTopBidder = actualHighest?.userId?.toString() || currentBidderId?.toString();

      const bestAutoBid = await AutoBid.findOne({
        productId,
        userId: { $ne: latestTopBidder },
        isActive: true,
        maxBidAmount: { $gte: latestTop + increment },
      })
        .sort({ maxBidAmount: -1, updatedAt: 1 })
        .lean();

      if (!bestAutoBid) {
        // No cascading counter possible — notify the displaced manual bidder.
        await _notifyOutbid({ productId, newBid: latestTop, newBidderId: latestTopBidder, productName: productName || product?.productName });
        return;
      }

      const counterBidAmount = Math.min(latestTop + increment, bestAutoBid.maxBidAmount);

      const effectiveLiveHistoryId = liveHistoryId || bestAutoBid.liveHistoryId || null;

      await Promise.all([
        AuctionBid.create({
          userId: bestAutoBid.userId,
          productId,
          sellerId,
          liveHistoryId: effectiveLiveHistoryId,
          startingBid,
          currentBid: counterBidAmount,
          attributes: bestAutoBid.attributes || [],
          mode: effectiveLiveHistoryId ? 1 : 2,
        }),
        AutoBid.findByIdAndUpdate(bestAutoBid._id, { currentBid: counterBidAmount }),
      ]);

      // For live auctions, tell the room so the overlay picks up the new top
      // and the countdown resets — same payload shape the client already
      // consumes from its own placeBid events.
      if (effectiveLiveHistoryId) {
        await _broadcastLiveCounter({
          liveHistoryId: effectiveLiveHistoryId,
          productId,
          amount: counterBidAmount,
          userId: bestAutoBid.userId,
        });
      }

      // Notify the displaced bidder (manual or auto-bid that was outbid).
      await _sendOutbidNotification({
        userId: latestTopBidder,
        newBid: counterBidAmount,
        productId,
        productName: productName || product?.productName,
      });

      // Cascade: other auto-bidders may still want to counter this new top.
      // Fire-and-forget — the lock re-enters without deadlock since `_withLock`
      // chains through the same promise if the key matches.
      setImmediate(() => {
        exports.triggerAutoBid({
          productId,
          currentBid: counterBidAmount,
          currentBidderId: bestAutoBid.userId,
          sellerId,
          startingBid,
          productName: productName || product?.productName,
          liveHistoryId,
        }).catch(console.error);
      });
    } catch (err) {
      console.error("TriggerAutoBid Error:", err);
    }
  });
};

// ─── Private helpers ─────────────────────────────────────────────────────────

// Reads the current top AuctionBid. When a liveHistoryId is provided we scope
// to that live show; otherwise we consider manual-auction bids for the product.
async function _getCurrentHighestBid(productId, liveHistoryId) {
  const filter = { productId };
  if (liveHistoryId) {
    filter.liveHistoryId = liveHistoryId;
  }
  return AuctionBid.findOne(filter).sort({ currentBid: -1, createdAt: -1 }).lean();
}

async function _notifyOutbid({ productId, newBid, newBidderId, productName }) {
  const displacedBid = await AuctionBid.findOne({
    productId,
    userId: { $ne: newBidderId },
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

// Extends the live show's auctionEndTime to keep soft-close parity with
// manual bids, and broadcasts `announceTopBidPlaced` so every viewer's
// LiveAuctionOverlay updates its currentBid + countdown.
async function _broadcastLiveCounter({ liveHistoryId, productId, amount, userId }) {
  try {
    const liveSeller = await LiveSeller.findOne({
      liveSellingHistoryId: liveHistoryId,
      "selectedProducts.productId": productId,
    }).select("sellerId selectedProducts");
    if (!liveSeller) return;

    const product = liveSeller.selectedProducts.find((p) => p.productId.toString() === productId.toString());
    if (!product) return;

    const minAuctionTime = Number(product.minAuctionTime) || 60;
    const endTime = new Date(Date.now() + minAuctionTime * 1000);
    product.auctionEndTime = endTime;
    await liveSeller.save();

    if (!global.io) return;
    const payload = JSON.stringify({
      liveStreamerId: liveSeller.sellerId.toString(),
      liveHistoryId: liveHistoryId.toString(),
      productId: productId.toString(),
      productVendorId: productId.toString(),
      userId: userId.toString(),
      amount,
      minAuctionTime,
      isAutoBid: true,
    });
    global.io.in("liveSellerRoom:" + liveHistoryId.toString()).emit("announceTopBidPlaced", payload);
  } catch (e) {
    console.error("_broadcastLiveCounter error:", e);
  }
}

async function _sendOutbidNotification({ userId, newBid, productId, productName }) {
  try {
    if (!userId) return;
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
