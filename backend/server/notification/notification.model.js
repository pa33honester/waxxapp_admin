const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, default: null },
    message: { type: String, trim: true, default: null },
    image: { type: String, default: null },
    date: { type: String, default: null },
    notificationType: { type: Number, enum: [1, 2, 3, 4, 5, 6] }, // 1.order placed by user 2.order status updated 3.review given by user 4.seller verification approved 5.product create request approved 6.product create request rejected
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", default: null },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({ createdAt: -1 });
notificationSchema.index({ userId: 1 });
notificationSchema.index({ sellerId: 1 });
notificationSchema.index({ productId: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
