const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    subCategory: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubCategory", default: [] }],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

categorySchema.index({ subCategory: 1 });
categorySchema.index({ createdAt: -1 });

module.exports = mongoose.model("Category", categorySchema);
