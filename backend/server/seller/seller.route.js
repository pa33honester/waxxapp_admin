//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const sellerController = require("./seller.controller");

//seller login
route.post("/login", checkAccessWithSecretKey(), sellerController.sellerLogin);

//update real seller profile by admin
route.patch("/update", checkAccessWithSecretKey(), upload.fields([{ name: "image" }]), sellerController.updateSellerProfile);

//get seller profile who is login
route.get("/getProfile", checkAccessWithSecretKey(), sellerController.getProfile);

//get seller profile by admin
route.get("/getProfileByAdmin", checkAccessWithSecretKey(), sellerController.getProfileByAdmin);

//get all real seller for admin
route.get("/getRealSeller", checkAccessWithSecretKey(), sellerController.getRealSeller);

//seller is block or not
route.patch("/blockUnblock", checkAccessWithSecretKey(), sellerController.blockUnblock);

//get the top sellers for admin(dashboard)
route.get("/topSellers", checkAccessWithSecretKey(), sellerController.topSellers);

//get seller wallet for admin
route.get("/sellerWallet", checkAccessWithSecretKey(), sellerController.sellerWallet);

//update password
route.patch("/updatePassword", checkAccessWithSecretKey(), sellerController.updatePassword);

//set password
route.post("/setPassword", checkAccessWithSecretKey(), sellerController.setPassword);

//create fake seller by admin
route.post("/createFakeSeller", checkAccessWithSecretKey(), upload.fields([{ name: "video" }, { name: "image" }]), sellerController.createFakeSeller);

//update fakeSeller profile for admin
route.patch("/updateFakeSellerProfile", checkAccessWithSecretKey(), upload.fields([{ name: "video" }, { name: "image" }]), sellerController.updateFakeSellerProfile);

//fakeSeller is live or not handled for admin
route.patch("/liveOrNot", checkAccessWithSecretKey(), sellerController.liveOrNot);

//get all fake seller for admin
route.get("/getFakeSeller", checkAccessWithSecretKey(), sellerController.getFakeSeller);

//get all fake sellers when reel or product create by the admin (dropdown)
route.get("/fakeSellers", checkAccessWithSecretKey(), sellerController.fakeSellers);

//delete fake seller for admin
route.delete("/deleteSeller", checkAccessWithSecretKey(), sellerController.deleteSeller);

//get seller profile for user
route.get("/fetchSellerProfile", checkAccessWithSecretKey(), sellerController.fetchSellerProfile);

module.exports = route;
