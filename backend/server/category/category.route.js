//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({
  storage,
});

const checkAccessWithSecretKey = require("../../util/checkAccess");

//Controller
const CategoryController = require("./category.controller");

//create category
route.post("/create", checkAccessWithSecretKey(), upload.single("image"), CategoryController.store);

//update category
route.patch("/update", checkAccessWithSecretKey(), upload.single("image"), CategoryController.update);

//get all category with subCategory for seller
route.get("/", checkAccessWithSecretKey(), CategoryController.get);

//get all category for admin
route.get("/getCategory", checkAccessWithSecretKey(), CategoryController.getCategory);

//delete category
route.delete("/delete", checkAccessWithSecretKey(), CategoryController.destroy);

module.exports = route;
