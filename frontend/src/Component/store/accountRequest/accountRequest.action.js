import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./accountRequest.type";
import { setToast } from "../../../util/toast";

// list pending sign-up requests
export const getAccountRequests = () => (dispatch) => {
  apiInstanceFetch
    .get(`accountRequest`)
    .then((res) => {
      if (res.status) {
        dispatch({
          type: ActionType.GET_ACCOUNT_REQUESTS,
          payload: res.accountRequests,
        });
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => console.error(error));
};

// approve a request — creates the real user account
export const approveAccountRequest = (id) => (dispatch) => {
  axios
    .patch(`accountRequest/approve?requestId=${id}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.APPROVE_ACCOUNT_REQUEST,
          payload: { request: res.data.request, id },
        });
        setToast("success", res.data.message);
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error));
};

// reject a request (reason optional)
export const rejectAccountRequest = (id, rejectReason) => (dispatch) => {
  axios
    .patch(`accountRequest/reject?requestId=${id}`, { rejectReason })
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.REJECT_ACCOUNT_REQUEST,
          payload: { request: res.data.request, id },
        });
        setToast("success", res.data.message);
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error));
};

// delete a request row
export const deleteAccountRequest = (id) => (dispatch) => {
  axios
    .delete(`accountRequest/delete?requestId=${id}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({ type: ActionType.DELETE_ACCOUNT_REQUEST, payload: id });
        setToast("success", res.data.message);
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error));
};
