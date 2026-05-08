const express = require("express");
const route = express.Router();

const checkAccessWithSecretKey = require("../../util/checkAccess");
const PrivateFileController = require("./privateFile.controller");

// GET /private-file/:filename
// Serves a file from backend/private_storage/ if the requester is
// either an admin (JWT in Authorization header) OR the owner of a
// doc that references the filename.
route.get("/:filename", checkAccessWithSecretKey(), PrivateFileController.serve);

module.exports = route;
