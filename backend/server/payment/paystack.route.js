const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");
const paystackController = require("./paystack.controller");

// POST /payment/paystack/verify
// Body: { reference: string, expectedAmount?: number }
// Header: key = config.secretKey (handled by checkAccessWithSecretKey)
route.post("/verify", checkAccessWithSecretKey(), paystackController.verify);

module.exports = route;
