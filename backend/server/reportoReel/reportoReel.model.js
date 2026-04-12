const mongoose = require("mongoose");

const reportReelSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reelId: { type: mongoose.Schema.Types.ObjectId, ref: "Reel", default: null },
    description: { type: String, default: "" },
    reportDate: { type: String, default: "" },
    status: { type: Number, enum: [1, 2], default: 1 }, // 1.pending 2.solved
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

reportReelSchema.index({ userId: 1 });
reportReelSchema.index({ reelId: 1 });
reportReelSchema.index({ createdAt: -1 });

module.exports = mongoose.model("ReportReel", reportReelSchema);
