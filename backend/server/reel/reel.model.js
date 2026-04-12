const mongoose = require("mongoose");

const ReelSchema = new mongoose.Schema(
  {
    thumbnail: { type: String, default: "" },
    video: { type: String, default: "" },
    description: { type: String, default: "" },

    videoType: { type: Number, enum: [1, 2], default: 1 }, //1 :file 2: link
    thumbnailType: { type: Number, enum: [1, 2], default: 1 }, //1 :file 2: link

    //productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
    productId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],

    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },

    duration: { type: Number, default: 0 },
    like: { type: Number, default: 0 },

    isFake: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ReelSchema.index({ sellerId: 1 });
ReelSchema.index({ productId: 1 });
ReelSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Reel", ReelSchema);
