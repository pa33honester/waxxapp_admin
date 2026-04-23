import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./giveaway.type";
import { setToast } from "../../../util/toast";

export const getGiveaways = (status) => (dispatch) => {
  const qs = status ? `?status=${status}` : "";
  apiInstanceFetch
    .get(`giveaway/adminList${qs}`)
    .then((res) => {
      if (res?.status) {
        dispatch({ type: ActionType.GET_GIVEAWAYS, payload: res.giveaways || [] });
      }
    })
    .catch((error) => console.log("getGiveaways error", error?.message));
};

export const cancelGiveaway = (giveawayId) => (dispatch) => {
  axios
    .patch(`giveaway/adminCancel`, { giveawayId })
    .then((res) => {
      if (res.data.status) {
        dispatch({ type: ActionType.CANCEL_GIVEAWAY, payload: giveawayId });
        setToast("success", "Giveaway cancelled");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("cancelGiveaway error", error?.message));
};
