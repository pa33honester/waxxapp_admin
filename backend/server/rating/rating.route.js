//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const ratingController = require("./rating.controller");

//create rating
route.post("/addRating", checkAccessWithSecretKey(), ratingController.addRating);

//get allProduct avgRating
route.get("/", checkAccessWithSecretKey(), ratingController.getRating);

module.exports = route;
