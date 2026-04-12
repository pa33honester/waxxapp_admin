import axios from "axios";
import { apiInstanceFetch } from "../../../util/api";
import { setToast } from "../../../util/toast";
import * as ActionType from "./videoReport.type";

export const getVideoReport = (status, start, limit) => (dispatch) => {
    apiInstanceFetch
        .get(`reportToReel/reportsOfReel?status=${status}&start=${start}&limit=${limit}`)
        .then((res) => {
            dispatch({
                type: ActionType.GET_VIDEO_REPORT,
                payload: res,
            });
        })
        .catch((error) => console.error(error));
};

export const resolveReport = (reportId) => (dispatch) => {
    axios
        .patch(`reportToReel/resolveReport?reportId=${reportId}`)
        .then((res) => {
            if (res.status) {
                dispatch({ type: ActionType.UPDATE_VIDEO_REPORT, payload: reportId });
                setToast(
                    "success",
                    "Video Report Request Accept Successfully"
                );
            }
        })
        .catch((error) => {
            console.log(error);
        });
};

export const deleteVideoReport = (reportId , reelId) => (dispatch) => {
    axios
        .delete(`reportToReel/deleteReport?reportId=${reportId}&reelId=${reelId}`)
        .then((res) => {
            if (res.status) {
                dispatch({ type: ActionType.DELETE_VIDEO_REPORT, payload: reportId });
                setToast(
                    "success",
                    "Video Report Request Declined Successfully"
                );
            }
        })
        .catch((error) => {
            console.log(error);
        });
};