//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const upload = multer({ storage });

//admin middleware
const AdminMiddleware = require("../middleware/admin.middleware");

//controller
const AdminController = require("./admin.controller");

//create admin
route.post("/create", AdminController.store);

//admin login
route.post("/login", AdminController.login);

//get admin profile
route.get("/profile", AdminMiddleware, AdminController.getProfile);

//update admin profile email and name
route.patch("/updateProfile", AdminMiddleware, AdminController.update);

//update admin Profile Image
route.patch("/updateImage", AdminMiddleware, upload.single("image"), AdminController.updateImage);

//send email for forgot the password (forgot password)
route.post("/forgotPassword", AdminController.forgotPassword);

//update admin password
route.patch("/updatePassword", AdminMiddleware, AdminController.updatePassword);

//set password
route.post("/setPassword", AdminController.setPassword);

//update purchase code
route.patch("/updateCode", AdminController.updateCode);

module.exports = route;
