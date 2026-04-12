//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const liveSellerController = require("./liveSeller.controller");

//live the seller for live Selling
route.post("/", checkAccessWithSecretKey(), liveSellerController.liveSeller);

//get live seller list
route.get("/liveSellerList", checkAccessWithSecretKey(), liveSellerController.getliveSellerList);

//get selectedProducts for the user
route.get("/getSelectedProducts", checkAccessWithSecretKey(), liveSellerController.getSelectedProducts);

//get product or service ( for fake liveseller )
route.get("/retrieveProductList", checkAccessWithSecretKey(), liveSellerController.retrieveProductList);

//seller is live at that time product selected ( for fake liveseller )
route.post("/setSellerLiveWithProducts", checkAccessWithSecretKey(), liveSellerController.setSellerLiveWithProducts);

//stopping the seller from going live ( for fake liveseller )
route.patch("/setSellerOfflineAndResetProducts", checkAccessWithSecretKey(), liveSellerController.setSellerOfflineAndResetProducts);

//get live summary
route.patch("/retrieveLiveAnalytics", checkAccessWithSecretKey(), liveSellerController.retrieveLiveAnalytics);

module.exports = route;
