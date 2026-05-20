const express = require("express");
const route = express.Router();

//Controller
const orderController = require("./order.controller");

const checkAccessWithSecretKey = require("../../util/checkAccess");

//create order by the user
route.post("/create", checkAccessWithSecretKey(), orderController.createOrder);

//update statusWise the order by seller and admin
route.patch("/updateOrder", checkAccessWithSecretKey(), orderController.updateOrder);

//cancel the order by user
route.patch("/cancelOrderByUser", checkAccessWithSecretKey(), orderController.cancelOrderByUser);

//seller requests delivery (Confirmed -> Delivery Requested). Admin must approve.
route.patch("/requestDeliveryBySeller", checkAccessWithSecretKey(), orderController.requestDeliveryBySeller);

//admin approves delivery (Delivery Requested -> Out Of Delivery). Starts 48h buyer acceptance window.
route.patch("/approveDeliveryByAdmin", checkAccessWithSecretKey(), orderController.approveDeliveryByAdmin);

//buyer confirms they received the item (Out Of Delivery -> Delivered). Does NOT credit wallet.
route.patch("/acceptDeliveryByBuyer", checkAccessWithSecretKey(), orderController.acceptDeliveryByBuyer);

//admin marks order Complete (Delivered -> Complete). This is when the seller wallet is credited.
route.patch("/completeOrderByAdmin", checkAccessWithSecretKey(), orderController.completeOrderByAdmin);

//get status wise order counts for seller
route.get("/orderCountForSeller", checkAccessWithSecretKey(), orderController.orderCountForSeller);

//get status wise order details for seller
route.get("/orderDetailsForSeller", checkAccessWithSecretKey(), orderController.orderDetailsForSeller);

//get status wise order details for user
route.get("/orderDetailsForUser", checkAccessWithSecretKey(), orderController.orderDetailsForUser);

//get all orders for admin
route.get("/getOrders", checkAccessWithSecretKey(), orderController.getOrders);

//get particular user's status wise orders for admin (user)
route.get("/ordersOfUser", checkAccessWithSecretKey(), orderController.ordersOfUser);

//get particular seller's status wise orders for admin (Seller)
route.get("/ordersOfSeller", checkAccessWithSecretKey(), orderController.ordersOfSeller);

//get particular orderWise order details for admin
route.get("/orderDetails", checkAccessWithSecretKey(), orderController.orderDetails);

//get recent orders for admin (dashboard)
route.get("/recentOrders", checkAccessWithSecretKey(), orderController.recentOrders);

//confirm cod order ( seller )
route.patch("/confirmCodOrderItemBySeller", checkAccessWithSecretKey(), orderController.confirmCodOrderItemBySeller);

//update order ( within payment reminder min payment made )
route.patch("/modifyOrderItemStatus", checkAccessWithSecretKey(), orderController.modifyOrderItemStatus);

module.exports = route;
