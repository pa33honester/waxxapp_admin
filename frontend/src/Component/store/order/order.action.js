import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./order.type";
import { setToast } from "../../../util/toast";;

export const getOrder = (start,limit,status) => (dispatch) => {
  

  apiInstanceFetch
    .get(`order/getOrders?start=${start}&limit=${limit}&status=${status}`)
    .then((res) => {
   
    
      dispatch({
        type: ActionType.GET_ORDER,
        payload: res,
        totalOrder: res.totalOrders, 
      });
    })
    .catch((error) => console.error(error));
};


//Order update
export const orderUpdate = (userId,orderId,status,itemId,data) => (dispatch) => {

  axios
  .patch(
    !data
      ? `order/updateOrder?userId=${userId}&orderId=${orderId}&status=${status}&itemId=${itemId}`
      : `order/updateOrder?userId=${userId}&orderId=${orderId}&status=${status}&itemId=${itemId}`,
    data
  )
    .then((res) => {
      
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_ORDER,
          payload: { updateOrder: res.data.data, userId,orderId,status,itemId},
        });
        setToast("success","Order Update Successfully!");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error));
};

// Admin-only "release funds" action. Hits the dedicated endpoint that creates
// the SellerWallet deposit row and increments seller.netPayout. The reducer
// payload mirrors orderUpdate so the existing UPDATE_ORDER case can swap the
// row's status to "Complete" without a new case.
export const completeOrder = (userId, orderId, itemId) => (dispatch) => {
  axios
    .patch(`order/completeOrderByAdmin?orderId=${orderId}&itemId=${itemId}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_ORDER,
          payload: { updateOrder: res.data.data, userId, orderId, status: "Complete", itemId },
        });
        setToast("success", res.data.message || "Order marked Complete. Funds released.");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error));
};

// Admin approves a seller's delivery request (Delivery Requested → Out Of Delivery).
// Hits the dedicated endpoint that sets tracking info + deliveryStartedAt for the 48h worker.
export const approveDelivery = (orderId, itemId, data) => (dispatch) => {
  axios
    .patch(`order/approveDeliveryByAdmin?orderId=${orderId}&itemId=${itemId}`, data)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_ORDER,
          payload: { updateOrder: res.data.data, orderId, status: "Out Of Delivery", itemId },
        });
        setToast("success", res.data.message || "Delivery approved. Order is Out Of Delivery.");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error));
};

// get order details

export const getOrderDetail = (id) => (dispatch) =>{
  
  apiInstanceFetch
    .get(`order/orderDetails?orderId=${id}`)
    .then((res) => {
      
      dispatch({
        type: ActionType.GET_ORDER_DETAIL,
        payload: res.order,
      });
    })
    .catch((error) => console.error(error));
}