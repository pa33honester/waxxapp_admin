import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./user.type";
import { setToast } from "../../../util/toast";;

export const getUser = (start, limit) => (dispatch) => {
  apiInstanceFetch
    .get(`user?start=${start}&limit=${limit}`)
    .then((res) => {
      
      dispatch({
        type: ActionType.GET_USER,
        payload: { data: res.users, totalUser: res.totalUsers },
      });
    })
    .catch((error) => console.error(error));
};

export const userIsBlock = (user, block) => (dispatch) => {
  axios
    .patch(`user/blockUnblock?userId=${user._id}`)
    .then((res) => {
    
      if (res.data.status) {
        dispatch({
          type: ActionType.BLOCK_UNBLOCK_USER,
          payload: { data: res.data.user, id: user._id },
        });
        setToast(
          "success",
          `${user.firstName} Is ${
            block === true ? "Blocked" : "Unblocked"
          } Successfully!`
        );
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error));
};

export const getUserProfile = (id) => (dispatch) => {
  apiInstanceFetch
    .get(`user/profile?userId=${id}`)
    .then((res) => {
      
      dispatch({
        type: ActionType.GET_USER_PROFILE,
        payload: res.user,
        
      });
    })
    .catch((error) => console.error(error));
};


export const getUserOrder = (userId,start,limit, status) => (dispatch) => {
  
  apiInstanceFetch
    .get(`order/ordersOfUser?userId=${userId}&start=${start}&limit=${limit}&status=${status}`)
    .then((res) => {
      

      dispatch({
        type: ActionType.GET_USER_ORDER,
        payload: res.orderData,
      });
    })
    .catch((error) => console.error(error));
};
