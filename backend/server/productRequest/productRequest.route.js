//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const productRequestController = require("./productRequest.controller");

//create product update request by seller to admin
route.post(
  "/updateProductRequest",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  productRequestController.updateProductRequest
);

//product request accept or decline to update product by admin
route.patch("/acceptUpdateRequest", checkAccessWithSecretKey(), productRequestController.acceptUpdateRequest);

//get status wise all product requests to update product by admin
route.get("/updateProductRequestStatusWise", checkAccessWithSecretKey(), productRequestController.updateProductRequestStatusWise);

module.exports = route;
