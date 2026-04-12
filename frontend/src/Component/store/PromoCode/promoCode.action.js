import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./promoCode.type";
import { setToast } from "../../../util/toast";;

export const getPromoCode = () => (dispatch) => {
  apiInstanceFetch
    .get(`promoCode/getAll`)
    .then((res) => {
      dispatch({ type: ActionType.GET_PROMOCODE, payload: res.promoCode });
    })
    .then((error) => {
      console.log(error);
    });
};

// CREATE PROMOCODE

export const createPromoCode = (data) => (dispatch) => {
  axios
    .post(`promoCode/create`, data)
    .then((res) => {
      
      if (res.data.status) {
        dispatch({
          type: ActionType.CREATE_PROMOCODE,
          payload: res.data.promoCode,
        });
        setToast("success", "PromoCode Create successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

// UPDATE_PROMOCODE

export const updatePromoCode = (data, id) => (dispatch) => {
  ;
  axios
    .post(`promoCode/update?promoCodeId=${id}`, data)
    .then((res) => {
      ;
      
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_PROMOCODE,
          payload: { data: res.data.promoCode, id },
        });
        setToast("success", "PromoCode update successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

// DELETE_CATEGORY

export const deletePromoCode = (id) => (dispatch) => {
  
  axios
    .delete(`promoCode/delete?promoCodeId=${id}`)
    .then((res) => {
      
      
      if (res.data.status) {
        dispatch({
          type: ActionType.DELETE_PROMOCODE,
          payload: id,
        });
        setToast("success", "promoCode Delete successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};
