//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const AuctionBidController = require("./auctionBid.controller");

//place bid
route.post("/placeManualBid", checkAccessWithSecretKey(), AuctionBidController.placeManualBid);

//get bids placed by a specific user ( user )
route.get("/getUserAuctionBids", checkAccessWithSecretKey(), AuctionBidController.getUserAuctionBids);

//get bids received by a specific seller ( seller )
route.get("/getSellerAuctionBids", checkAccessWithSecretKey(), AuctionBidController.getSellerAuctionBids);

//get bids received by a specific product ( seller )
route.get("/getProductWiseUserBids", checkAccessWithSecretKey(), AuctionBidController.getProductWiseUserBids);

module.exports = route;
