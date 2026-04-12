//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//Controller
const OTPController = require("./otp.controller");

//create OTP and send the email for password security
route.post("/create", checkAccessWithSecretKey(), OTPController.store);

//create otp when user login
route.post("/otplogin", checkAccessWithSecretKey(), OTPController.otplogin);

//verify the OTP
route.post("/verify", checkAccessWithSecretKey(), OTPController.verify);

module.exports = route;
