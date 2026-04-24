const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");
const offerController = require("./offer.controller");

// Buyer creates an offer
route.post("/create", checkAccessWithSecretKey(), offerController.createOffer);

// Buyer retracts their pending offer
route.patch("/withdraw", checkAccessWithSecretKey(), offerController.withdrawOffer);

// Seller-side actions
route.patch("/accept", checkAccessWithSecretKey(), offerController.acceptOffer);
route.patch("/counter", checkAccessWithSecretKey(), offerController.counterOffer);
route.patch("/decline", checkAccessWithSecretKey(), offerController.declineOffer);

// Listings
route.get("/received", checkAccessWithSecretKey(), offerController.getReceivedOffers);
route.get("/sent", checkAccessWithSecretKey(), offerController.getSentOffers);
route.get("/adminList", checkAccessWithSecretKey(), offerController.adminList);

module.exports = route;
