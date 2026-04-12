//express
const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const settingController = require("./setting.controller");

//update Setting
route.patch("/update", checkAccessWithSecretKey(), settingController.update);

//handle setting switch
route.patch("/handleSwitch", checkAccessWithSecretKey(), settingController.handleSwitch);

//toggle either isActive or isRequired of addressProof, govId, or registrationCert
route.patch("/handleFieldSwitch", checkAccessWithSecretKey(), settingController.handleFieldSwitch);

//get setting
route.get("/", checkAccessWithSecretKey(), settingController.index);

module.exports = route;
