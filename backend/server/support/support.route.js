const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");
const adminAuth = require("../middleware/admin.middleware");
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

// Admin-side endpoints. Layered:
//   * checkAccessWithSecretKey() — proves the request comes from our app
//     (the React panel ships the secret key on every axios call)
//   * adminAuth — validates the JWT in the Authorization header and
//     attaches req.admin (the loaded Admin doc) so the controller knows
//     WHICH admin is making the call. Don't trust adminId from the
//     request body — that was the bug: the React client's
//     state.admin.admin sometimes didn't carry _id, so the body's
//     adminId was undefined and the backend rejected the send with
//     "Admin not found" (silently — Send button looked broken).

// GET  /support/admin/inbox?status=open|closed&start=&limit=&search=
route.get("/admin/inbox", checkAccessWithSecretKey(), adminAuth, SupportController.adminInbox);

// GET  /support/admin/conversation/:conversationId
route.get(
  "/admin/conversation/:conversationId",
  checkAccessWithSecretKey(),
  adminAuth,
  SupportController.adminGetConversation
);

// POST /support/admin/sendMessage
//   Body: { conversationId, text }
//   adminId is now derived from req.admin._id (set by adminAuth).
route.post("/admin/sendMessage", checkAccessWithSecretKey(), adminAuth, SupportController.sendAdminMessage);

// POST /support/admin/close
//   Body: { conversationId }
route.post("/admin/close", checkAccessWithSecretKey(), adminAuth, SupportController.adminCloseConversation);

module.exports = route;
