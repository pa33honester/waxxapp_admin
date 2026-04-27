const express = require("express");
const route = express.Router();
const livePreviewController = require("./livePreview.controller");

// Public — opened from chat apps, social shares, and external browsers.
// Mirrors the /short/:reelId pattern in server/shortPreview/.
route.get("/live/:liveSellingHistoryId", livePreviewController.renderLivePreview);

module.exports = route;
