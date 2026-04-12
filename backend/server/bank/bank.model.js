const mongoose = require("mongoose");

const bankSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

bankSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Bank", bankSchema);
