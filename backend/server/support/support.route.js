const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");
const SupportController = require("./support.controller");

// User-side endpoints — guarded by the global secretKey header.

// GET  /support/myConversation?userId=...
//   Idempotent — returns the user's existing support conversation
//   doc (with full message history) or creates a fresh one if this is
//   their first time reaching out. Resets unreadByUser as a side effect
//   since opening the chat counts as reading any pending admin replies.
route.get("/myConversation", checkAccessWithSecretKey(), SupportController.getOrCreateMyConversation);

// POST /support/sendUserMessage
//   Body: { userId, text }
//   Appends a user-side message + broadcasts on the supportRoom socket
//   + bumps the unreadByAdmin counter so the inbox tile flags it.
route.post("/sendUserMessage", checkAccessWithSecretKey(), SupportController.sendUserMessage);

// Admin-side endpoints. Guarded by the same secretKey since the React
// admin panel ships it in its axios instance. If you later add a stronger
// per-admin auth, layer that on top via a separate middleware.

// GET  /support/admin/inbox?status=open|closed&start=&limit=&search=
route.get("/admin/inbox", checkAccessWithSecretKey(), SupportController.adminInbox);

// GET  /support/admin/conversation/:conversationId
route.get(
  "/admin/conversation/:conversationId",
  checkAccessWithSecretKey(),
  SupportController.adminGetConversation
);

// POST /support/admin/sendMessage
//   Body: { conversationId, adminId, text }
route.post("/admin/sendMessage", checkAccessWithSecretKey(), SupportController.sendAdminMessage);

// POST /support/admin/close
//   Body: { conversationId }
route.post("/admin/close", checkAccessWithSecretKey(), SupportController.adminCloseConversation);

module.exports = route;
