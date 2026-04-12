const express = require("express");
const route = express.Router();

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const currencyController = require("../../server/currency/currency.controller");

//create currency
route.post("/storeCurrency", checkAccessWithSecretKey(), currencyController.store);

//update currency
route.patch("/updateCurrency", checkAccessWithSecretKey(), currencyController.update);

//get all currencies
route.get("/fetchCurrencies", checkAccessWithSecretKey(), currencyController.get);

//delete currency
route.delete("/deleteCurrency", checkAccessWithSecretKey(), currencyController.destroy);

//set default currency
route.patch("/setdefaultCurrency", checkAccessWithSecretKey(), currencyController.setdefault);

//get default currency
route.get("/getDefaultCurrency", checkAccessWithSecretKey(), currencyController.getDefault);

module.exports = route;
