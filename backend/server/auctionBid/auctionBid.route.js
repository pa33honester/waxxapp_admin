//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const AuctionBidController = require("./auctionBid.controller");
const AutoBidController = require("../autoBid/autoBid.controller");

//place bid
route.post("/placeManualBid", checkAccessWithSecretKey(), AuctionBidController.placeManualBid);

//get bids placed by a specific user ( user )
route.get("/getUserAuctionBids", checkAccessWithSecretKey(), AuctionBidController.getUserAuctionBids);

//get bids received by a specific seller ( seller )
route.get("/getSellerAuctionBids", checkAccessWithSecretKey(), AuctionBidController.getSellerAuctionBids);

//get bids received by a specific product ( seller )
route.get("/getProductWiseUserBids", checkAccessWithSecretKey(), AuctionBidController.getProductWiseUserBids);

//auto-bid: set/update max bid
route.post("/setAutoBid", checkAccessWithSecretKey(), AutoBidController.setAutoBid);

//auto-bid: get current auto-bid for a product
route.get("/getAutoBid", checkAccessWithSecretKey(), AutoBidController.getAutoBid);

//auto-bid: cancel auto-bid
route.post("/cancelAutoBid", checkAccessWithSecretKey(), AutoBidController.cancelAutoBid);

module.exports = route;
