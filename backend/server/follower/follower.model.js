const mongoose = require("mongoose");

const followerSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, //follower (from)
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" }, //following (to)
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

followerSchema.index({ userId: 1 });
followerSchema.index({ sellerId: 1 });

module.exports = mongoose.model("Follower", followerSchema);
