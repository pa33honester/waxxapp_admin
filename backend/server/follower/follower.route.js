//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const followerController = require("./follower.controller");

//follow unfollow the seller
route.post("/followUnfollow", checkAccessWithSecretKey(), followerController.followUnfollow);

//get follower list of the particular seller
route.get("/getSellerFollowers", checkAccessWithSecretKey(), followerController.getSellerFollowers);

module.exports = route;
