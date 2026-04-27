const express = require("express");
const route = express.Router();
const shortPreviewController = require("./shortPreview.controller");

// Public — no checkAccessWithSecretKey() because this URL is opened from
// chat apps, social shares, and external browsers. The page only renders
// public reel metadata; nothing sensitive.
route.get("/short/:reelId", shortPreviewController.renderShortPreview);

module.exports = route;
