const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

const reportReasonController = require("../reportReason/reportReason.controller");

//create reportReason
route.post("/createReportreason", checkAccessWithSecretKey(), reportReasonController.store);

//update reportReason
route.patch("/updateReportreason", checkAccessWithSecretKey(), reportReasonController.update);

//get reportReason
route.get("/getReportreason", checkAccessWithSecretKey(), reportReasonController.get);

//delete reportReason
route.delete("/deleteReportreason", checkAccessWithSecretKey(), reportReasonController.delete);

module.exports = route;
