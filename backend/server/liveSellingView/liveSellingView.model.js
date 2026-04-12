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

module.exports = mongoose.model("LiveSellingView", LiveViewSchema);
