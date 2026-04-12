const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    review: { type: String },
    date: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

reviewSchema.index({ userId: 1 });
reviewSchema.index({ productId: 1 });

module.exports = mongoose.model("Review", reviewSchema);
