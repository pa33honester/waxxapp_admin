const mongoose = require("mongoose");

const liveSellingHistorySchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
    totalUser: { type: Number, default: 0 }, //how many user joined to view live [user count]
    comment: { type: Number, default: 0 },
    startTime: { type: String },
    endTime: { type: String },
    duration: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

liveSellingHistorySchema.index({ sellerId: 1 });

module.exports = mongoose.model("LiveSellingHistory", liveSellingHistorySchema);
