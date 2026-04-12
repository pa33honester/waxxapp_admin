import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./fakeReels.type";
import { setToast } from "../../../util/toast";;

export const getFakeReel = (start, limit) => (dispatch) => {
  apiInstanceFetch
    .get(`reel/getReels?start=${start}&limit=${limit}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_FAKE_REELS,
        payload: res.reels,
        totalReels: res.totalReels,
      });
    })
    .catch((error) => console.error(error));
};

// CREATE_FAKE_REELS
export const createFakeReel = (formData) => (dispatch) => {
  axios
    .post(`reel/uploadReelByAdmin`, formData)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.CREATE_FAKE_REELS,
          payload: res.data.reel,
        });

        setToast("success", "Reel Create successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

// UPDATE_FAKE_REEL

export const updateFakeReel = (formData, sellerId, reelId) => (dispatch) => {


  axios
    .patch(
      `reel/updateReelByAdmin?sellerId=${sellerId}&reelId=${reelId}`,
      formData
    )
    .then((res) => {
      
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_FAKE_REEL,
          payload: { data: res.data.reel, reelId },
        });
        setToast("success", "Reel update successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

// DELETE_FAKE_REEL

export const deleteFakeReel = (id) => (dispatch) => {
  axios
    .delete(`reel/deleteReel?reelId=${id}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.DELETE_FAKE_REELS,
          payload: id,
        });
        setToast("success", "Reel Delete successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};
