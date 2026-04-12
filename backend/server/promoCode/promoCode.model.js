const mongoose = require("mongoose");

const promoCodeSchema = new mongoose.Schema(
  {
    promoCode: { type: String, trim: true, default: "" },
    discountType: { type: Number, enum: [0, 1] }, //0.flat 1.percentage
    discountAmount: { type: Number, default: 0 }, //amount or percentage
    minOrderValue: { type: Number, default: 0 },
    conditions: { type: Array, default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

promoCodeSchema.index({ createdAt: 1 });

module.exports = mongoose.model("PromoCode", promoCodeSchema);
