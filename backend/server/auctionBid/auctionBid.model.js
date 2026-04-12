const mongoose = require("mongoose");

const auctionBidSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null }, //productVendorId
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    attributes: { type: Array, default: [] },

    liveHistoryId: { type: mongoose.Schema.Types.ObjectId, ref: "LiveHistory", default: null },
    startingBid: { type: Number, default: 0 },
    currentBid: { type: Number, default: 0 },
    mode: {
      type: Number,
      enum: [1, 2],
      default: 2,
    }, // 1.mode: "live" → real-time during a stream 2.mode: "manual" → time-based or scheduled auction on website
    isWinningBid: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("AuctionBid", auctionBidSchema);

auctionBidSchema.index({ productId: 1, mode: 1, currentBid: -1 });
auctionBidSchema.index({ isWinningBid: 1 });
