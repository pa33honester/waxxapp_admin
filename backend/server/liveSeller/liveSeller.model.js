const mongoose = require("mongoose");

const liveSellerSchema = new mongoose.Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    image: { type: String },
    businessName: { type: String },
    businessTag: { type: String },

    channel: { type: String },
    agoraUID: { type: Number, default: 0 },
    view: { type: Number, default: 0 },

    liveType: { type: Number, enum: [1, 2] }, //1.Normal 2.Auction
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
    liveSellingHistoryId: { type: mongoose.Schema.Types.ObjectId, ref: "LiveSellingHistory", default: null },

    selectedProducts: {
      type: [
        {
          productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
          productName: { type: String },
          mainImage: { type: String },
          price: { type: Number, default: 0 },
          productAttributes: [
            {
              name: { type: String, default: "" },
              values: { type: Array, default: [] },
            },
          ],
          minimumBidPrice: { type: Number, default: 0 },
          minAuctionTime: { type: Number, default: 60 },
          hasAuctionStarted: { type: Boolean, default: false },
          auctionEndTime: { type: Date, default: null },
          status: { type: String, enum: ["pending", "completed", "requeued"], default: "pending" },
          winnerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
          winningBid: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

liveSellerSchema.index({ sellerId: 1 });
liveSellerSchema.index({ liveSellingHistoryId: 1 });

module.exports = mongoose.model("LiveSeller", liveSellerSchema);
