const mongoose = require("mongoose");

const giveawayEntrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    enteredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const giveawaySchema = new mongoose.Schema(
  {
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
    liveSellingHistoryId: { type: mongoose.Schema.Types.ObjectId, ref: "LiveSellingHistory", default: null },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },

    // 1 = standard (any viewer), 2 = followerOnly (only existing followers of sellerId)
    type: { type: Number, enum: [1, 2], default: 1 },

    // 1 = open, 2 = closed (no-entries / expired), 3 = drawn (winner selected), 4 = cancelled
    status: { type: Number, enum: [1, 2, 3, 4], default: 1 },

    entryWindowSeconds: { type: Number, default: 60 },
    startedAt: { type: Date, default: Date.now },
    closesAt: { type: Date, default: null },

    entries: { type: [giveawayEntrySchema], default: [] },

    winnerUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    winnerDrawnAt: { type: Date, default: null },
    winnerOrderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },

    shippingCharge: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

giveawaySchema.index({ liveSellingHistoryId: 1, status: 1 });
giveawaySchema.index({ sellerId: 1, createdAt: -1 });
giveawaySchema.index({ "entries.userId": 1 });

module.exports = mongoose.model("Giveaway", giveawaySchema);
