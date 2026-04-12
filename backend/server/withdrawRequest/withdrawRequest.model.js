const mongoose = require("mongoose");

const withdrawRequestSchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
    amount: { type: Number, default: 0 },
    status: { type: Number, default: 1, enum: [1, 2, 3] }, //1.pending 2.approved 3.rejected
    paymentGateway: { type: String, default: "" },
    paymentDetails: { type: Array, default: [] },
    reason: { type: String, default: "" },
    uniqueId: { type: String, default: "" },
    requestDate: { type: String, default: "" },
    acceptOrDeclineDate: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

withdrawRequestSchema.index({ status: 1 });
withdrawRequestSchema.index({ sellerId: 1, status: 1 });
withdrawRequestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("WithdrawRequest", withdrawRequestSchema);
