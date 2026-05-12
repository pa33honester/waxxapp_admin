//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const AccountRequestController = require("./accountRequest.controller");

//create account request — called by the in-app sign-up assistant chatbot
route.post("/create", checkAccessWithSecretKey(), AccountRequestController.store);

//list account requests (admin)
route.get("/", checkAccessWithSecretKey(), AccountRequestController.getAll);

//approve an account request — creates the real User (admin)
route.patch("/approve", checkAccessWithSecretKey(), AccountRequestController.approve);

//reject an account request (admin)
route.patch("/reject", checkAccessWithSecretKey(), AccountRequestController.reject);

//delete an account request (admin)
route.delete("/delete", checkAccessWithSecretKey(), AccountRequestController.destroy);

module.exports = route;
