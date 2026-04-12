import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./setting.type";
import { setToast } from "../../../util/toast";;

export const getSetting = () => (dispatch) => {
  apiInstanceFetch
    .get(`setting`)
    .then((res) => {
      dispatch({ type: ActionType.GET_SETTING, payload: res.setting });
    })
    .catch((error) => {
      console.log(error);
    });
};

export const updateSetting = (settingData, id) => (dispatch) => {
  axios
    .patch(`setting/update?settingId=${id}`, settingData)
    .then((res) => {
      if (res.data.status === true) {
        dispatch({
          type: ActionType.UPDATE_SETTING,
          payload: res.data.setting,
        });
        setToast("success", "Setting Update Successfully!");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log(error));
};

export const handleSellerToggleSwitch = (id, field, toggleType) => (dispatch) => {

  axios
  .patch(`setting/handleFieldSwitch?settingId=${id}&field=${field}&toggleType=${toggleType}`)
  .then((res) => {
    console.log("res**-setting-seller-switch", res);
    
    if (res.data.status === true) {
      dispatch({
        type: ActionType.HANDLE_SELLER_TOGGLE_SWITCH,
        payload: { setting: res.data.setting, id },
      });
      setToast("success", "Setting Update Successfully!");
    } else {
      setToast("error", res.data.message);
    }
  })
  .catch((error) => console.log(error));
  
}

//Handle Toggle Switch
export const handleToggleSwitch = (id, type, setting) => (dispatch) => {
  axios
    .patch(`setting/handleSwitch?settingId=${id}&type=${type}`)
    .then((res) => {
      
      if (res.data.status === true) {
        dispatch({
          type: ActionType.HANDLE_TOGGLE_SWITCH,
          payload: { setting: res.data.setting, id },
        });
        {
          type === "productRequest" &&
            (setting.isAddProductRequest === true
              ? setToast(
                  "success",
                  `Add Product Request Switch Off Successfully!`
                )
              : setToast(
                  "success",
                  `Add Product Request Switch On Successfully!`
                ));
        }
        {
          type === "updateProductRequest" &&
            (setting.isUpdateProductRequest === true
              ? setToast(
                  "success",
                  `Update Product Request Switch Off Successfully!`
                )
              : setToast(
                  "success",
                  `Update Product Request Switch On Successfully!`
                ));
        }
        
        {
          type === "isFakeData" &&
            (setting?.isFakeData === true
              ? setToast(
                  "success",
                  `Fake Data Switch Off Successfully!`
                )
              : setToast(
                  "success",
                  `Fake Data Switch On Successfully!`
                ));
        }
        
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log(error));
};
