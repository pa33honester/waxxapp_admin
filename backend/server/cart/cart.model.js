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
        // Shape B: which delivery option the buyer picked from the
        // product's `deliveryOptions[]`. `purchasedTimeShippingCharges`
        // is set to that option's price so totals stay self-contained
        // even if the seller later edits the product. Null/undefined
        // for legacy products that only have the single shippingCharges
        // + deliveryType pair (the cart total path uses those instead).
        chosenDeliveryType: { type: String, enum: ["local", "nationwide", "international", null], default: null },
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
