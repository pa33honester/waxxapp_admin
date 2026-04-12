//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const { fileFilter } = require("../../util/multer");
const upload = multer({
  storage,
  fileFilter,
});

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const sellerRequestController = require("./sellerRequest.controller");

//create request by user
route.post(
  "/create",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "logo", maxCount: 5 },
    { name: "govId", maxCount: 5 },
    { name: "registrationCert", maxCount: 5 },
    { name: "addressProof", maxCount: 5 },
  ]),
  sellerRequestController.storeRequest
);

//check seller become or not
route.post("/sellerBecomeOrNot", checkAccessWithSecretKey(), sellerRequestController.sellerBecomeOrNot);

//update request by admin
route.patch("/update", checkAccessWithSecretKey(), upload.single("image"), sellerRequestController.updateRequest);

//seller request accept or not by admin
route.patch("/acceptOrNot", checkAccessWithSecretKey(), sellerRequestController.acceptRequest);

//get the all request for admin panel
route.get("/", checkAccessWithSecretKey(), sellerRequestController.getRequest);

module.exports = route;
