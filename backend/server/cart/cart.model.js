const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
        purchasedTimeProductPrice: { type: Number, default: 0 },
        purchasedTimeShippingCharges: { type: Number, default: 0 },
        productCode: { type: String },
        productQuantity: { type: Number, default: 0 },
        attributesArray: { type: Array, default: [] },
      },
    ],
    totalItems: { type: Number, default: 0 }, //Holds total number of items in the cart
    totalShippingCharges: { type: Number, default: 0 },
    subTotal: { type: Number, default: 0 }, //product price * total product quantity
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

cartSchema.index({ "items.productId": 1, "items.sellerId": 1 });
cartSchema.index({ userId: 1 });

module.exports = mongoose.model("Cart", cartSchema);
