const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, trim: true },
    productCode: { type: String, trim: true, default: "" },
    description: { type: String, trim: true },
    productSaleType: { type: Number, enum: [1, 2, 3] }, // 1. Buy Now, 2. Auction, 3. Not for Sale

    allowOffer: { type: Boolean, default: false },
    minimumOfferPrice: { type: Number, default: 0 }, // Used if allowOffer is true
    price: { type: Number, default: 0 }, //regular price
    shippingCharges: { type: Number, default: 0 },

    enableAuction: { type: Boolean, default: false },
    scheduleTime: { type: Date, default: null }, //for auction
    auctionStartingPrice: { type: Number, default: 0 },
    // Step between consecutive bids — used by proxy/auto-bid counters and by
    // the client's quick-bid "BID $next" button.
    bidIncrement: { type: Number, default: 5 },
    enableReservePrice: { type: Boolean, default: false },
    reservePrice: { type: Number, default: 0 }, //if that price offer bid get then product sold
    auctionDuration: { type: Number, default: 0 }, //in days
    auctionStartDate: { type: Date, default: null },
    auctionEndDate: { type: Date, default: null },

    processingTime: { type: String, default: "" },
    recipientAddress: { type: String, default: "" },
    isImmediatePaymentRequired: { type: Boolean, default: false },

    mainImage: { type: String, default: "" },
    images: { type: Array, default: [] },

    attributes: { type: Array, default: [] },

    quantity: { type: Number, default: 0 },
    review: { type: Number, default: 0 },
    sold: { type: Number, default: 0 },

    searchCount: { type: Number, default: 0 },
    lastSearchedAt: { type: Date, default: null },

    isOutOfStock: { type: Boolean, default: false },
    isNewCollection: { type: Boolean, default: false },
    isSelect: { type: Boolean, default: false }, //when seller is live then seller took the selected products and go for live
    isAddByAdmin: { type: Boolean, default: false }, //fake product add by the admin
    isUpdateByAdmin: { type: Boolean, default: false },

    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: "SubCategory" },

    //create product request status
    createStatus: {
      type: String,
      default: "All",
      enum: ["Pending", "Approved", "Rejected", "All"],
    },

    //update product request status
    updateStatus: {
      type: String,
      default: "All",
      enum: ["Pending", "Approved", "Rejected", "All"],
    },

    date: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

productSchema.index({ seller: 1 });
productSchema.index({ category: 1 });
productSchema.index({ subCategory: 1 });
productSchema.index({ review: -1 });
productSchema.index({ sold: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ lastSearchedAt: -1 });
productSchema.index({ searchCount: -1 });
productSchema.index({ category: 1, createStatus: 1, scheduleTime: 1 });
productSchema.index({ createStatus: 1, scheduleTime: 1 });

// Full-text index for unified search. Weighted so matches on productName
// outrank matches in description / productCode.
productSchema.index(
  { productName: "text", description: "text", productCode: "text" },
  { weights: { productName: 10, productCode: 5, description: 1 }, name: "product_text_idx" }
);

module.exports = mongoose.model("Product", productSchema);
