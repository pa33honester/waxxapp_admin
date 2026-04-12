//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const PromoCodeController = require("./promoCode.controller");

//create promoCode by admin
route.post("/create", checkAccessWithSecretKey(), PromoCodeController.store);

//update promoCode by admin
route.post("/update", checkAccessWithSecretKey(), PromoCodeController.update);

//delete promoCode by admin
route.delete("/delete", checkAccessWithSecretKey(), PromoCodeController.destroy);

//get all promoCode for admin panel
route.get("/getAll", checkAccessWithSecretKey(), PromoCodeController.index);

module.exports = route;
