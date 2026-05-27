import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./sellerRequest.type";
import { setToast } from "../../../util/toast";

export const getSellerRequest = () => (dispatch) => {
  apiInstanceFetch
    .get(`request`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_SELLER_REQUEST,
        payload: res.request,
      });
    })
    .catch((error) => console.error(error));
};

export const acceptSellerRequest = (id) => (dispatch) => {
  return axios
    .patch(`request/acceptOrNot?requestId=${id}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({ type: ActionType.ACCEPT_SELLER_REQUEST, payload: id });
        setToast("success", res.data.message);
        return res.data.seller?._id || null;
      } else {
        setToast("error", res.data.message);
        return null;
      }
    })
    .catch((error) => {
      setToast("error", error);
      return null;
    });
};
// Seller request update
export const sellerRequestUpdate = (formData, id) => (dispatch) => {
  axios
    .patch(`request/update?requestId=${id}`, formData)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_SELLER_REQUEST,
          payload: { updateRequest: res.data.request, id },
        });
        setToast("success", "Seller Request Update Successfully!");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error));
};
