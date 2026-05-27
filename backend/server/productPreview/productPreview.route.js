const express = require("express");
const route = express.Router();
const productPreviewController = require("./productPreview.controller");

// Public — no checkAccessWithSecretKey(). The ObjectId regex ensures this
// only fires for 24-hex-char ids, so named product API paths (/detail,
// /create, etc.) are never shadowed.
route.get("/product/:productId([a-f0-9]{24})", productPreviewController.renderProductPreview);

module.exports = route;
