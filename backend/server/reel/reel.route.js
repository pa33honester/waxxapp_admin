//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const ReelController = require("./reel.controller");

//upload fake reel by the admin
route.post("/uploadReelByAdmin", checkAccessWithSecretKey(), upload.fields([{ name: "video" }, { name: "thumbnail" }]), ReelController.uploadReelByAdmin);

//update fake reel by the admin
route.patch("/updateReelByAdmin", checkAccessWithSecretKey(), upload.fields([{ name: "video" }, { name: "thumbnail" }]), ReelController.updateReelByAdmin);

//get fake reels by the admin
route.get("/getReels", checkAccessWithSecretKey(), ReelController.getFakeReels);

//get real reels by the admin
route.get("/getRealReels", checkAccessWithSecretKey(), ReelController.getRealReels);

//get particular reels information for the admin
route.get("/detailsOfReel", checkAccessWithSecretKey(), ReelController.detailsOfReel);

//get particular reel's like history for the admin
route.get("/likeHistoryOfReel", checkAccessWithSecretKey(), ReelController.likeHistoryOfReel);

//delete reel by the admin and seller
route.delete("/deleteReel", checkAccessWithSecretKey(), ReelController.deleteReel);

//upload reel by the seller
route.post("/uploadReel", checkAccessWithSecretKey(), upload.fields([{ name: "video" }, { name: "thumbnail" }]), ReelController.uploadReel);

//if isFakeData switch on then get all (real + fake ) reels by the user otherwise only get all real reels by the user
route.get("/getReelsForUser", checkAccessWithSecretKey(), ReelController.getReelsForUser);

//get particular seller's reel by the seller
route.get("/reelsOfSeller", checkAccessWithSecretKey(), ReelController.reelsOfSeller);

//create like or dislike of reel by the user
route.post("/likeOrDislikeOfReel", checkAccessWithSecretKey(), ReelController.likeOrDislikeOfReel);

// fire-and-forget view bump from the Flutter reel viewer (one bump per
// reel-becomes-visible event in the swipe feed)
route.post("/incrementView/:reelId", checkAccessWithSecretKey(), ReelController.incrementView);

module.exports = route;
