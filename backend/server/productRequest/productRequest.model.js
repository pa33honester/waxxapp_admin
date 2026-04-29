const mongoose = require("mongoose");

const productRequestSchema = new mongoose.Schema(
  {
    productName: { type: String, trim: true },
    productCode: { type: String, trim: true, default: "" },
    description: { type: String, trim: true },
    productSaleType: { type: Number, enum: [1, 2, 3] }, // 1. Buy Now, 2. Auction, 3. Not for Sale

    allowOffer: { type: Boolean, default: false },
    minimumOfferPrice: { type: Number, default: 0 }, // Used if allowOffer is true
    price: { type: Number, default: 0 }, //regular price
    shippingCharges: { type: Number, default: 0 },
    // Mirror of Product.deliveryType so admin-approval edits carry the
    // value through to the live product on accept.
    deliveryType: { type: String, enum: ["local", "nationwide", "international", null], default: null },

    enableAuction: { type: Boolean, default: false },
    scheduleTime: { type: Date, default: Date.now },
    auctionStartingPrice: { type: Number, default: 0 },
    enableReservePrice: { type: Boolean, default: false },
    reservePrice: { type: Number, default: 0 }, //if that price offer bid get then product sold
    auctionDuration: { type: Number, default: 0 }, //in days
    auctionStartDate: { type: Date, default: Date.now },
    auctionEndDate: { type: Date, default: Date.now },

    processingTime: { type: String, default: "" },
    recipientAddress: { type: String, default: "" },
    isImmediatePaymentRequired: { type: Boolean, default: false },

    mainImage: { type: String, default: "" },
    images: { type: Array, default: [] },

    attributes: { type: Array, default: [] },

    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },

    // Pending promo-code attachment list. When the request is approved
    // (acceptUpdateRequest), this is copied onto the live Product's
    // promoCodes array so the buyer side picks it up.
    promoCodes: [{ type: mongoose.Schema.Types.ObjectId, ref: "PromoCode", default: [] }],

    //update product request status
    updateStatus: {
      type: String,
      default: "All",
      enum: ["Pending", "Approved", "Rejected", "All"],
    },

    date: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productRequestSchema.index({ seller: 1 });
productRequestSchema.index({ category: 1 });
productRequestSchema.index({ subCategory: 1 });

module.exports = mongoose.model("ProductRequest", productRequestSchema);
