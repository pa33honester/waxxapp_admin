const express = require("express");
const route = express.Router();

//Controller
const SellerWalletController = require("./sellerWallet.controller");

const checkAccessWithSecretKey = require("../../util/checkAccess");

//get the seller's transaction for admin
route.get("/retrieveSellerTransactions", checkAccessWithSecretKey(), SellerWalletController.retrieveSellerTransactions);

//retrive wallet history ( admin )
route.get("/fetchAdminEarnings", checkAccessWithSecretKey(), SellerWalletController.fetchAdminEarnings);

//retrive wallet history ( seller )
route.get("/retrieveSellerWalletHistory", checkAccessWithSecretKey(), SellerWalletController.retrieveSellerWalletHistory);

module.exports = route;
