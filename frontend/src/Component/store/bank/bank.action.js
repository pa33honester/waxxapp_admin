import { apiInstanceFetch } from "../../../util/api";
import * as ActionType from "./bank.type";
import axios from "axios";
import { setToast } from "../../../util/toast";
// get bank
export const getbank = () => (dispatch) => {
  apiInstanceFetch
    .get(`bank/getBanks`)
    .then((res) => {
      dispatch({ type: ActionType.GET_BANK, payload: res.bank });
    })
    .catch((error) => console.log(error.message));
};

// create bank  payment gateway valo api banavyo to ne aema disabled ni switch mukvani chhe delete nathi karavanu path : bank

export const createbank = (data) => (dispatch) => {
  axios
    .post(`bank/create`, data)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.CREATE_BANK,
          payload: res.data.bank,
        });
        setToast("success", "bank created successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log(error.message));
};

// edit bank

export const updatebank = (data, id) => (dispatch) => {
  axios
    .patch(`bank/update?bankId=${id}`, data)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_BANK,
          payload: { data: res.data.bank, id },
        });
        setToast("success", "bank update successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log(error.message));
};

export const deleteBank = (data) => (dispatch) => {
  axios
    .delete(`bank/delete?bankId=${data}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.DELETE_BANK,
          payload: { data: res.data.bank, id: data },
        });
        setToast("success", "bank deleted successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log(error.message));
};
