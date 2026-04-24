const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");
const autoBidController = require("./autoBid.controller");

// Buyer sets (or updates) their max-bid cap on a product.
route.post("/setAutoBid", checkAccessWithSecretKey(), autoBidController.setAutoBid);

// Buyer reads their current auto-bid for a specific product.
route.get("/getAutoBid", checkAccessWithSecretKey(), autoBidController.getAutoBid);

// Buyer lists all active auto-bids (optionally scoped to a live show).
route.get("/myActive", checkAccessWithSecretKey(), autoBidController.myActive);

// Buyer cancels an auto-bid before the auction ends.
route.post("/cancel", checkAccessWithSecretKey(), autoBidController.cancelAutoBid);

module.exports = route;
