const mongoose = require("mongoose");

const settingSchema = new mongoose.Schema(
  {
    privacyPolicyLink: { type: String, default: "PRIVACY POLICY LINK" },
    privacyPolicyText: { type: String, default: "PRIVACY POLICY TEXT" },

    termsAndConditionsLink: { type: String, default: "TERMS AND CONDITION LINK" },

    addressProof: {
      isRequired: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
    },

    govId: {
      isRequired: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
    },

    registrationCert: {
      isRequired: { type: Boolean, default: false },
      isActive: { type: Boolean, default: true },
    },

    zegoAppId: { type: String, default: "ZEGO APP ID" },
    zegoAppSignIn: { type: String, default: "ZEGO APP SIGN IN" },

    stripePublishableKey: { type: String, default: "STRIPE PUBLISHABLE KEY" },
    stripeSecretKey: { type: String, default: "STRIPE SECRET KEY" },
    stripeSwitch: { type: Boolean, default: false },

    razorPayId: { type: String, default: "RAZOR PAY ID" },
    razorSecretKey: { type: String, default: "RAZOR SECRET KEY" },
    razorPaySwitch: { type: Boolean, default: false },

    flutterWaveId: { type: String, default: "FLUTTER WAVE ID" },
    flutterWaveSwitch: { type: Boolean, default: false },

    paymentGateway: { type: Array, default: [] },

    adminCommissionCharges: { type: Number, default: 0 }, //in %
    cancelOrderCharges: { type: Number, default: 0 }, //in %

    paymentReminderForLiveAuction: { type: Number, default: 0 }, //In Minutes
    paymentReminderForManualAuction: { type: Number, default: 0 }, //In Minutes
    minPayout: { type: Number, default: 0 }, //seller

    withdrawLimit: { type: Number, default: 0 },

    isAddProductRequest: { type: Boolean, default: false }, //false then directly product add by seller, true then product add through request
    isUpdateProductRequest: { type: Boolean, default: false }, //false then directly product update by seller, true then product update through request

    isFakeData: { type: Boolean, default: false },
    isCashOnDelivery: { type: Boolean, default: false },

    openaiApiKey: { type: String, default: "" },

    resendApiKey: { type: String, default: "RESEND API KEY" },

    currency: {
      name: { type: String, default: "", unique: true },
      symbol: { type: String, default: "", unique: true },
      countryCode: { type: String, default: "" },
      currencyCode: { type: String, default: "" },
      isDefault: { type: Boolean, default: false },
    }, //default currency

    privateKey: { type: Object, default: {} }, //firebase.json handle notification
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

settingSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Setting", settingSchema);
