import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./faq.type";
import { setToast } from "../../../util/toast";;

export const getFaQ = () => (dispatch) => {
  apiInstanceFetch
    .get(`FAQ`)
    .then((res) => {
      dispatch({ type: ActionType.GET_FAQ, payload: res.FaQ });
    })
    .catch((error) => {
      console.log(error);
    });
};

// CREATE FaQ

export const createFaQ = (data) => (dispatch) => {
  axios
    .post(`FAQ/create`, data)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.CREATE_FAQ,
          payload: res.data.FaQ,
        });
        setToast("success", "FaQ Create successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

// UPDATE_FaQ

export const updateFaQ = (data, id) => (dispatch) => {
  axios
    .patch(`FAQ/update?FaQId=${id}`, data)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_FAQ,
          payload: { data: res.data.FaQ, id },
        });
        setToast("success", "FaQ update successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

// DELETE_FaQ

export const deleteFaQ = (id) => (dispatch) => {
  axios
    .delete(`FAQ/delete?FaQId=${id}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.DELETE_FAQ,
          payload: id,
        });
        setToast("success", "FaQ Delete successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};
