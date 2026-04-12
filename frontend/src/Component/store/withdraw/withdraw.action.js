import { apiInstanceFetch } from "../../../util/api";
import * as ActionType from "./withdraw.type";
import axios from "axios";
import { setToast } from "../../../util/toast";;
// get withdraw
export const getWithdraw = () => (dispatch) => {
  apiInstanceFetch
    .get(`withdraw`)
    .then((res) => {

      dispatch({ type: ActionType.GET_WITHDRAW, payload: res.withdraw });
    })
    .catch((error) => console.log(error.message));
};

// create withdraw  payment gateway valo api banavyo to ne aema disabled ni switch mukvani chhe delete nathi karavanu path : withdraw

export const createWithdraw = (formData) => (dispatch) => {
  
  axios
    .post(`withdraw/create`, formData)
    .then((res) => {
      
      if (res.data.status) {
        dispatch({
          type: ActionType.CREATE_WITHDRAW,
          payload: res.data.withdraw,
        });
        setToast("success", "withdraw created successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log(error.message));
};

// edit withdraw

export const updateWithdraw = (formData , id) => (dispatch) => {
  
  axios
    .patch(`withdraw/update?withdrawId=${id}`, formData)
    .then((res) => {
      
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_WITHDRAW,
          payload: { data: res.data.withdraw, id },
        });
        setToast("success", "withdraw update successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log(error.message));
};


export const enabledDisabled = (data,block) => (dispatch) => {
  
  axios
    .patch(`withdraw/handleSwitch?withdrawId=${data._id}`)
    .then((res) => {
      
      if (res.data.status) {
        dispatch({
          type: ActionType.DELETE_WITHDRAW,
          payload: { data: res.data.withdraw, id: data._id },
        });
        setToast(
          "success",
          `${data.name} Is ${
            block === true ? "Disabled" : "Enabled"
          } Successfully!`
        );
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log(error.message));
};
