//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//Controller
const locationController = require("./address.controller");

//store address for user
route.post("/create", checkAccessWithSecretKey(), locationController.store);

//update address for user
route.patch("/update", checkAccessWithSecretKey(), locationController.update);

//get all address for users
route.get("/getAllAddress", checkAccessWithSecretKey(), locationController.getAllAddress);

//the address is selected true
route.patch("/selectOrNot", checkAccessWithSecretKey(), locationController.selectedOrNot);

//get all isSelect address for users
route.get("/selectAddress", checkAccessWithSecretKey(), locationController.getSelectedAddress);

//delete address by user
route.delete("/delete", checkAccessWithSecretKey(), locationController.destroy);

module.exports = route;
