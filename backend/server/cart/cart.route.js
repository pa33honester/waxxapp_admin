const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//Controller
const CartController = require("./cart.controller");

//add product to cart for user
route.post("/addToCart", checkAccessWithSecretKey(), CartController.addToCart);

//remove product from cart for user
route.patch("/removeProduct", checkAccessWithSecretKey(), CartController.removeFromCart);

//get all products added to cart
route.get("/getCartProduct", checkAccessWithSecretKey(), CartController.getCartProduct);

//delete the cart of particular user
route.delete("/deleteCart", checkAccessWithSecretKey(), CartController.deleteCart);

module.exports = route;
