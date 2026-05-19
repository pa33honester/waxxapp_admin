const mongoose = require("mongoose");

const productMessageSchema = new mongoose.Schema(
  {
    senderType: { type: String, enum: ["buyer", "seller"], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderName: { type: String, default: "" },
    senderImage: { type: String, default: "" },
    text: { type: String, default: "", trim: true },
    isRead: { type: Boolean, default: false }, // read by the OPPOSITE party
  },
  { timestamps: true, _id: true, versionKey: false }
);

const productChatConversationSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller", required: true, index: true },
    // Snapshotted at conversation creation so the header renders correctly
    // even if the product is later deleted or edited.
    productSnapshot: {
      name: { type: String, default: "" },
      image: { type: String, default: "" },
      price: { type: Number, default: 0 },
    },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
    messages: { type: [productMessageSchema], default: [] },
    unreadByBuyer: { type: Number, default: 0 },
    unreadBySeller: { type: Number, default: 0 },
    lastActivityAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true, versionKey: false }
);

// Enforce at most one conversation per (buyer, seller, product) triplet.
productChatConversationSchema.index({ productId: 1, buyerId: 1, sellerId: 1 }, { unique: true });

module.exports = mongoose.model("ProductChatConversation", productChatConversationSchema);
