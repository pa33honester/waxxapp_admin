const express = require("express");
const route = express.Router();

const multer = require("multer");
const { fileFilter, kycAwareStorage } = require("../../util/multer");

// Selfie uploads route to private_storage/ via the kycAwareStorage's
// fieldname-based dispatch (the field is named "selfie", which is in
// the KYC_FIELDNAMES set).
const upload = multer({
  storage: kycAwareStorage,
  fileFilter,
});

const checkAccessWithSecretKey = require("../../util/checkAccess");
const adminAuth = require("../middleware/admin.middleware");

const VerificationController = require("./verification.controller");

// User-facing routes — gated by the shared secret key.
// POST /verification/submitSelfie  (multipart, field name "selfie")
route.post(
  "/submitSelfie",
  checkAccessWithSecretKey(),
  upload.single("selfie"),
  VerificationController.submitSelfie
);

// GET /verification/myStatus?userId=
route.get("/myStatus", checkAccessWithSecretKey(), VerificationController.getMyStatus);

// Admin routes — adminAuth populates req.admin from the JWT.
// GET /verification/admin/list?status=&page=&limit=
route.get("/admin/list", adminAuth, VerificationController.adminList);

// PATCH /verification/admin/review
route.patch("/admin/review", adminAuth, VerificationController.adminReview);

module.exports = route;
