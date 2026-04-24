//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const UserController = require("./user.controller");

//user login and sign up
route.post("/login", checkAccessWithSecretKey(), UserController.store);

//check the user is exists or not
route.post("/checkUser", checkAccessWithSecretKey(), UserController.checkUser);

//check the user's password wrong or true
route.post("/checkPassword", checkAccessWithSecretKey(), UserController.checkPassword);

//get user profile who login
route.get("/profile", checkAccessWithSecretKey(), UserController.getProfile);

//get all users for admin panel
route.get("/", checkAccessWithSecretKey(), UserController.get);

//update profile of user
route.patch("/update", checkAccessWithSecretKey(), upload.single("image"), UserController.updateProfile);

//update password
route.patch("/updatePassword", checkAccessWithSecretKey(), UserController.updatePassword);

//set password
route.post("/setPassword", checkAccessWithSecretKey(), UserController.setPassword);

//user block or unbolck for admin panel
route.patch("/blockUnblock", checkAccessWithSecretKey(), UserController.blockUnblock);

//get all top customers (users) for admin panel(dashboard)
route.get("/topCustomers", checkAccessWithSecretKey(), UserController.topCustomers);

//delete user account
route.delete("/deleteUserAccount", checkAccessWithSecretKey(), UserController.deleteUserAccount);

//admin: hard delete a user (works on blocked users too)
route.delete("/adminDelete", checkAccessWithSecretKey(), UserController.adminDeleteUser);

module.exports = route;
