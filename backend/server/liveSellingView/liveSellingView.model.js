const mongoose = require("mongoose");

const LiveViewSchema = new mongoose.Schema(
  {
    name: String,
    image: String,
    agoraId: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    liveSellingHistoryId: { type: mongoose.Schema.Types.ObjectId, ref: "LiveSellingHistory" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

LiveViewSchema.index({ userId: 1 });
LiveViewSchema.index({ liveSellingHistoryId: 1 });
// Atomic dedupe of (viewer, broadcast) pairs so concurrent addView
// emits from the LiveSwipeView mount/unmount churn can't slip past
// the find-then-save check and end up creating duplicate rows + a
// duplicate "<name> joined" chat row each time. Combined with the
// upsert-with-rawResult path in socket.js's addView handler, the
// JOIN system message now fires exactly once per (user, live).
LiveViewSchema.index(
  { userId: 1, liveSellingHistoryId: 1 },
  { unique: true, partialFilterExpression: { userId: { $type: "objectId" } } }
);

module.exports = mongoose.model("LiveSellingView", LiveViewSchema);
