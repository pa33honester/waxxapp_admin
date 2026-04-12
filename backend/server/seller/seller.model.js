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

    bankDetails: {
      bankBusinessName: { type: String, default: null },
      bankName: { type: String, default: null },
      accountNumber: { type: Number, default: null },
      IFSCCode: { type: String, default: null },
      branchName: { type: String, default: null },
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

sellerSchema.index({ userId: 1 });
sellerSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Seller", sellerSchema);
