//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const reviewController = require("./review.controller");

//create review by user
route.post("/create", checkAccessWithSecretKey(), reviewController.store);

//delete review for admin
route.delete("/delete", checkAccessWithSecretKey(), reviewController.destroy);

//get product review for admin
route.get("/getreview", checkAccessWithSecretKey(), reviewController.getreview);

module.exports = route;
