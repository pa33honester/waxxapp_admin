const mongoose = require("mongoose");

const reportLiveSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    liveSellingHistoryId: { type: mongoose.Schema.Types.ObjectId, ref: "LiveSellingHistory", default: null },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
    description: { type: String, default: "" },
    reportDate: { type: String, default: "" },
    status: { type: Number, enum: [1, 2], default: 1 }, // 1.pending 2.solved
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

reportLiveSchema.index({ userId: 1 });
reportLiveSchema.index({ liveSellingHistoryId: 1 });
reportLiveSchema.index({ sellerId: 1 });
reportLiveSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ReportLive", reportLiveSchema);
