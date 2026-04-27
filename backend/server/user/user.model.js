const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    dob: { type: String, trim: true, default: "" },
    gender: { type: String, trim: true, default: "" },
    location: { type: String, trim: true, default: "" },
    countryCode: { type: String, trim: true, default: null },
    mobileNumber: { type: String, trim: true, default: null },
    image: { type: String, trim: true, default: null },

    password: { type: String, trim: true, default: null },
    uniqueId: { type: String, trim: true, default: null },
    loginType: { type: Number, enum: [1, 2, 3, 4, 5] }, //1.google 2.Apple 3.email-password 4.isLogin 5.mobile

    identity: { type: String, trim: true },
    fcmToken: { type: String, trim: true, default: null },
    date: String,

    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },

    notification: {
      paymentReminder: { type: Boolean, default: true },
      productDelivery: { type: Boolean, default: true },
      expiredVoucher: { type: Boolean, default: true },
    },

    isBlock: { type: Boolean, default: false },
    amount: { type: Number, default: 0 }, //when order cancel at that time increase refund amount

    //If user become the seller
    isSeller: { type: Boolean, default: false },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

userSchema.index({ isBlock: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ seller: -1 });

// Email is unique among users who actually have one. Empty-string emails
// (left over from phone-signup users before we required email at signup)
// are excluded via the partial filter so they don't all collide on each
// other. The one-shot `scripts/migrate_user_email.js` should be run before
// this index is built in production to lower-case + de-dupe existing rows.
userSchema.index(
  { email: 1 },
  {
    unique: true,
    partialFilterExpression: { email: { $type: "string", $ne: "" } },
  }
);

module.exports = mongoose.model("User", userSchema);
