// Live customer-support chat — buyer-side opens a conversation with the
// Waxxapp support pool and exchanges messages with whichever admin picks
// up. Built on the existing Socket.io connection the user is already
// holding open for live-shopping events; broadcasts go through the
// `supportRoom:<conversationId>` socket room so an admin actively
// viewing the ticket sees new messages stream in without polling.

const SupportConversation = require("./support.model");
const User = require("../user/user.model");
const Notification = require("../notification/notification.model");
const admin = require("../../util/privateKey");
const mongoose = require("mongoose");

// One persistent conversation per user. Idempotent — if the user already
// has one we return the existing doc, otherwise we mint a fresh one. Keeps
// the buyer's "Help & Support" entry simple: tap → call this once → land
// in the chat view.
exports.getOrCreateMyConversation = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: false, message: "Valid userId required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(200).json({ status: false, message: "User not found" });
    if (user.isBlock) return res.status(200).json({ status: false, message: "You are blocked by the admin" });

    let conv = await SupportConversation.findOne({ userId });
    if (!conv) {
      conv = await SupportConversation.create({ userId });
    }

    // Mark all admin-sent messages as read (the user is opening the chat
    // so anything from the support pool is now seen). Reset the user's
    // unread count.
    if (conv.unreadByUser > 0) {
      conv.messages.forEach((m) => {
        if (m.senderType === "admin" && !m.isRead) m.isRead = true;
      });
      conv.unreadByUser = 0;
      await conv.save();
    }

    return res.status(200).json({
      status: true,
      message: "OK",
      conversation: conv,
    });
  } catch (error) {
    console.error("getOrCreateMyConversation error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// User sends a message. Server appends + broadcasts. Admin-side notif
// (FCM to all subscribed admins) is fire-and-forget so the broadcast
// path stays fast.
exports.sendUserMessage = async (req, res) => {
  try {
    const { userId, text } = req.body || {};
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(200).json({ status: false, message: "Valid userId required" });
    }
    const trimmed = (text || "").toString().trim();
    if (!trimmed) {
      return res.status(200).json({ status: false, message: "Message text required" });
    }
    if (trimmed.length > 2000) {
      return res.status(200).json({ status: false, message: "Message too long (max 2000 chars)" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(200).json({ status: false, message: "User not found" });
    if (user.isBlock) return res.status(200).json({ status: false, message: "You are blocked by the admin" });

    let conv = await SupportConversation.findOne({ userId });
    if (!conv) conv = await SupportConversation.create({ userId });

    const msg = {
      senderType: "user",
      senderId: user._id,
      senderName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
      senderImage: user.image || "",
      text: trimmed,
      isRead: false,
    };
    conv.messages.push(msg);
    conv.lastActivityAt = new Date();
    conv.unreadByAdmin += 1;
    if (conv.status === "closed") conv.status = "open"; // user re-opening
    await conv.save();

    const persisted = conv.messages[conv.messages.length - 1];

    // Broadcast to the support room (admin viewers get the message live)
    // AND to the inbox-summary room so any admin with the inbox open sees
    // the row jump to top + unread count tick up.
    if (global.io) {
      const supportRoom = "supportRoom:" + conv._id.toString();
      global.io.in(supportRoom).emit("supportMessage", JSON.stringify(persisted));
      global.io.in("supportInbox").emit("supportInboxUpdated", {
        conversationId: conv._id.toString(),
        userId: user._id.toString(),
        lastMessage: trimmed.slice(0, 120),
        senderType: "user",
        unreadByAdmin: conv.unreadByAdmin,
        lastActivityAt: conv.lastActivityAt,
      });
    }

    // Fire-and-forget FCM to admins via the existing infra. We use
    // Notification rows + multicast to admin tokens — the actual fan-out
    // strategy depends on how many admins you have. Cheap path: the
    // Notification doc is enough; the admin React panel polls /support/inbox
    // anyway via the socket signal above.
    (async () => {
      try {
        const notif = new Notification();
        notif.userId = user._id;
        notif.title = `New support message from ${msg.senderName}`;
        notif.message = trimmed.slice(0, 120);
        notif.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        await notif.save();
      } catch (err) {
        console.error("support sendUserMessage notif error:", err.message);
      }
    })();

    return res.status(200).json({ status: true, message: "Sent", data: persisted });
  } catch (error) {
    console.error("sendUserMessage error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Admin reply. The admin identity comes from req.admin (set by the
// adminAuth middleware that validated the JWT) — we don't accept a
// client-supplied adminId because the React panel's redux state
// sometimes didn't carry the JWT's _id field reliably, which was the
// "Send button doesn't work" bug.
exports.sendAdminMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body || {};
    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(200).json({ status: false, message: "Valid conversationId required" });
    }
    const trimmed = (text || "").toString().trim();
    if (!trimmed) {
      return res.status(200).json({ status: false, message: "Message text required" });
    }
    if (trimmed.length > 2000) {
      return res.status(200).json({ status: false, message: "Message too long (max 2000 chars)" });
    }

    const adminDoc = req.admin;
    if (!adminDoc) {
      return res.status(401).json({ status: false, message: "Admin not authenticated" });
    }

    const conv = await SupportConversation.findById(conversationId);
    if (!conv) return res.status(200).json({ status: false, message: "Conversation not found" });

    const adminName = `${adminDoc.firstName || ""} ${adminDoc.lastName || ""}`.trim() || "Support";

    const msg = {
      senderType: "admin",
      senderId: adminDoc._id,
      senderName: adminName,
      senderImage: adminDoc.image || "",
      text: trimmed,
      isRead: false,
    };
    conv.messages.push(msg);
    conv.lastActivityAt = new Date();
    conv.unreadByUser += 1;
    conv.lastAdminReplyId = adminDoc._id;
    conv.lastAdminReplyName = adminName;
    if (conv.status === "closed") conv.status = "open";
    await conv.save();

    const persisted = conv.messages[conv.messages.length - 1];

    if (global.io) {
      const supportRoom = "supportRoom:" + conv._id.toString();
      global.io.in(supportRoom).emit("supportMessage", JSON.stringify(persisted));
      global.io.in("supportInbox").emit("supportInboxUpdated", {
        conversationId: conv._id.toString(),
        userId: conv.userId.toString(),
        lastMessage: trimmed.slice(0, 120),
        senderType: "admin",
        unreadByUser: conv.unreadByUser,
        lastActivityAt: conv.lastActivityAt,
      });
    }

    // Push to the user's device. Look up fcmToken on User (the existing
    // User schema carries it from device registration).
    (async () => {
      try {
        const user = await User.findById(conv.userId).select("fcmToken isBlock").lean();
        if (!user || user.isBlock || !user.fcmToken) return;
        const adminInstance = await admin;
        await adminInstance.messaging().send({
          token: user.fcmToken,
          notification: {
            title: `Support: ${adminName}`,
            body: trimmed.slice(0, 120),
          },
          data: {
            type: "SUPPORT_REPLY",
            conversationId: conv._id.toString(),
          },
        });
        const notif = new Notification();
        notif.userId = conv.userId;
        notif.title = `Reply from ${adminName}`;
        notif.message = trimmed.slice(0, 120);
        notif.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
        await notif.save();
      } catch (err) {
        console.error("support sendAdminMessage notif error:", err.message);
      }
    })();

    return res.status(200).json({ status: true, message: "Sent", data: persisted });
  } catch (error) {
    console.error("sendAdminMessage error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Admin inbox — paginated list of conversations sorted by most recent
// activity. Filterable by status (open/closed/all). Each row carries
// just enough to render the inbox tile without fetching messages.
exports.adminInbox = async (req, res) => {
  try {
    const start = Math.max(1, parseInt(req.query.start) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const status = req.query.status; // "open" | "closed" | undefined (= all)
    const search = (req.query.search || "").toString().trim();

    const match = {};
    if (status === "open" || status === "closed") match.status = status;

    let cursor = SupportConversation.find(match)
      .sort({ lastActivityAt: -1 })
      .skip((start - 1) * limit)
      .limit(limit)
      .populate("userId", "firstName lastName image email mobileNumber")
      .lean();

    let conversations = await cursor;

    // Cheap client-side search filter on the populated user fields. If
    // the inbox grows past a few thousand convos, replace with a $text
    // index on User.
    if (search) {
      const q = search.toLowerCase();
      conversations = conversations.filter((c) => {
        const u = c.userId || {};
        return (
          (u.firstName || "").toLowerCase().includes(q) ||
          (u.lastName || "").toLowerCase().includes(q) ||
          (u.email || "").toLowerCase().includes(q) ||
          (u.mobileNumber || "").toString().includes(q)
        );
      });
    }

    // Trim messages to just the last one for the inbox tile preview —
    // the full thread is fetched via getConversation(id).
    const trimmed = conversations.map((c) => {
      const last = c.messages && c.messages.length > 0 ? c.messages[c.messages.length - 1] : null;
      return {
        _id: c._id,
        userId: c.userId,
        status: c.status,
        unreadByAdmin: c.unreadByAdmin,
        unreadByUser: c.unreadByUser,
        lastActivityAt: c.lastActivityAt,
        lastAdminReplyName: c.lastAdminReplyName,
        lastMessage: last
          ? { senderType: last.senderType, text: (last.text || "").slice(0, 200), createdAt: last.createdAt }
          : null,
      };
    });

    const totalOpen = await SupportConversation.countDocuments({ status: "open" });
    const totalUnread = await SupportConversation.aggregate([
      { $match: { status: "open" } },
      { $group: { _id: null, n: { $sum: "$unreadByAdmin" } } },
    ]);

    return res.status(200).json({
      status: true,
      conversations: trimmed,
      totalOpen,
      totalUnreadMessages: (totalUnread[0] && totalUnread[0].n) || 0,
    });
  } catch (error) {
    console.error("adminInbox error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Admin opens a single ticket — full message thread + user details.
// Marks all user-sent messages as read and zeros the admin unread count.
exports.adminGetConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(200).json({ status: false, message: "Valid conversationId required" });
    }

    const conv = await SupportConversation.findById(conversationId).populate(
      "userId",
      "firstName lastName image email mobileNumber"
    );
    if (!conv) return res.status(200).json({ status: false, message: "Conversation not found" });

    if (conv.unreadByAdmin > 0) {
      conv.messages.forEach((m) => {
        if (m.senderType === "user" && !m.isRead) m.isRead = true;
      });
      conv.unreadByAdmin = 0;
      await conv.save();

      // Broadcast the read-receipt to the inbox so other admins see
      // the unread badge clear in real time.
      if (global.io) {
        global.io.in("supportInbox").emit("supportInboxUpdated", {
          conversationId: conv._id.toString(),
          unreadByAdmin: 0,
          lastActivityAt: conv.lastActivityAt,
        });
      }
    }

    return res.status(200).json({ status: true, conversation: conv });
  } catch (error) {
    console.error("adminGetConversation error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};

// Admin closes a ticket. Doesn't delete — `closed` just hides it from
// the default "open" inbox tab. Either side sending a new message
// auto-reopens it (the message handlers above flip status back to open).
exports.adminCloseConversation = async (req, res) => {
  try {
    const { conversationId } = req.body || {};
    if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) {
      return res.status(200).json({ status: false, message: "Valid conversationId required" });
    }
    const conv = await SupportConversation.findByIdAndUpdate(
      conversationId,
      { status: "closed" },
      { new: true }
    );
    if (!conv) return res.status(200).json({ status: false, message: "Conversation not found" });

    if (global.io) {
      global.io.in("supportInbox").emit("supportInboxUpdated", {
        conversationId: conv._id.toString(),
        status: "closed",
      });
    }

    return res.status(200).json({ status: true, message: "Closed", conversation: conv });
  } catch (error) {
    console.error("adminCloseConversation error:", error);
    return res.status(500).json({ status: false, message: error.message });
  }
};
