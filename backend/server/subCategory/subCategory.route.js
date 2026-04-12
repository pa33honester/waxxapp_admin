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
const SubCategoryController = require("./subCategory.controller");

//create subCategory
route.post("/create", checkAccessWithSecretKey(), upload.single("image"), SubCategoryController.store);

//update subCategory
route.patch("/update", checkAccessWithSecretKey(), upload.single("image"), SubCategoryController.update);

//get subCategory
route.get("/", checkAccessWithSecretKey(), SubCategoryController.get);

//delete subCategory
route.delete("/delete", checkAccessWithSecretKey(), SubCategoryController.destroy);

//get category wise subCategory for admin panel and seller
route.get("/categoryWiseSubCategory", checkAccessWithSecretKey(), SubCategoryController.categoryWiseSubCategory);

//fetch subCategory ( drop-down )
route.get("/fetchActiveSubCategories", checkAccessWithSecretKey(), SubCategoryController.fetchActiveSubCategories);

module.exports = route;
