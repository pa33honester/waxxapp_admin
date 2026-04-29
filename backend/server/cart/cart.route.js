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

// Shape B per-option shipping — buyer flips the chosen delivery option
// from the cart UI without removing the item.
route.patch("/updateDeliveryOption", checkAccessWithSecretKey(), CartController.updateDeliveryOption);

//delete the cart of particular user
route.delete("/deleteCart", checkAccessWithSecretKey(), CartController.deleteCart);

module.exports = route;
