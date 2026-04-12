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

//controller
const ProductController = require("./product.controller");

//get category , subcategory , attributesF
route.get("/fetchCatSubcatAttrData", checkAccessWithSecretKey(), ProductController.fetchCatSubcatAttrData);

//add product by seller
route.post(
  "/create",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  ProductController.createProduct
);

//create product request accept or decline by admin
route.patch("/acceptCreateRequest", checkAccessWithSecretKey(), ProductController.acceptCreateRequest);

//get status wise all product requests to create product for admin panel
route.get("/createProductRequestStatusWise", checkAccessWithSecretKey(), ProductController.createProductRequestStatusWise);

//add product by admin
route.post(
  "/createProductByAdmin",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  ProductController.createProductByAdmin
);

//update product by admin
route.patch(
  "/update",
  checkAccessWithSecretKey(),
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "images", maxCount: 5 },
  ]),
  ProductController.updateProduct
);

//get product details for seller
route.get("/detailforSeller", checkAccessWithSecretKey(), ProductController.detailforSeller);

//delete product by seller
route.delete("/delete", checkAccessWithSecretKey(), ProductController.deleteProduct);

//get all products for seller
route.get("/allProductForSeller", checkAccessWithSecretKey(), ProductController.getAll);

//handel the product is selected or not
route.patch("/selectOrNot", checkAccessWithSecretKey(), ProductController.selectedOrNot);

//get all products selected for seller when seller going for live
route.get("/selectedProducts", checkAccessWithSecretKey(), ProductController.getSelectedProducts);

//get category wise all products for user (gallery page)
route.get("/categorywiseAllProducts", checkAccessWithSecretKey(), ProductController.getProductsForUser);

//get product details for user
route.get("/detail", checkAccessWithSecretKey(), ProductController.productDetail);

//search products for user
route.post("/search", checkAccessWithSecretKey(), ProductController.search);

//previous search products for user
route.get("/searchProduct", checkAccessWithSecretKey(), ProductController.searchProduct);

//get all products filterWise for user
route.post("/filterWiseProduct", checkAccessWithSecretKey(), ProductController.filterWiseProduct);

//handle the isOutofStock or not for admin panel
route.patch("/isOutOfStock", checkAccessWithSecretKey(), ProductController.isOutOfStock);

//handle the isNewCollection or not for admin panel
route.patch("/isNewCollection", checkAccessWithSecretKey(), ProductController.isNewCollection);

//get all new collection for user (home page)
route.get("/geAllNewCollection", checkAccessWithSecretKey(), ProductController.getAllisNewCollection);

//get real products for admin
route.get("/getRealProducts", checkAccessWithSecretKey(), ProductController.getRealProducts);

//get fake products for admin
route.get("/getFakeProducts", checkAccessWithSecretKey(), ProductController.getFakeProducts);

//get product details for admin panel
route.get("/productDetailsForAdmin", checkAccessWithSecretKey(), ProductController.productDetails);

//get seller wise all products for admin panel
route.get("/getSellerWise", checkAccessWithSecretKey(), ProductController.getSellerWise);

//get top selling products for admin panel(dashboard)
route.get("/topSellingProducts", checkAccessWithSecretKey(), ProductController.topSellingProducts);

//get most popular products for admin panel(dashboard)
route.get("/popularProducts", checkAccessWithSecretKey(), ProductController.popularProducts);

//get just for you products for user(home page)
route.get("/justForYouProducts", checkAccessWithSecretKey(), ProductController.justForYou);

//get auction products for user (home page)
route.get("/getAuctionProducts", checkAccessWithSecretKey(), ProductController.getAuctionProducts);

//get most popular products for user (home page)
route.get("/featuredProducts", checkAccessWithSecretKey(), ProductController.featuredProducts);

//get related products for user
route.get("/getRelatedProductsByCategory", checkAccessWithSecretKey(), ProductController.getRelatedProductsByCategory);

module.exports = route;
