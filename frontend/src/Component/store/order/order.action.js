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