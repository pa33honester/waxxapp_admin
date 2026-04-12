//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const attributesController = require("./attributes.controller");

//create Subcategory-wise Attributes
route.post("/insertAttributes", upload.single("image"), checkAccessWithSecretKey(), attributesController.insertAttributes);

//update attributes
route.patch("/updateAttributes", upload.single("image"), checkAccessWithSecretKey(), attributesController.updateAttributes);

//fetch attributes
route.get("/listAllAttributes", checkAccessWithSecretKey(), attributesController.listAllAttributes);

//delete particular attribute
route.delete("/destroyAttribute", checkAccessWithSecretKey(), attributesController.destroyAttribute);

module.exports = route;
