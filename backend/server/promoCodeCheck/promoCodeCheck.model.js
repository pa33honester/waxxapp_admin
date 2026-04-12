const mongoose = require("mongoose");

const promoCodeCheckSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    promoCodeId: { type: mongoose.Schema.Types.ObjectId, ref: "PromoCode" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

promoCodeCheckSchema.index({ userId: 1 });
promoCodeCheckSchema.index({ promoCodeId: 1 });

module.exports = mongoose.model("PromoCodeCheck", promoCodeCheckSchema);
