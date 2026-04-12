//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//Controller
const BankController = require("./bank.controller");

route.post("/create", checkAccessWithSecretKey(), BankController.store);

route.patch("/update", checkAccessWithSecretKey(), BankController.update);

route.get("/getBanks", checkAccessWithSecretKey(), BankController.getBanks);

route.delete("/delete", checkAccessWithSecretKey(), BankController.delete);

module.exports = route;
