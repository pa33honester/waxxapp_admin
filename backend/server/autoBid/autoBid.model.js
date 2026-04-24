const mongoose = require("mongoose");

const autoBidSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    maxBidAmount: { type: Number, required: true },
    currentBid: { type: Number, default: 0 }, // last bid placed on behalf of user
    // Set on the LiveSeller side so live-auction counters can be scoped per
    // show — null for manual auctions.
    liveHistoryId: { type: mongoose.Schema.Types.ObjectId, ref: "LiveSellingHistory", default: null },
    attributes: { type: Array, default: [] },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

autoBidSchema.index({ productId: 1, isActive: 1, maxBidAmount: -1 });
autoBidSchema.index({ userId: 1, productId: 1 }, { unique: true });

module.exports = mongoose.model("AutoBid", autoBidSchema);
