const mongoose = require("mongoose");

const scheduledLiveSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", trim: true },
    scheduledAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended", "cancelled"],
      default: "scheduled",
    },
    reminderUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    notifiedAt: { type: Date, default: null }, // prevents duplicate LIVE_STARTED sends
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

scheduledLiveSchema.index({ sellerId: 1, scheduledAt: 1 });
scheduledLiveSchema.index({ scheduledAt: 1, status: 1 }); // for cron/notification queries

module.exports = mongoose.model("ScheduledLive", scheduledLiveSchema);
