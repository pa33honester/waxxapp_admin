import axios from "axios";
import { apiInstanceFetch } from "../../../util/api";
import { setToast } from "../../../util/toast";
import * as ActionType from "./reportReason.type";

export const getReportReason = () => (dispatch) => {
  apiInstanceFetch
    .get(`reportReason/getReportreason`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_REPORT_REASON,
        payload: res.data,
      });
    })
    .catch((error) => console.error(error));
};

export const addReportReason = (title) => (dispatch) => {
  axios
    .post(`reportReason/createReportreason?title=${title}`)
    .then((res) => {
      if (res.data.status === true) {
        dispatch({ type: ActionType.CREATE_REPORT_REASON, payload: res.data.data });
        setToast("success", "Report Reason created Successfully !");
      }
    })
    .catch((error) => console.error(error));
};

export const deleteReportReason = (id) => (dispatch) => {
  axios
    .delete(`reportReason/deleteReportreason?reportReasonId=${id}`)
    .then((res) => {
        
      if (res.data.status === true) {
        dispatch({ type: ActionType.DELETE_REPORT_REASON, payload: id });
        setToast("success", "Report Reason deleted Successfully !");
      }
    })
    .catch((error) => console.error(error));
};

export const updateReportReason = (title, id) => (dispatch) => {
  axios
    .patch(`reportReason/updateReportreason?reportReasonId=${id}&title=${title}`)
    .then((res) => {
      if (res.data.status === true) {
        dispatch({ type: ActionType.UPDATE_REPORT_REASON, payload: res.data.data });
        setToast("success", "Report Reason updated Successfully !");
      }
    })
    .catch((error) => console.error(error));
};