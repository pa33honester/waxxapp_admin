import * as ActionType from "./notification.type";
import axios from "axios";
import { setToast } from "../../../util/toast";;

export const SendSellerNotification = (formData,sellerId) => (dispatch) => {
  axios
    .post(`/notification/particularSeller?sellerId=${sellerId}`, formData)
    .then((res) => {
      
      if (res.data.status) {
        setToast("success", "Notification sent successfully to Seller");
        dispatch({
          type: ActionType.SEND_SELLER_NOTIFICATION,
          payload: { data: res.data.message, id: sellerId },
        });
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log(error));
};

export const sendAllNotification = (formData,type) => (dispatch) => {

  axios
    .post(`/notification/send?notificationType=${type}`, formData)
    .then((res) => {
      
      if (res.data.status) {
        dispatch({ type: ActionType.SEND_NOTIFICATION, payload: res.data });
        setToast("success", `Notification Sent Successfully to ${type}`);
      }
    })
    .catch((error) => setToast("error", error));
};

