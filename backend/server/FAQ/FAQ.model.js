const mongoose = require("mongoose");

const FAQSchema = new mongoose.Schema(
  {
    question: { type: String, trim: true },
    answer: { type: String, trim: true },
    isView: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

FAQSchema.index({ createdAt: 1 });

module.exports = mongoose.model("FAQ", FAQSchema);
