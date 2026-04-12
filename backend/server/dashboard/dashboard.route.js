const express = require("express");
const route = express.Router();

//Controller
const dashboardController = require("./dashboard.controller");

//checkAccessWithSecretKey
const checkAccessWithSecretKey = require("../../util/checkAccess");

//admin middleware
const AdminMiddleware = require("../middleware/admin.middleware");

//get admin panel dashboard
route.get("/", AdminMiddleware, checkAccessWithSecretKey(), dashboardController.dashboard);

//get date wise analytic for users
route.get("/analyticOfUsers", AdminMiddleware, checkAccessWithSecretKey(), dashboardController.analyticOfUsers);

//get date wise analytic for orders
route.get("/analyticOfOrders", AdminMiddleware, checkAccessWithSecretKey(), dashboardController.analyticOfOrders);

//get date wise chartAnalytic for users
route.get("/chartAnalyticOfUsers", AdminMiddleware, checkAccessWithSecretKey(), dashboardController.chartAnalyticOfUsers);

//get date wise chartAnalytic for admin revenue ( commission )
route.get("/revenueAnalyticsChartData", AdminMiddleware, checkAccessWithSecretKey(), dashboardController.revenueAnalyticsChartData);

module.exports = route;
