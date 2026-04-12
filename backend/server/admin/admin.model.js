const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "Admin" },
    email: { type: String, trim: true },
    password: { type: String, trim: true },
    image: { type: String, trim: true, default: "" },
    purchaseCode: { type: String, default: "" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Admin", adminSchema);
