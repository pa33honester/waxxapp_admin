const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    name: { type: String },
    country: { type: String },
    state: { type: String },
    city: { type: String },
    zipCode: { type: Number },
    address: { type: String },
    // Optional per-address contact phone. Buyers can supply a
    // recipient phone different from their signup number (e.g. when
    // shipping to a friend / office). Checkout's Delivery Location
    // card prefers this over the user's signup mobileNumber when
    // present.
    phoneNumber: { type: String, default: null },
    isSelect: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

addressSchema.index({ createdAt: -1 });
addressSchema.index({ userId: 1 });

module.exports = mongoose.model("Address", addressSchema);
