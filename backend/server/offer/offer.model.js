const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true },

    // Listed price snapshot at offer-creation time — useful for analytics
    // ("what discount did the seller actually accept") and for rendering the
    // offer row without re-reading the product.
    listedPrice: { type: Number, default: 0 },
    offerAmount: { type: Number, required: true },

    // When the seller counters, this holds their proposed amount. The buyer
    // can then accept or decline the counter. We never mutate `offerAmount`
    // on a counter — that way the history of "buyer asked X, seller
    // countered Y" is recoverable.
    counterAmount: { type: Number, default: null },
    counteredBy: { type: String, enum: ["buyer", "seller", null], default: null },

    // Lifecycle:
    //   pending     — buyer submitted, seller hasn't acted
    //   countered   — seller proposed a counterAmount, buyer hasn't acted
    //   accepted    — final agreement, Order created (see orderId)
    //   declined    — either party walked away
    //   expired     — auto-expired (future: not wired in MVP)
    //   withdrawn   — buyer retracted before seller acted
    status: {
      type: String,
      enum: ["pending", "countered", "accepted", "declined", "expired", "withdrawn"],
      default: "pending",
    },

    // Populated once the offer is accepted and the Order row is created.
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },

    // Optional buyer-supplied message ("Would you take $45? Big fan.")
    buyerMessage: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

offerSchema.index({ sellerId: 1, status: 1, createdAt: -1 });
offerSchema.index({ buyerId: 1, createdAt: -1 });
offerSchema.index({ productId: 1, buyerId: 1, status: 1 });

module.exports = mongoose.model("Offer", offerSchema);
