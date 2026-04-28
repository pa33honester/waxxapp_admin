const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

const ReportToLiveController = require("./reportoLive.controller");

route.post("/reportLive", checkAccessWithSecretKey(), ReportToLiveController.reportLive);
route.get("/reportsOfLive", checkAccessWithSecretKey(), ReportToLiveController.reportsOfLive);
route.patch("/resolveReport", checkAccessWithSecretKey(), ReportToLiveController.resolveReport);
route.delete("/deleteReport", checkAccessWithSecretKey(), ReportToLiveController.deleteReport);

module.exports = route;
