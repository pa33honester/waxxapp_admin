const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema(
  {
    rating: { type: Number, default: 0 },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

ratingSchema.index({ userId: 1 });
ratingSchema.index({ productId: 1 });

module.exports = mongoose.model("Rating", ratingSchema);
