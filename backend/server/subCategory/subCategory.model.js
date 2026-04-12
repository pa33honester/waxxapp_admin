const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

subCategorySchema.index({ category: 1 });
subCategorySchema.index({ createdAt: -1 });

module.exports = mongoose.model("SubCategory", subCategorySchema);
