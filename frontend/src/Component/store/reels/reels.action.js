import axios from "axios";
import { apiInstanceFetch } from "../../../util/api";
import * as ActionType from "./reels.type";
import { setToast } from "../../../util/toast";;

export const getReel = (start, limit) => (dispatch) => {
  apiInstanceFetch
    .get(`reel/getRealReels?start=${start}&limit=${limit}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_REELS,
        payload: res.reels,
        totalReels: res.totalReels,
      });
    })
    .catch((error) => console.error(error));
};
export const getReportedReel = (start, limit) => (dispatch) => {
  apiInstanceFetch
    .get(`reportToReel/reportsOfReel?start=${start}&limit=${limit}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_REPORTED_REELS,
        payload: res.reportOfReels,
        totalReportOfReels: res.totalReportOfReels,
      });
    })
    .catch((error) => console.error(error));
};

export const deleteReel = (id) => (dispatch) => {
  axios
    .delete(`reel/deleteReel?reelId=${id}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.DELETE_REELS,
          payload: id,
        });
        setToast("success", "Reel Delete successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

export const reelLike = (id) => (dispatch) => {
  apiInstanceFetch
    .get(`reel/likeHistoryOfReel?reelId=${id}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_REEL_LIKE,
        payload: res.likeHistoryOfReel,
      });
    })
    .catch((error) => console.error(error));
};
export const reelComment = (id) => (dispatch) => {
  apiInstanceFetch
    .get(`reel/detailsOfReel?reelId=${id}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_REEL_INFO,
        payload: res.reel,
      });
    })
    .catch((error) => console.error(error));
};
export const reelInfo = (id) => (dispatch) => {
  axios
    .get(`reel/detailsOfReel?reelId=${id}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_REEL_INFO,
        payload: res.data.reel,
      });
    })
    .catch((error) => console.error(error));
};
