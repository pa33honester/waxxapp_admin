//express
const express = require("express");
const route = express.Router();

//multer (for the optional cover image when scheduling a show)
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const liveSellerController = require("./liveSeller.controller");
const scheduledLiveController = require("../scheduledLive/scheduledLive.controller");

//live the seller for live Selling — after a successful go-live, fire two
//notification paths (fire-and-forget so the response is never blocked):
//  1. notifyScheduledStart  — pushes to users who set a reminder on a
//                              matching scheduled show.
//  2. notifyFollowersLiveStarted — pushes to everyone else who follows
//                              the seller OR has liked one of the
//                              seller's reels (de-duped against the
//                              reminder list inside the function).
route.post("/", checkAccessWithSecretKey(), (req, res, next) => {
  res.on("finish", () => {
    if (res.statusCode === 200) {
      scheduledLiveController.notifyScheduledStart(req.body.sellerId).catch(console.error);
      scheduledLiveController.notifyFollowersLiveStarted(req.body.sellerId).catch(console.error);
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

//add a product to the currently-live show (mid-stream "Add product")
route.post("/addProductToLive", checkAccessWithSecretKey(), liveSellerController.addProductToLive);

//replay the chat-comment backlog for a live show (used by buyers who join mid-stream)
route.get("/chatHistory/:liveSellingHistoryId", checkAccessWithSecretKey(), liveSellerController.getLiveChatHistory);

//scheduled live: seller creates a show (optional cover image as multipart "image")
route.post("/schedule", checkAccessWithSecretKey(), upload.single("image"), scheduledLiveController.schedule);

//scheduled live: get seller's upcoming shows
route.get("/scheduledBySeller", checkAccessWithSecretKey(), scheduledLiveController.getScheduledBySeller);

//scheduled live: get upcoming shows for a user (from followed sellers)
route.get("/upcoming", checkAccessWithSecretKey(), scheduledLiveController.getUpcomingForUser);

//scheduled live: user sets a reminder
route.post("/setReminder", checkAccessWithSecretKey(), scheduledLiveController.setReminder);

//scheduled live: user cancels a reminder
route.post("/cancelReminder", checkAccessWithSecretKey(), scheduledLiveController.cancelReminder);

module.exports = route;
