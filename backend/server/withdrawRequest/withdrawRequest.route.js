//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const WithdrawRequestController = require("./withdrawRequest.controller");

//Withdraw request made by particular seller ( seller )
route.post("/initiateCashOut", checkAccessWithSecretKey(), WithdrawRequestController.initiateCashOut);

//get all withdraw requests ( seller )
route.get("/getWithdrawalRequestsBySeller", checkAccessWithSecretKey(), WithdrawRequestController.getWithdrawalRequestsBySeller);

//get all withdraw requests ( admin )
route.get("/listWithdrawalRequests", checkAccessWithSecretKey(), WithdrawRequestController.listWithdrawalRequests);

//accept withdraw request ( admin )
route.patch("/approveWithdrawalRequest", checkAccessWithSecretKey(), WithdrawRequestController.approveWithdrawalRequest);

//decline withdraw request ( admin )
route.patch("/rejectWithdrawalRequest", checkAccessWithSecretKey(), WithdrawRequestController.rejectWithdrawalRequest);

module.exports = route;



