import { apiInstanceFetch } from "../../../util/api";
import * as ActionType from "./currency.type";
import axios from "axios";
import { setToast } from "../../../util/toast";;
// get withdraw
export const getCurrency = () => (dispatch) => {
    apiInstanceFetch
        .get(`currency/fetchCurrencies`)
        .then((res) => {
                
            dispatch({ type: ActionType.GET_CURRENCY, payload: res.data });
        })
        .catch((error) => console.log(error.message));
};

export const getDefaultCurrency = () => (dispatch) => {
    apiInstanceFetch
        .get(`currency/getDefaultCurrency`)
        .then((res) => {
            dispatch({ type: ActionType.GET_DEFAULT_CURRENCY, payload: res.data });
        })
        .catch((error) => console.log(error.message));
};

// create withdraw  payment gateway valo api banavyo to ne aema disabled ni switch mukvani chhe delete nathi karavanu path : withdraw

export const createCurrency = (data) => (dispatch) => {

    axios
        .post(`currency/storeCurrency`, data)
        .then((res) => {
            
            if (res.data.status) {
                dispatch({
                    type: ActionType.CREATE_CURRENCY,
                    payload: res.data.data,
                });
                setToast("success", "Currency created successfully");
            } else {
                setToast("error", res.data.message);
            }
        })
        .catch((error) => console.log(error.message));
};


export const deleteCurrency = (id) => (dispatch) => {
    axios
      .delete(`currency/deleteCurrency?currencyId=${id}`)
      .then((res) => {
        if (res.data.status) {
          dispatch({
            type: ActionType.DELETE_CURRENCY,
            payload: id,
          });
          setToast("success", "Currency Delete successfully");
        } else {
          setToast("error", res.data.message);
        }
      })
      .catch((error) => console.log("error", error.message));
  };

// edit withdraw

export const updateCurrency = (payload, id) => (dispatch) => {

    axios
        .patch(`currency/updateCurrency?currencyId=${id}`, payload)
        .then((res) => {
                
            if (res.data.status) {
                dispatch({
                    type: ActionType.UPDATE_CURRENCY,
                    payload: { data: res.data.data, id },
                });
                setToast("success", "Currency update successfully");
            } else {
                setToast("error", res.data.message);
            }
        })
        .catch((error) => console.log(error.message));
};


export const enabledDisabled = (data, block) => (dispatch) => {
        
    axios
        .patch(`currency/setdefaultCurrency?currencyId=${data._id}`)
        .then((res) => {
                
            if (res.data.status) {
                dispatch({
                    type: ActionType.DEFAULT_CURRENCY,
                    payload: { data: res.data.data, id: data?._id },
                });
                setToast(
                    "success",
                    `${data.name} Is ${data?.isDefault === true ? "Disabled" : "Enabled"
                    } Successfully!`
                );
            } else {
                setToast("error", res.data.message);
            }
        })
        .catch((error) => console.log(error.message));
};
