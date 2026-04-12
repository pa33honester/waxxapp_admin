const mongoose = require("mongoose");

const withdrawSchema = new mongoose.Schema(
  {
    name: { type: String },
    image: { type: String },
    details: { type: Array, default: [] },
    isEnabled: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

withdrawSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Withdraw", withdrawSchema);
