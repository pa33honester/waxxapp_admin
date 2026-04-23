const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");
const GiveawayController = require("./giveaway.controller");

// seller starts a giveaway during a live broadcast
route.post("/start", checkAccessWithSecretKey(), GiveawayController.startGiveaway);

// buyer enters an open giveaway
route.post("/enter", checkAccessWithSecretKey(), GiveawayController.enterGiveaway);

// seller forces an early draw (or worker triggers this internally on timeout)
route.post("/draw", checkAccessWithSecretKey(), GiveawayController.drawGiveaway);

// giveaways attached to a broadcast (buyer prefetches on join)
route.get("/byLive", checkAccessWithSecretKey(), GiveawayController.giveawaysByLive);

// seller history
route.get("/sellerHistory", checkAccessWithSecretKey(), GiveawayController.sellerHistory);

// buyer wins list
route.get("/myWins", checkAccessWithSecretKey(), GiveawayController.myWins);

// admin panel listing + cancel
route.get("/adminList", checkAccessWithSecretKey(), GiveawayController.adminList);
route.patch("/adminCancel", checkAccessWithSecretKey(), GiveawayController.adminCancel);

module.exports = route;
