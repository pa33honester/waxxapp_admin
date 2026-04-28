const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema(
  {
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    businessTag: { type: String, default: "" },
    businessName: { type: String, default: "" },

    storeName: { type: String, default: null },
    businessType: { type: String, default: null },
    category: { type: String, default: null },
    logo: { type: String, default: null },
    description: { type: String, default: null },

    govId: { type: String, default: null },
    registrationCert: { type: String, default: null },
    addressProof: { type: String, default: null },

    email: { type: String, default: null },
    countryCode: { type: String, trim: true, default: null },
    mobileNumber: { type: String, default: null },
    gender: { type: String, default: "male" },
    image: { type: String, default: null },

    address: {
      address: { type: String, default: null },
      landMark: { type: String, default: null },
      city: { type: String, default: null },
      pinCode: { type: Number, default: null },
      state: { type: String, default: null },
      country: { type: String, default: null },
    },

    // Mobile-money payout details. Renamed from bank fields to mobile-money
    // semantics for the Ghana market — see scripts/migrate_seller_momo.js
    // for the one-time data migration that copies the old keys onto the
    // new ones. The `bankDetails` parent is intentionally kept as the doc
    // path so existing references in the rest of the codebase still work
    // structurally, only the leaf fields renamed.
    bankDetails: {
      bankBusinessName: { type: String, default: null },
      bankName: { type: String, default: null },
      momoNumber: { type: String, default: null }, // was: accountNumber (Number)
      networkName: {
        type: String,
        enum: ["MTN", "Vodafone", "AirtelTigo", null],
        default: null,
      }, // was: IFSCCode (free text)
      momoName: { type: String, default: null }, // was: branchName
    },

    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },

    identity: { type: String },
    uniqueId: { type: String, default: null },

    fcmToken: { type: String, default: null },
    date: { type: String, default: null },

    password: { type: String, default: null },
    loginType: { type: Number, enum: [1, 2, 3, 4] }, //1.google 2.Apple 3.email-password 4.isLogin
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    channel: { type: String, default: null },
    isLive: { type: Boolean, default: false },
    liveSellingHistoryId: { type: mongoose.Schema.Types.ObjectId, ref: "LiveSellingHistory", default: null },

    isBlock: { type: Boolean, default: false },
    isSeller: { type: Boolean, default: true },

    isFake: { type: Boolean, default: false },
    video: { type: String, default: null },
    selectedProducts: { type: Array, deafult: [] },

    netPayout: { type: Number, default: 0 }, //after order delivered at that time he will earn
    amountWithdrawn: { type: Number, default: 0 },

    // How multiple wins from this seller get charged for shipping in a
    // single bundle Order. "max" mirrors Whatnot's default (buyer pays the
    // heaviest single-item ship fee); "sum" preserves legacy per-item
    // accumulation; "flat" ignores per-item charges and uses the first
    // item's shipping as a flat rate.
    shippingMode: { type: String, enum: ["sum", "max", "flat"], default: "max" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

sellerSchema.index({ userId: 1 });
sellerSchema.index({ createdAt: -1 });
sellerSchema.index({ isLive: 1, updatedAt: -1 });

// Full-text index for unified search on businessName / names / tag.
sellerSchema.index(
  { businessName: "text", businessTag: "text", firstName: "text", lastName: "text" },
  { weights: { businessName: 10, businessTag: 6, firstName: 3, lastName: 3 }, name: "seller_text_idx" }
);

module.exports = mongoose.model("Seller", sellerSchema);
