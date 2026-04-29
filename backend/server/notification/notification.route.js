//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const NotificationController = require("./notification.controller");

//get notification list
route.get("/list", checkAccessWithSecretKey(), NotificationController.getNotificationList);

// Single-row delete (swipe / trash icon). Path: /:notificationId?userId=
route.delete("/:notificationId", checkAccessWithSecretKey(), NotificationController.deleteNotification);

// Bulk delete — wipes every notification owned by the caller.
route.delete("/", checkAccessWithSecretKey(), NotificationController.clearAllNotifications);

//send notifications sellers or users or both
route.post("/send", checkAccessWithSecretKey(), upload.single("image"), NotificationController.sendNotifications);

//Send notification to particular seller
route.post("/particularSeller", checkAccessWithSecretKey(), upload.single("image"), NotificationController.particularSellerNotification);

//Send "product liked" notification from user to product's seller
route.post("/sendProductLikedNotification", checkAccessWithSecretKey(), NotificationController.sendProductLikedNotification);

module.exports = route;
