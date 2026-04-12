const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema(
  {
    name: { type: String, default: "", unique: true },
    symbol: { type: String, default: "", unique: true },
    countryCode: { type: String, default: "" },
    currencyCode: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Currency", currencySchema);
