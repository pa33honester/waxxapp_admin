const mongoose = require("mongoose");

const sellerWalletSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", deault: null },
    itemId: { type: mongoose.Schema.Types.ObjectId, default: null },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", deault: null },
    commissionPerProductQuantity: { type: Number, default: 0 }, //adminEarning
    shippingCharges: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }, //sellerEarning : purchasedTimeProductPrice * productQuantity - commissionPerProductQuantity + purchasedTimeShippingCharges
    transactionType: {
      type: Number,
      enum: [1, 2],
    },
    // 1 - amount deposit  (At order delivery)
    // 2 - amount deduct (When withdrawal request is accepted)

    date: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

sellerWalletSchema.index({ orderId: 1 });
sellerWalletSchema.index({ productId: 1 });
sellerWalletSchema.index({ sellerId: 1 });
sellerWalletSchema.index({ itemId: 1 });
sellerWalletSchema.index({ type: 1 });
sellerWalletSchema.index({ status: 1 });

module.exports = mongoose.model("SellerWallet", sellerWalletSchema);
