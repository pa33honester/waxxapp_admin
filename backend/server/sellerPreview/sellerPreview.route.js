const express = require("express");
const route = express.Router();
const sellerPreviewController = require("./sellerPreview.controller");

// Public — no checkAccessWithSecretKey(). The ObjectId regex ensures this
// only fires for 24-hex-char ids, so named seller API paths (/detail,
// /update, etc.) are never shadowed.
route.get("/seller/:sellerId([a-f0-9]{24})", sellerPreviewController.renderSellerPreview);

module.exports = route;
