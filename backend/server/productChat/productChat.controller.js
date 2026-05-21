const ProductChatConversation = require("./productChat.model");
const User = require("../user/user.model");
const Seller = require("../seller/seller.model");
const Product = require("../product/product.model");
const Notification = require("../notification/notification.model");
const admin = require("../../util/privateKey");
const mongoose = require("mongoose");

const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;
const PHONE_REGEX = /\+?[\d][\d\s\-.()\[\]]{6,}\d/;

function containsContactInfo(text) {
  return EMAIL_REGEX.test(text) || PHONE_REGEX.test(text);
}

// Idempotent find-or-create for a (buyer, seller, product) conversation.
// Called by the buyer when opening the chat from the product detail page,
// and by the seller when tapping a conversation from their inbox.
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { buyerId, sellerId, productId } = req.query;

    if (!buyerId || !mongoose.Types.ObjectId.isValid(buyerId)) {
      return res.status(200).json({ status: false, message: "Valid buyerId required" });
    }
    if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(200).json({ status: false, message: "Valid sellerId required" });
    }
    if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(200).json({ status: false, message: "Valid productId required" });
    }

    const buyer = await User.findById(buyerId).lean();
    if (!buyer) return res.status(200).json({ status: false, message: "Buyer not found" });
    if (buyer.isBlock) return res.status(200).json({ status: false, message: "User is blocked" });

    let conv = await ProductChatConversation.findOne({ productId, buyerId, sellerId });

    if (!conv) {
      const product = await Product.findById(productId).lean();
      const snapshot = product
        ? { name: product.productName || "", image: product.mainImage || "", price: product.price || 0 }
        : { name: "", image: "", price: 0 };

      conv = await ProductChatConversation.create({ productId, buyerId, sellerId, productSnapshot: snapshot });
    }

    // Buyer is opening — mark all seller-sent messages as read.
    if (conv.unreadByBuyer > 0) {
      conv.messages.forEach((m) => {
        if (m.senderType === "seller" && !m.isRead) m.isRead = true;
      });
      conv.unreadByBuyer = 0;
      await conv.save();

      if (global.io) {
        global.io.in("productChatRoom:" + conv._id.toString()).emit("productChatRead", {
          conversationId: conv._id.toString(),
          readerRole: "buyer",
        });
      }
    }

    return res.status(200).json({ status: true, message: "OK", conversation: conv });
  } catch (error) {
    console.error("getOrCreateConversation error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.sendBuyerMessage = async (req, res) => {
  try {
    const { conversationId, buyerId, text } = req.body || {};

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(200).json({ status: false, message: "Valid conversationId required" });
    }
    if (!buyerId || !mongoose.Types.ObjectId.isValid(buyerId)) {
      return res.status(200).json({ status: false, message: "Valid buyerId required" });
    }
    const trimmed = (text || "").toString().trim();
    if (!trimmed) return res.status(200).json({ status: false, message: "Message text required" });
    if (trimmed.length > 2000) return res.status(200).json({ status: false, message: "Message too long (max 2000 chars)" });

    if (containsContactInfo(trimmed)) {
      return res.status(200).json({ status: false, message: "Messages cannot contain email addresses or phone numbers." });
    }

    const buyer = await User.findById(buyerId).lean();
    if (!buyer) return res.status(200).json({ status: false, message: "Buyer not found" });
    if (buyer.isBlock) return res.status(200).json({ status: false, message: "User is blocked" });

    const conv = await ProductChatConversation.findById(conversationId);
    if (!conv) return res.status(200).json({ status: false, message: "Conversation not found" });
    if (!conv.buyerId.equals(buyerId)) return res.status(200).json({ status: false, message: "Unauthorized" });

    const msg = {
      senderType: "buyer",
      senderId: buyer._id,
      senderName: `${buyer.firstName || ""} ${buyer.lastName || ""}`.trim() || "Buyer",
      senderImage: buyer.image || "",
      text: trimmed,
      isRead: false,
    };
    conv.messages.push(msg);
    conv.lastActivityAt = new Date();
    conv.unreadBySeller += 1;
    if (conv.status === "closed") conv.status = "open";
    await conv.save();

    const persisted = conv.messages[conv.messages.length - 1];

    if (global.io) {
      global.io.in("productChatRoom:" + conv._id.toString()).emit("productChatMessage", JSON.stringify(persisted));
      global.io.in("productChatInbox:" + conv.sellerId.toString()).emit("productChatInboxUpdated", {
        conversationId: conv._id.toString(),
        unreadBySeller: conv.unreadBySeller,
        lastMessage: trimmed.slice(0, 200),
        senderType: "buyer",
        lastActivityAt: conv.lastActivityAt,
      });
    }

    // Fire-and-forget FCM to seller.
    (async () => {
      try {
        const seller = await Seller.findById(conv.sellerId).select("fcmToken isBlock").lean();
        if (!seller || seller.isBlock || !seller.fcmToken) return;
        const adminInstance = await admin;
        await adminInstance.messaging().send({
          token: seller.fcmToken,
          notification: {
            title: msg.senderName,
            body: trimmed.slice(0, 120),
          },
          data: {
            type: "PRODUCT_CHAT",
            conversationId: conv._id.toString(),
            productId: conv.productId.toString(),
            role: "seller",
            sellerId: conv.sellerId.toString(),
            buyerId: conv.buyerId.toString(),
          },
        });
        const notif = new Notification();
        notif.sellerId = conv.sellerId;
        notif.title = `New message from ${msg.senderName}`;
        notif.message = trimmed.slice(0, 120);
        notif.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        await notif.save();
      } catch (err) {
        console.error("sendBuyerMessage FCM error:", err.message);
      }
    })();

    return res.status(200).json({ status: true, message: "Sent", data: persisted });
  } catch (error) {
    console.error("sendBuyerMessage error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.sendSellerMessage = async (req, res) => {
  try {
    const { conversationId, sellerId, text } = req.body || {};

    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(200).json({ status: false, message: "Valid conversationId required" });
    }
    if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(200).json({ status: false, message: "Valid sellerId required" });
    }
    const trimmed = (text || "").toString().trim();
    if (!trimmed) return res.status(200).json({ status: false, message: "Message text required" });
    if (trimmed.length > 2000) return res.status(200).json({ status: false, message: "Message too long (max 2000 chars)" });

    if (containsContactInfo(trimmed)) {
      return res.status(200).json({ status: false, message: "Messages cannot contain email addresses or phone numbers." });
    }

    const seller = await Seller.findById(sellerId).lean();
    if (!seller) return res.status(200).json({ status: false, message: "Seller not found" });
    if (seller.isBlock) return res.status(200).json({ status: false, message: "Seller is blocked" });

    const conv = await ProductChatConversation.findById(conversationId);
    if (!conv) return res.status(200).json({ status: false, message: "Conversation not found" });
    if (!conv.sellerId.equals(sellerId)) return res.status(200).json({ status: false, message: "Unauthorized" });

    const sellerName = seller.businessName || `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || "Seller";
    const msg = {
      senderType: "seller",
      senderId: seller._id,
      senderName: sellerName,
      senderImage: seller.image || "",
      text: trimmed,
      isRead: false,
    };
    conv.messages.push(msg);
    conv.lastActivityAt = new Date();
    conv.unreadByBuyer += 1;
    if (conv.status === "closed") conv.status = "open";
    await conv.save();

    const persisted = conv.messages[conv.messages.length - 1];

    if (global.io) {
      global.io.in("productChatRoom:" + conv._id.toString()).emit("productChatMessage", JSON.stringify(persisted));
      global.io.in("productChatInbox:" + conv.sellerId.toString()).emit("productChatInboxUpdated", {
        conversationId: conv._id.toString(),
        unreadBySeller: conv.unreadBySeller,
        lastMessage: trimmed.slice(0, 200),
        senderType: "seller",
        lastActivityAt: conv.lastActivityAt,
      });
    }

    // Fire-and-forget FCM to buyer.
    (async () => {
      try {
        const buyer = await User.findById(conv.buyerId).select("fcmToken isBlock").lean();
        if (!buyer || buyer.isBlock || !buyer.fcmToken) return;
        const adminInstance = await admin;
        await adminInstance.messaging().send({
          token: buyer.fcmToken,
          notification: {
            title: sellerName,
            body: trimmed.slice(0, 120),
          },
          data: {
            type: "PRODUCT_CHAT",
            conversationId: conv._id.toString(),
            productId: conv.productId.toString(),
            role: "buyer",
            sellerId: conv.sellerId.toString(),
            buyerId: conv.buyerId.toString(),
          },
        });
        const notif = new Notification();
        notif.userId = conv.buyerId;
        notif.title = `New message from ${sellerName}`;
        notif.message = trimmed.slice(0, 120);
        notif.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        await notif.save();
      } catch (err) {
        console.error("sendSellerMessage FCM error:", err.message);
      }
    })();

    return res.status(200).json({ status: true, message: "Sent", data: persisted });
  } catch (error) {
    console.error("sendSellerMessage error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getSellerInbox = async (req, res) => {
  try {
    const { sellerId } = req.query;
    if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(200).json({ status: false, message: "Valid sellerId required" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));

    const conversations = await ProductChatConversation.find({ sellerId })
      .sort({ lastActivityAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("buyerId", "firstName lastName image")
      .lean();

    const tiles = conversations.map((c) => {
      const last = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
      return {
        _id: c._id,
        productId: c.productId,
        productSnapshot: c.productSnapshot,
        buyerId: c.buyerId,
        convStatus: c.status,
        unreadBySeller: c.unreadBySeller,
        lastActivityAt: c.lastActivityAt,
        lastMessage: last
          ? { senderType: last.senderType, text: (last.text || "").slice(0, 200), createdAt: last.createdAt }
          : null,
      };
    });

    return res.status(200).json({ status: true, conversations: tiles, page, limit });
  } catch (error) {
    console.error("getSellerInbox error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

exports.getBuyerInbox = async (req, res) => {
  try {
    const { buyerId } = req.query;
    if (!buyerId || !mongoose.Types.ObjectId.isValid(buyerId)) {
      return res.status(200).json({ status: false, message: "Valid buyerId required" });
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));

    const conversations = await ProductChatConversation.find({ buyerId })
      .sort({ lastActivityAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("sellerId", "firstName lastName businessName image")
      .lean();

    const tiles = conversations.map((c) => {
      const last = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
      return {
        _id: c._id,
        productId: c.productId,
        productSnapshot: c.productSnapshot,
        sellerId: c.sellerId,
        convStatus: c.status,
        unreadByBuyer: c.unreadByBuyer,
        lastActivityAt: c.lastActivityAt,
        lastMessage: last
          ? { senderType: last.senderType, text: (last.text || "").slice(0, 200), createdAt: last.createdAt }
          : null,
      };
    });

    return res.status(200).json({ status: true, conversations: tiles, page, limit });
  } catch (error) {
    console.error("getBuyerInbox error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
