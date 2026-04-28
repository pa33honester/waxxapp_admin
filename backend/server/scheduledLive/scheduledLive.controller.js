const ScheduledLive = require("./scheduledLive.model");
const Follower = require("../follower/follower.model");
const User = require("../user/user.model");
const Seller = require("../seller/seller.model");
const Notification = require("../notification/notification.model");
const mongoose = require("mongoose");
const admin = require("../../util/privateKey");
const config = require("../../config");
const { deleteFile } = require("../../util/deleteFile");

// ─── Seller endpoints ─────────────────────────────────────────────────────────

exports.schedule = async (req, res) => {
  try {
    const { sellerId, title, description, scheduledAt } = req.body;

    if (!sellerId || !title || !scheduledAt) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "sellerId, title, and scheduledAt are required." });
    }

    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime()) || scheduledDate <= new Date()) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "scheduledAt must be a valid future date." });
    }

    // Optional cover image. Saved by multer under storage/ — we store the
    // public URL on the doc, matching the rest of the app's storage paths.
    const image = req.file ? config.baseURL + req.file.path : "";

    const show = await ScheduledLive.create({
      sellerId,
      title: title.trim(),
      description: description?.trim() || "",
      image,
      scheduledAt: scheduledDate,
    });

    return res.status(200).json({ status: true, message: "Show scheduled successfully", data: show });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.error("ScheduleLive Error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

exports.getScheduledBySeller = async (req, res) => {
  try {
    const { sellerId } = req.query;
    if (!sellerId) return res.status(200).json({ status: false, message: "sellerId is required." });

    const shows = await ScheduledLive.find({
      sellerId,
      scheduledAt: { $gte: new Date() },
      status: "scheduled",
    })
      .sort({ scheduledAt: 1 })
      .lean();

    return res.status(200).json({ status: true, message: "Scheduled shows fetched", data: shows });
  } catch (error) {
    console.error("GetScheduledBySeller Error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// ─── User endpoints ───────────────────────────────────────────────────────────

exports.getUpcomingForUser = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(200).json({ status: false, message: "userId is required." });

    const objectUserId = new mongoose.Types.ObjectId(userId);

    // Find sellers the user follows
    const following = await Follower.find({ userId: objectUserId }).select("sellerId").lean();
    const sellerIds = following.map((f) => f.sellerId);

    if (sellerIds.length === 0) {
      return res.status(200).json({ status: true, message: "No upcoming shows", data: [] });
    }

    // Get upcoming shows from followed sellers
    const shows = await ScheduledLive.aggregate([
      {
        $match: {
          sellerId: { $in: sellerIds },
          scheduledAt: { $gte: new Date() },
          status: "scheduled",
        },
      },
      { $sort: { scheduledAt: 1 } },
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
          _id: 1,
          title: 1,
          description: 1,
          scheduledAt: 1,
          status: 1,
          sellerId: 1,
          // The seller's *avatar* (so buyers can recognise who is broadcasting).
          sellerImage: "$seller.image",
          // The cover image the seller uploaded for this specific show.
          image: 1,
          sellerName: { $ifNull: ["$seller.businessName", { $concat: ["$seller.firstName", " ", "$seller.lastName"] }] },
          hasReminder: {
            $in: [objectUserId, "$reminderUsers"],
          },
        },
      },
    ]);

    return res.status(200).json({ status: true, message: "Upcoming shows fetched", data: shows });
  } catch (error) {
    console.error("GetUpcomingForUser Error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

exports.setReminder = async (req, res) => {
  try {
    const { userId, scheduleId } = req.body;
    if (!userId || !scheduleId) {
      return res.status(200).json({ status: false, message: "userId and scheduleId are required." });
    }

    await ScheduledLive.findByIdAndUpdate(scheduleId, {
      $addToSet: { reminderUsers: userId },
    });

    return res.status(200).json({ status: true, message: "Reminder set successfully" });
  } catch (error) {
    console.error("SetReminder Error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

exports.cancelReminder = async (req, res) => {
  try {
    const { userId, scheduleId } = req.body;
    if (!userId || !scheduleId) {
      return res.status(200).json({ status: false, message: "userId and scheduleId are required." });
    }

    await ScheduledLive.findByIdAndUpdate(scheduleId, {
      $pull: { reminderUsers: new mongoose.Types.ObjectId(userId) },
    });

    return res.status(200).json({ status: true, message: "Reminder cancelled" });
  } catch (error) {
    console.error("CancelReminder Error:", error);
    return res.status(500).json({ status: false, message: "Internal server error" });
  }
};

// ─── Internal: notify reminder users when seller goes live ───────────────────

/**
 * Called after a seller goes live (via response-finish hook in liveSeller.route.js).
 * Finds a matching scheduled show (within ±30 min of now) and notifies reminder users.
 */
exports.notifyScheduledStart = async (sellerId) => {
  if (!sellerId) return;

  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - 30 * 60 * 1000);
    const windowEnd = new Date(now.getTime() + 30 * 60 * 1000);

    const show = await ScheduledLive.findOneAndUpdate(
      {
        sellerId,
        scheduledAt: { $gte: windowStart, $lte: windowEnd },
        status: "scheduled",
        notifiedAt: null,
      },
      { status: "live", notifiedAt: now },
      { new: true }
    ).lean();

    if (!show || show.reminderUsers.length === 0) return;

    // Get FCM tokens for all reminder users
    const users = await User.find({
      _id: { $in: show.reminderUsers },
      fcmToken: { $ne: null },
    })
      .select("fcmToken")
      .lean();

    const tokens = users.map((u) => u.fcmToken).filter(Boolean);
    if (tokens.length === 0) return;

    // Fetch seller name for notification
    const seller = await Seller.findById(sellerId).select("businessName firstName lastName image").lean();
    const sellerName = seller?.businessName || `${seller?.firstName || ""} ${seller?.lastName || ""}`.trim();

    const adminInstance = await admin;
    await adminInstance.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: `${sellerName} is live now!`,
        body: show.title ? `"${show.title}" has started. Tap to join!` : "Your scheduled show has started!",
      },
      data: {
        type: "LIVE_STARTED",
        sellerId: sellerId.toString(),
        sellerName,
        scheduleId: show._id.toString(),
      },
    });

    console.log(`LIVE_STARTED sent to ${tokens.length} users for show "${show.title}"`);
  } catch (err) {
    console.error("NotifyScheduledStart Error:", err);
  }
};

// ─── Internal: notify followers when a seller goes live (ad-hoc) ─────────────

/**
 * Called after a seller goes live (via response-finish hook in
 * liveSeller.route.js, alongside notifyScheduledStart). Sends a push
 * notification to every follower of [sellerId] who isn't already going
 * to be notified by notifyScheduledStart (which targets the show's
 * reminderUsers). Also writes a Notification row per recipient so the
 * push has a matching in-app entry.
 */
exports.notifyFollowersLiveStarted = async (sellerId) => {
  if (!sellerId) return;

  try {
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    const seller = await Seller.findById(sellerObjectId).select("firstName lastName businessName image").lean();
    if (!seller) return;

    const sellerName = seller.businessName || `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || "A seller you follow";

    // Pull every follower's userId in one go.
    const followerRows = await Follower.find({ sellerId: sellerObjectId }).select("userId").lean();
    if (followerRows.length === 0) return;
    let followerIds = followerRows.map((f) => f.userId).filter(Boolean);

    // De-dupe with the scheduled-show reminder list (if any). Anyone in
    // there is already getting a notification from notifyScheduledStart;
    // we don't want them to see the same push twice.
    const now = new Date();
    const recentShow = await ScheduledLive.findOne({
      sellerId: sellerObjectId,
      // Match either a still-scheduled show or one that notifyScheduledStart
      // just flipped to "live" in the same request.
      status: { $in: ["scheduled", "live"] },
      scheduledAt: { $gte: new Date(now.getTime() - 30 * 60 * 1000), $lte: new Date(now.getTime() + 30 * 60 * 1000) },
    })
      .select("reminderUsers")
      .lean();
    if (recentShow && Array.isArray(recentShow.reminderUsers) && recentShow.reminderUsers.length > 0) {
      const reminderSet = new Set(recentShow.reminderUsers.map((id) => String(id)));
      followerIds = followerIds.filter((id) => !reminderSet.has(String(id)));
    }
    if (followerIds.length === 0) return;

    // Fetch FCM tokens for the deduped recipient set, skipping blocked /
    // seller accounts (sellers don't need a "follow" notification).
    const recipients = await User.find({
      _id: { $in: followerIds },
      isBlock: { $ne: true },
      isSeller: { $ne: true },
    })
      .select("_id fcmToken")
      .lean();
    if (recipients.length === 0) return;

    const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const title = `${sellerName} is live now! 🚀✨`;
    const body = `Tap to watch ${sellerName}'s live show.`;

    // Persist Notification rows so the in-app inbox shows the alert
    // even when the user has push notifications muted at the OS level.
    await Notification.insertMany(
      recipients.map((u) => ({
        title,
        message: body,
        image: seller.image || null,
        date,
        userId: u._id,
        sellerId: sellerObjectId,
      })),
      { ordered: false }
    ).catch((err) => console.error("notifyFollowersLiveStarted insertMany error:", err.message));

    const tokens = recipients.map((u) => u.fcmToken).filter(Boolean);
    if (tokens.length === 0) {
      console.log(`notifyFollowersLiveStarted: ${recipients.length} followers, none with fcmToken`);
      return;
    }

    const adminInstance = await admin;
    await adminInstance.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body, image: seller.image || undefined },
      data: {
        type: "LIVE_STARTED",
        sellerId: sellerObjectId.toString(),
        sellerName,
      },
    });

    console.log(`notifyFollowersLiveStarted: pushed to ${tokens.length}/${recipients.length} followers of ${sellerName}`);
  } catch (err) {
    console.error("notifyFollowersLiveStarted error:", err);
  }
};
