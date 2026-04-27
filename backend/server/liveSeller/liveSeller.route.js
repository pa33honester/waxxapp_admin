//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const liveSellerController = require("./liveSeller.controller");
const scheduledLiveController = require("../scheduledLive/scheduledLive.controller");

//live the seller for live Selling (+ notify scheduled-show reminder users after response)
route.post("/", checkAccessWithSecretKey(), (req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode === 200) {
      scheduledLiveController.notifyScheduledStart(req.body.sellerId).catch(console.error);
    }
  });
  next();
}, liveSellerController.liveSeller);

//get live seller list
route.get("/liveSellerList", checkAccessWithSecretKey(), liveSellerController.getliveSellerList);

//get a single live by liveSellingHistoryId (used by /live/<id> deep-link routing)
route.get("/byHistoryId/:liveSellingHistoryId", checkAccessWithSecretKey(), liveSellerController.getLiveByHistoryId);

//get selectedProducts for the user
route.get("/getSelectedProducts", checkAccessWithSecretKey(), liveSellerController.getSelectedProducts);

//get product or service ( for fake liveseller )
route.get("/retrieveProductList", checkAccessWithSecretKey(), liveSellerController.retrieveProductList);

//seller is live at that time product selected ( for fake liveseller )
route.post("/setSellerLiveWithProducts", checkAccessWithSecretKey(), liveSellerController.setSellerLiveWithProducts);

//stopping the seller from going live ( for fake liveseller )
route.patch("/setSellerOfflineAndResetProducts", checkAccessWithSecretKey(), liveSellerController.setSellerOfflineAndResetProducts);

//get live summary
route.patch("/retrieveLiveAnalytics", checkAccessWithSecretKey(), liveSellerController.retrieveLiveAnalytics);

//seller heartbeat: pinged every 30s while broadcasting to keep the live row fresh
route.post("/heartbeat", checkAccessWithSecretKey(), liveSellerController.heartbeat);

//scheduled live: seller creates a show
route.post("/schedule", checkAccessWithSecretKey(), scheduledLiveController.schedule);

//scheduled live: get seller's upcoming shows
route.get("/scheduledBySeller", checkAccessWithSecretKey(), scheduledLiveController.getScheduledBySeller);

//scheduled live: get upcoming shows for a user (from followed sellers)
route.get("/upcoming", checkAccessWithSecretKey(), scheduledLiveController.getUpcomingForUser);

//scheduled live: user sets a reminder
route.post("/setReminder", checkAccessWithSecretKey(), scheduledLiveController.setReminder);

//scheduled live: user cancels a reminder
route.post("/cancelReminder", checkAccessWithSecretKey(), scheduledLiveController.cancelReminder);

module.exports = route;
