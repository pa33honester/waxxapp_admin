const mongoose = require("mongoose");

// One row per submission. Resubmission-after-rejection writes a new
// row (preserves history + reviewer audit). The latest row's `status`
// is also denormalized onto User.verificationStatus for hot read paths
// (badge rendering on product cards, live host name, search rows).
const verificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // Path under backend/private_storage/. Served via the auth-gated
    // /private-file/:filename controller — never publicly accessible.
    selfieFile: { type: String, default: null },

    status: {
      type: String,
      enum: ["pending_review", "verified", "rejected"],
      default: "pending_review",
    },

    // ML Kit on-device check result the client posted alongside the
    // selfie. Stored for admin context + future analytics; NOT used
    // for auto-pass (admin reviews every submission).
    autoCheckResult: {
      faceCount: { type: Number, default: null },
      leftEyeOpen: { type: Number, default: null }, // probability 0..1
      rightEyeOpen: { type: Number, default: null },
      faceAreaRatio: { type: Number, default: null },
      mlKitVersion: { type: String, default: null },
    },

    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin", default: null },
    rejectionReason: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Admin queue: list pending submissions oldest-first.
verificationSchema.index({ status: 1, createdAt: -1 });

// "My latest submission": user fetches their most recent row.
verificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Verification", verificationSchema);
