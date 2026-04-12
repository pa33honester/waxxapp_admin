//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const FavoriteController = require("./favorite.controller");

//create Favorite [Only User can do favorite]  [Add product to favorite list]
route.post("/favoriteUnfavorite", checkAccessWithSecretKey(), FavoriteController.store);

//get product's favorite list for user
route.get("/favoriteProduct", checkAccessWithSecretKey(), FavoriteController.getFavoriteList);

module.exports = route;
