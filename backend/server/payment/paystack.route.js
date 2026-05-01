const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");
const paystackController = require("./paystack.controller");

// POST /payment/paystack/verify
// Body: { reference: string, expectedAmount?: number }
// Header: key = config.secretKey (handled by checkAccessWithSecretKey)
route.post("/verify", checkAccessWithSecretKey(), paystackController.verify);

// GET /payment/paystack/callback?reference=...
// Public landing page — Paystack redirects browser checkouts here on
// success. The in-app SDK rarely hits this (it handles its own
// in-webview callback) but the Paystack dashboard requires a value
// in "Live Callback URL". Renders a small "Payment received" page so
// edge-case redirects don't 404.
route.get("/callback", paystackController.callback);

// POST /payment/paystack/webhook
// Public — authenticated via the `x-paystack-signature` HMAC header
// that Paystack signs each event with using our secret key. NOT
// guarded by checkAccessWithSecretKey because Paystack doesn't know
// our internal secret. The body is parsed as raw Buffer (see
// route.js mounting) so we can verify the signature byte-for-byte.
route.post("/webhook", express.raw({ type: "*/*" }), paystackController.webhook);

module.exports = route;
