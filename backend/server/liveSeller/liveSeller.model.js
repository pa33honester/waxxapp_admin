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

    // Updated by the seller's app via POST /liveSeller/heartbeat every 30s
    // while broadcasting. The home-page sweep evicts rows whose heartbeat
    // is older than ~90s, so a crashed/killed seller drops off the buyer
    // list within ~2 minutes regardless of the socket disconnect path.
    lastHeartbeatAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

liveSellerSchema.index({ sellerId: 1 });
liveSellerSchema.index({ liveSellingHistoryId: 1 });

module.exports = mongoose.model("LiveSeller", liveSellerSchema);
