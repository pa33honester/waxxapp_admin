const express = require("express");
const route = express.Router();
const checkAccessWithSecretKey = require("../../util/checkAccess");
const C = require("./productChat.controller");

route.get("/conversation", checkAccessWithSecretKey(), C.getOrCreateConversation);
route.post("/sendBuyerMessage", checkAccessWithSecretKey(), C.sendBuyerMessage);
route.post("/sendSellerMessage", checkAccessWithSecretKey(), C.sendSellerMessage);
route.get("/sellerInbox", checkAccessWithSecretKey(), C.getSellerInbox);
route.get("/buyerInbox", checkAccessWithSecretKey(), C.getBuyerInbox);

module.exports = route;
