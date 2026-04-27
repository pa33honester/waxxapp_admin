const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    email: { type: String, default: "" },
    otp: { type: Number },
    // Added for purpose-aware OTP flows (e.g. email change). Existing
    // password-reset / login OTPs leave these blank, so the original
    // findOne({ email }) lookups still work.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    purpose: { type: String, default: "" },
    expiresAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// MongoDB TTL: rows whose `expiresAt` is a Date older than now() are
// auto-removed within ~60s. Rows without an `expiresAt` (legacy OTPs) are
// ignored by the TTL — so this is safe to add without backfilling.
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("OTP", otpSchema);
