const mongoose = require("mongoose");

const Offer = require("./offer.model");
const Product = require("../product/product.model");
const Seller = require("../seller/seller.model");
const User = require("../user/user.model");
const Order = require("../order/order.model");
const Notification = require("../notification/notification.model");

const admin = require("../../util/privateKey");
const { findOrCreatePendingOrderForSeller } = require("../../util/orderAggregator");

const getValidToken = (token) => {
  if (typeof token !== "string") return null;
  const trimmed = token.trim();
  return trimmed.length > 0 ? trimmed : null;
};

// Fire-and-forget FCM + Notification row. Never rejects — callers run this
// alongside the HTTP response, so a flaky push must never block the response.
const notify = async ({ userId, sellerId, productId, title, body, data, fcmToken }) => {
  try {
    const row = new Notification();
    row.userId = userId || null;
    row.sellerId = sellerId || null;
    row.productId = productId || null;
    row.title = title;
    row.message = body;
    row.notificationType = data && data.notificationTypeCode ? data.notificationTypeCode : null;
    row.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await row.save();

    const token = getValidToken(fcmToken);
    if (!token) return;

    const adminInstance = await admin;
    await adminInstance.messaging().send({
      token,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data || {}).map(([k, v]) => [k, String(v)])
      ),
    });
  } catch (e) {
    console.error("offer notify error:", e);
  }
};

