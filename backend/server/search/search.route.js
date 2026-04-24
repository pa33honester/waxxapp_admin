const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");
const searchController = require("./search.controller");

// Unified multi-scope search.
route.get("/all", checkAccessWithSecretKey(), searchController.searchAll);

module.exports = route;
