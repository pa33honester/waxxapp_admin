//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const ReportToReelController = require("./reportoReel.controller");

//report to particular reel by the user
route.post("/reportReel", checkAccessWithSecretKey(), ReportToReelController.reportReel);

//get all reported reels for admin
route.get("/reportsOfReel", checkAccessWithSecretKey(), ReportToReelController.reportsOfReel);

//solved reported reel
route.patch("/resolveReport", checkAccessWithSecretKey(), ReportToReelController.resolveReport);

//delete report
route.delete("/deleteReport", checkAccessWithSecretKey(), ReportToReelController.deleteReport);

module.exports = route;