// Buyer creates a new offer on a product that has allowOffer=true.
exports.createOffer = async (req, res) => {
  try {
    const { productId, buyerId, offerAmount, buyerMessage } = req.body;
    if (!productId || !buyerId || offerAmount == null) {
      return res.status(200).json({ status: false, message: "productId, buyerId, and offerAmount are required." });
    }

    const amount = Number(offerAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(200).json({ status: false, message: "offerAmount must be a positive number." });
    }

    const [product, buyer] = await Promise.all([
      Product.findById(productId).select("seller price allowOffer minimumOfferPrice productName productSaleType").lean(),
      User.findById(buyerId).select("firstName lastName fcmToken isBlock").lean(),
    ]);

    if (!product) return res.status(200).json({ status: false, message: "Product not found." });
    if (!buyer) return res.status(200).json({ status: false, message: "Buyer not found." });
    if (buyer.isBlock) return res.status(200).json({ status: false, message: "You are blocked by admin." });

    // Offers are only valid on Buy Now (type 1) listings. Auctions and
    // not-for-sale items short-circuit.
    if (product.productSaleType !== 1) {
      return res.status(200).json({ status: false, message: "Offers aren't available on this listing." });
    }

    if (!product.allowOffer) {
      return res.status(200).json({ status: false, message: "Seller isn't accepting offers on this listing." });
    }

    if (product.minimumOfferPrice && amount < product.minimumOfferPrice) {
      return res.status(200).json({
        status: false,
        message: `Minimum offer is ${product.minimumOfferPrice}.`,
        minimumOfferPrice: product.minimumOfferPrice,
      });
    }

    // Don't let a buyer pile up duplicate pending offers on the same product.
    // Replace their prior pending/countered offer with the new submission so
    // the seller only ever sees one live offer per (buyer, product).
    await Offer.updateMany(
      {
        productId: product._id ? product._id : new mongoose.Types.ObjectId(productId),
        buyerId: new mongoose.Types.ObjectId(buyerId),
        status: { $in: ["pending", "countered"] },
      },
      { $set: { status: "withdrawn" } }
    );

    const offer = await Offer.create({
      productId,
      buyerId,
      sellerId: product.seller,
      listedPrice: product.price || 0,
      offerAmount: amount,
      buyerMessage: (buyerMessage || "").toString().slice(0, 500),
      status: "pending",
    });

    res.status(200).json({ status: true, message: "Offer submitted.", offer });

    // Notify seller fire-and-forget.
    const seller = await Seller.findById(product.seller).select("fcmToken firstName").lean();
    const buyerName = `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() || "Someone";
    notify({
      sellerId: product.seller,
      productId: product._id,
      title: `${buyerName} made an offer`,
      body: `${buyerName} offered ${amount} on ${product.productName || "your item"}.`,
      data: {
        type: "OFFER_RECEIVED",
        offerId: offer._id.toString(),
        productId: String(productId),
      },
      fcmToken: seller && seller.fcmToken,
    });
  } catch (e) {
    console.error("createOffer error:", e);
    return res.status(500).json({ status: false, message: e.message || "Internal Server Error" });
  }
};

// Seller lists offers received on their products. Supports status filter.
exports.getReceivedOffers = async (req, res) => {
  try {
    const { sellerId, status } = req.query;
    if (!sellerId) return res.status(200).json({ status: false, message: "sellerId is required." });

    const query = { sellerId: new mongoose.Types.ObjectId(sellerId) };
    if (status && status !== "all") query.status = status;

    const offers = await Offer.find(query)
      .populate("productId", "productName mainImage price")
      .populate("buyerId", "firstName lastName image")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ status: true, offers });
  } catch (e) {
    console.error("getReceivedOffers error:", e);
    return res.status(500).json({ status: false, message: e.message || "Internal Server Error" });
  }
};

// Buyer lists offers they've sent.
exports.getSentOffers = async (req, res) => {
  try {
    const { buyerId } = req.query;
    if (!buyerId) return res.status(200).json({ status: false, message: "buyerId is required." });

    const offers = await Offer.find({ buyerId: new mongoose.Types.ObjectId(buyerId) })
      .populate("productId", "productName mainImage price")
      .populate("sellerId", "businessName firstName lastName image")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ status: true, offers });
  } catch (e) {
    console.error("getSentOffers error:", e);
    return res.status(500).json({ status: false, message: e.message || "Internal Server Error" });
  }
};

// Seller accepts. Creates an Order at the agreed price with
// status=Pending so it falls into the buyer's existing MyOrders checkout
// queue. We never auto-charge — payment happens via the normal order flow.
exports.acceptOffer = async (req, res) => {
  try {
    const { offerId } = req.body;
    if (!offerId) return res.status(200).json({ status: false, message: "offerId is required." });

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(200).json({ status: false, message: "Offer not found." });
    if (offer.status === "accepted") {
      return res.status(200).json({ status: false, message: "Offer was already accepted." });
    }
    if (["declined", "withdrawn", "expired"].includes(offer.status)) {
      return res.status(200).json({ status: false, message: "Offer is no longer active." });
    }

    // When the buyer accepts a seller's counter, the final price is the
    // counter amount; otherwise (the normal accept path) it's the buyer's
    // original offer.
    const finalAmount = offer.counterAmount && offer.counteredBy === "seller"
      ? offer.counterAmount
      : offer.offerAmount;

    const [product, buyer] = await Promise.all([
      Product.findById(offer.productId).select("productName price shippingCharges productCode seller mainImage").lean(),
      User.findById(offer.buyerId).select("firstName lastName fcmToken").lean(),
    ]);

    if (!product) return res.status(200).json({ status: false, message: "Product not found." });
    if (!buyer) return res.status(200).json({ status: false, message: "Buyer not found." });

    const settingJSON = global.settingJSON || {};
    const adminRate = settingJSON.adminCommissionCharges || 10;
    const shipping = product.shippingCharges || 0;

    // Opt-in bundling: offers default to their own Order, but callers can
    // pass ?bundle=true to fold the accepted offer into any existing unpaid
    // bundle the buyer already has with this seller.
    const bundle = String(req.query.bundle || "").toLowerCase() === "true";

    const newItem = {
      productId: product._id,
      sellerId: product.seller,
      purchasedTimeProductPrice: finalAmount,
      purchasedTimeShippingCharges: shipping,
      productCode: product.productCode || "",
      productQuantity: 1,
      attributesArray: [],
      commissionPerProductQuantity: (finalAmount * adminRate) / 100,
      itemDiscount: 0,
      status: bundle ? "Bundle Pending Payment" : "Pending",
      date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    };

    let order;
    if (bundle) {
      const bundleResult = await findOrCreatePendingOrderForSeller({
        buyerId: offer.buyerId,
        sellerId: product.seller,
        newItem,
        orderIdPrefix: "OF",
        settingJSON,
      });
      order = bundleResult.order;
    } else {
      order = await Order.create({
        orderId: "OF#" + Math.floor(10000 + Math.random() * 90000),
        userId: offer.buyerId,
        items: [newItem],
        totalShippingCharges: shipping,
        subTotal: finalAmount,
        total: finalAmount,
        finalTotal: finalAmount + shipping,
        totalItems: 1,
        totalQuantity: 1,
        purchasedTimeadminCommissionCharges: adminRate,
        purchasedTimecancelOrderCharges: settingJSON.cancelOrderCharges || 10,
        paymentGateway: "",
      });
    }

    offer.status = "accepted";
    offer.orderId = order._id;
    // Collapse counterAmount into offerAmount for the historical record on
    // the accept path triggered by the buyer after a counter.
    if (offer.counterAmount && offer.counteredBy === "seller") {
      offer.offerAmount = offer.counterAmount;
    }
    await offer.save();

    res.status(200).json({ status: true, message: "Offer accepted. Order created.", offer, order });

    notify({
      userId: offer.buyerId,
      productId: offer.productId,
      title: "Your offer was accepted",
      body: `${product.productName || "Your item"} at ${finalAmount}. Complete checkout to lock it in.`,
      data: {
        type: "OFFER_ACCEPTED",
        offerId: offer._id.toString(),
        orderId: order._id.toString(),
      },
      fcmToken: buyer.fcmToken,
    });
  } catch (e) {
    console.error("acceptOffer error:", e);
    return res.status(500).json({ status: false, message: e.message || "Internal Server Error" });
  }
};

// Seller counters a pending buyer offer. Buyer sees the new amount and
// accepts/declines via the same endpoints.
exports.counterOffer = async (req, res) => {
  try {
    const { offerId, counterAmount } = req.body;
    if (!offerId || counterAmount == null) {
      return res.status(200).json({ status: false, message: "offerId and counterAmount are required." });
    }

    const amount = Number(counterAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(200).json({ status: false, message: "counterAmount must be a positive number." });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(200).json({ status: false, message: "Offer not found." });
    if (offer.status !== "pending") {
      return res.status(200).json({ status: false, message: "Only pending offers can be countered." });
    }

    offer.counterAmount = amount;
    offer.counteredBy = "seller";
    offer.status = "countered";
    await offer.save();

    const [product, buyer] = await Promise.all([
      Product.findById(offer.productId).select("productName").lean(),
      User.findById(offer.buyerId).select("firstName lastName fcmToken").lean(),
    ]);

    res.status(200).json({ status: true, message: "Counter-offer sent.", offer });

    notify({
      userId: offer.buyerId,
      productId: offer.productId,
      title: "Counter-offer received",
      body: `The seller countered at ${amount} on ${(product && product.productName) || "your offer"}.`,
      data: {
        type: "OFFER_COUNTERED",
        offerId: offer._id.toString(),
      },
      fcmToken: buyer && buyer.fcmToken,
    });
  } catch (e) {
    console.error("counterOffer error:", e);
    return res.status(500).json({ status: false, message: e.message || "Internal Server Error" });
  }
};

// Decline path used by the seller on a pending offer, or by the buyer on a
// seller-countered offer. Caller signals their role so we can target the FCM
// back at the correct party.
exports.declineOffer = async (req, res) => {
  try {
    const { offerId, declinedBy } = req.body;
    if (!offerId || !declinedBy) {
      return res.status(200).json({ status: false, message: "offerId and declinedBy are required." });
    }
    if (!["buyer", "seller"].includes(declinedBy)) {
      return res.status(200).json({ status: false, message: "declinedBy must be 'buyer' or 'seller'." });
    }

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(200).json({ status: false, message: "Offer not found." });
    if (!["pending", "countered"].includes(offer.status)) {
      return res.status(200).json({ status: false, message: "Offer is no longer active." });
    }

    offer.status = "declined";
    await offer.save();

    // Notify the *other* party.
    const [product, seller, buyer] = await Promise.all([
      Product.findById(offer.productId).select("productName").lean(),
      Seller.findById(offer.sellerId).select("fcmToken businessName").lean(),
      User.findById(offer.buyerId).select("firstName lastName fcmToken").lean(),
    ]);

    res.status(200).json({ status: true, message: "Offer declined.", offer });

    if (declinedBy === "seller" && buyer) {
      notify({
        userId: offer.buyerId,
        productId: offer.productId,
        title: "Offer declined",
        body: `Your offer on ${(product && product.productName) || "the item"} was declined.`,
        data: { type: "OFFER_DECLINED", offerId: offer._id.toString() },
        fcmToken: buyer.fcmToken,
      });
    } else if (declinedBy === "buyer" && seller) {
      notify({
        sellerId: offer.sellerId,
        productId: offer.productId,
        title: "Counter-offer rejected",
        body: `A buyer passed on your counter for ${(product && product.productName) || "the item"}.`,
        data: { type: "OFFER_COUNTER_DECLINED", offerId: offer._id.toString() },
        fcmToken: seller.fcmToken,
      });
    }
  } catch (e) {
    console.error("declineOffer error:", e);
    return res.status(500).json({ status: false, message: e.message || "Internal Server Error" });
  }
};

// Buyer retracts an offer they submitted before the seller has acted.
exports.withdrawOffer = async (req, res) => {
  try {
    const { offerId, buyerId } = req.body;
    if (!offerId) return res.status(200).json({ status: false, message: "offerId is required." });

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(200).json({ status: false, message: "Offer not found." });
    if (buyerId && offer.buyerId.toString() !== buyerId.toString()) {
      return res.status(200).json({ status: false, message: "Not your offer." });
    }
    if (!["pending", "countered"].includes(offer.status)) {
      return res.status(200).json({ status: false, message: "Offer is no longer active." });
    }

    offer.status = "withdrawn";
    await offer.save();

    return res.status(200).json({ status: true, message: "Offer withdrawn.", offer });
  } catch (e) {
    console.error("withdrawOffer error:", e);
    return res.status(500).json({ status: false, message: e.message || "Internal Server Error" });
  }
};

// Admin overview: lists all offers across the platform with filter support.
// Mirrors the shape of other admin listing endpoints.
exports.adminList = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;

    const skip = (Math.max(1, parseInt(page)) - 1) * parseInt(limit);
    const [offers, total] = await Promise.all([
      Offer.find(query)
        .populate("productId", "productName mainImage price")
        .populate("buyerId", "firstName lastName image")
        .populate("sellerId", "businessName firstName lastName image")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Offer.countDocuments(query),
    ]);

    return res.status(200).json({ status: true, offers, total });
  } catch (e) {
    console.error("offer adminList error:", e);
    return res.status(500).json({ status: false, message: e.message || "Internal Server Error" });
  }
};
