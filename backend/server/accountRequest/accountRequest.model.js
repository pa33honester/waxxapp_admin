const mongoose = require("mongoose");

// A prospective user's sign-up details collected by the in-app sign-up
// assistant chatbot. The chatbot can't create accounts on its own — it
// drops a "pending" request here and an admin reviews + approves it in the
// admin panel, which then creates the real User document (see
// accountRequest.controller.js -> approve).
const accountRequestSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, default: "" },
    lastName: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    mobileNumber: { type: String, trim: true, default: null },
    countryCode: { type: String, trim: true, default: null },

    // Stored Cryptr-encrypted, never plaintext at rest — the same reversible
    // scheme every User password uses (see server/user/user.controller.js).
    password: { type: String, trim: true, default: null },

    // Device id sent by the app (the `identify` global). Used for a light
    // per-device rate-limit on submissions.
    identity: { type: String, trim: true, default: null },

    source: { type: String, trim: true, default: "signup_assistant" },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectReason: { type: String, trim: true, default: null },

    // Set once approved — the User that was created from this request.
    createdUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reviewedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

accountRequestSchema.index({ createdAt: -1 });
accountRequestSchema.index({ status: 1 });
accountRequestSchema.index({ email: 1 });
accountRequestSchema.index({ identity: 1 });

module.exports = mongoose.model("AccountRequest", accountRequestSchema);
