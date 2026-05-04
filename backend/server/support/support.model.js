const mongoose = require("mongoose");

// One persistent SupportConversation per user. Messages are kept inline
// as a subdoc array — buyers exchange a manageable number of messages
// with support over the app's lifetime, so embedding them keeps the
// reads cheap (one Mongo round-trip per open) and the admin-inbox
// listing fast (no $lookup on a separate Messages collection). If a
// single conversation grows past a few hundred messages we'd revisit,
// but that's not the v1 problem.
const supportMessageSchema = new mongoose.Schema(
  {
    senderType: { type: String, enum: ["user", "admin"], required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
    senderName: { type: String, default: "" }, // snapshot so deleted admins still render
    senderImage: { type: String, default: "" },
    text: { type: String, default: "", trim: true },
    isRead: { type: Boolean, default: false }, // read by the OPPOSITE party
  },
  { timestamps: true, _id: true, versionKey: false }
);

const supportConversationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    status: { type: String, enum: ["open", "closed"], default: "open", index: true },
    messages: { type: [supportMessageSchema], default: [] },
    // Bumped on every message — used by the admin inbox to sort the
    // most recently active conversations first and to drive the SLA
    // dashboard widget (oldest unanswered).
    lastActivityAt: { type: Date, default: Date.now, index: true },
    unreadByAdmin: { type: Number, default: 0 }, // count of user-sent unread
    unreadByUser: { type: Number, default: 0 }, // count of admin-sent unread
    // Snapshot the admin who last replied so the inbox list can show
    // "Last replied by <name>" without joining the admins table.
    lastAdminReplyId: { type: mongoose.Schema.Types.ObjectId, default: null },
    lastAdminReplyName: { type: String, default: "" },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("SupportConversation", supportConversationSchema);
