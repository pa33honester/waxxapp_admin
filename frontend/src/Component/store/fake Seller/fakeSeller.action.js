import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./fakeSeller.type";
import { setToast } from "../../../util/toast";;

export const getFakeSeller = (start, limit) => (dispatch) => {
  apiInstanceFetch
    .get(`seller/getFakeSeller?start=${start}&limit=${limit}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_FAKE_SELLER,
        payload: res.sellers,
        totalSellers: res.totalSellers,
      });
    })
    .catch((error) => console.error(error));
};
export const getFakeSellerDropDown = () => (dispatch) => {
  apiInstanceFetch
    .get(`seller/fakeSellers`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_FAKE_SELLER_NAME,
        payload: res.seller,
      });
    })
    .catch((error) => console.error(error));
};

export const createFakeSeller = (formData) => (dispatch) => {
  axios
    .post("seller/createFakeSeller", formData)
    .then((res) => {
      if (res.data.status === true) {
        dispatch({
          type: ActionType.CREATE_FAKE_SELLER,
          payload: res.data.sellerData,
        });
        setToast("success", "Fake Seller created Successfully !");
      }
    })
    .catch((error) => console.error(error));
};

export const updateFakeSeller = (formData, id) => (dispatch) => {
  axios
    .patch(`seller/updateFakeSellerProfile?sellerId=${id}`, formData)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_FAKE_SELLER,
          payload: { updateSeller: res.data.seller, id },
        });

        setToast("success", "Fake Seller Updated Successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => {
      setToast("error", error.message);
      console.log(error);
    });
};

export const deleteFakeSeller = (id) => (dispatch) => {
  axios
    .delete(`seller/deleteSeller?sellerId=${id}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.DELETE_FAKE_SELLER,
          payload: id,
        });
        setToast("success", "Fake Seller Delete successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

export const sellerIsLive = (seller, block) => (dispatch) => {
  axios
    .patch(`seller/liveOrNot?sellerId=${seller?._id}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.ISLIVE_FAKE_SELLER,
          payload: { data: res.data.seller, id: seller?._id },
        });
        setToast(
          "success",
          `${seller.firstName}  isLive ${block === true ? "Enable" : "Disable"
          } Successfully!`
        );
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error));
};


export const getProducts = (sellerId) => (dispatch) => {

  apiInstanceFetch
    .get(`liveSeller/retrieveProductList?sellerId=${sellerId}`)
    .then((res) => {

      dispatch({
        type: ActionType.GET_PRODUCTS,
        payload: res.data,
      });
    })
    .catch((error) => console.error(error));
};

export const selectProducts = (data) => (dispatch) => {
  axios
    .post(`liveSeller/setSellerLiveWithProducts`, data)
    .then((res) => {
      if(res.data.status === true){
        dispatch({
          type: ActionType.IS_LIVE_SELLER,
          payload: {data : res.data.data , id : data?.sellerId
          },
        });
      setToast("success", res.data.message);

      }else {
        setToast("error", res.data.message);
      }     
    })
    .catch((error) => console.error(error));
};

export const setOfflineStatus = (id) => (dispatch) => {
  axios
  .patch(`liveSeller/setSellerOfflineAndResetProducts?sellerId=${id}`)
  .then((res) => {

    
    if (res.data.status) {
      dispatch({
        type: ActionType.IS_OFFLINE,
        payload: {data : res.data.data , id : id},
      });
      setToast("success", res.data.message);
    }else {
      setToast("error", res.data.message);
      
    }
  })
  .catch((error) => {
    setToast("error", error);
  });
}
