const mongoose = require("mongoose");

// Persisted chat-comment log per live show. Today comments are emitted
// via Socket.IO and consumed in real-time only — buyers who join late
// see nothing. This collection lets us replay the recent backlog when
// a buyer joins via a chatHistory endpoint.
const liveChatSchema = new mongoose.Schema(
  {
    liveSellingHistoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LiveSellingHistory",
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, default: "" },
    userImage: { type: String, default: "" },
    commentText: { type: String, default: "" },

    // System messages (SOLD, BID, GIVEAWAY_WIN, FOLLOW) ride the same
    // socket event; persisting `type`/`systemType` lets the replay render
    // identically to the live event in `live_widget.dart`.
    type: { type: String, default: "" },
    systemType: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

liveChatSchema.index({ liveSellingHistoryId: 1, createdAt: 1 });

// Auto-delete chat older than 30 days so the collection doesn't grow
// unbounded — replays are only meaningful while the show is on air or
// shortly after.
liveChatSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 30 }
);

module.exports = mongoose.model("LiveChat", liveChatSchema);
