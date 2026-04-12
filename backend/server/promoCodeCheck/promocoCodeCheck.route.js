const express = require("express");
const route = express.Router();

const PromoCodeCheckController = require("./promoCodeCheck.controller");

const checkAccessWithSecretKey = require("../../util/checkAccess");

//when user apply the promoCode then check promoCode history
route.post("/checkPromoCode", checkAccessWithSecretKey(), PromoCodeCheckController.checkPromoCode);

module.exports = route;
