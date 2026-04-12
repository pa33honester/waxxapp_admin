const mongoose = require("mongoose");

const favoriteSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

favoriteSchema.index({ userId: 1 });
favoriteSchema.index({ productId: 1 });
favoriteSchema.index({ categoryId: 1 });
favoriteSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Favorite", favoriteSchema);
