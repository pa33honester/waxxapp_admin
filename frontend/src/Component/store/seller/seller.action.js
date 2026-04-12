import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./seller.type";
import { setToast } from "../../../util/toast";

// GET SELLER

export const getSeller = (start, limit) => (dispatch) => {
  apiInstanceFetch
    .get(`seller/getRealSeller?start=${start}&limit=${limit}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_SELLER,
        payload: res.sellers,
        totalSeller: res.totalSellers,
      });
    })
    .catch((error) => console.error(error));
};

export const sellerDropDown = () => (dispatch) => {
  apiInstanceFetch
    .get("seller/getSellerAddedByAdmin")
    .then((res) => {
      dispatch({
        type: ActionType.GET_SELLER_DROP_DOWN,
        payload: res.seller,
      });
    })
    .catch((error) => console.error(error));
};

// SELLER BLOCK UNBLOCK

export const sellerIsBlock = (seller, block) => (dispatch) => {
  axios
    .patch(`seller/blockUnblock?sellerId=${seller._id}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.BLOCK_UNBLOCK_SELLER,
          payload: { data: res.data.seller, id: seller._id },
        });
        setToast(
          "success",
          `${seller.firstName} Is ${block === true ? "Blocked" : "Unblocked"
          } Successfully!`
        );
      } else {
        setToast("error", "Seller Unblock Successfully !!");
      }
    })
    .catch((error) => setToast("error", error));
};

// CREATE SELLER

export const createSeller = (formData) => (dispatch) => {
  axios
    .post("seller/createByAdmin", formData)
    .then((res) => {
      if (res.data.status === true) {
        dispatch({ type: ActionType.CREATE_SELLER, payload: res.data.seller });
        setToast("success", "Seller  created Successfully !");
      }
    })
    .catch((error) => console.error(error));
};

// UPDATE SELLER

export const updateSeller = (formData, id) => (dispatch) => {
  axios
    .patch(`seller/update?sellerId=${id}`, formData)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_SELLER,
          payload: { updateSeller: res.data.seller, id },
        });

        setToast("success", "Seller Updated Successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => {
      setToast("error", error.message);
      console.log(error);
    });
};

// GET SELLER PROFILE

export const getSellerProfile = (id) => (dispatch) => {
  apiInstanceFetch
    .get(`seller/getProfileByAdmin?sellerId=${id}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_SELLER_PROFILE,
        payload: res.seller,
      });
    })
    .catch((error) => {
      console.error(error);
    });
};

// SELLER ORDER

export const getSellerProduct = (sellerId) => (dispatch) => {
  apiInstanceFetch
    .get(`product/getSellerWise?sellerId=${sellerId}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_SELLER_PRODUCT,
        payload: res.product,
      });
    })
    .catch((error) => console.error(error));
};

// Get Seller Wallet

export const getSellerWallet = (sellerId) => (dispatch) => {
  apiInstanceFetch
    .get(`sellerWallet/getAllAmount?sellerId=${sellerId}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_SELLER_WALLET,
        payload: res,
      });
    })
    .catch((error) => console.error(error));
};
// Get Seller Transition

export const getSellerTransition =
  (start, limit, startDate, endDate, sellerId, status) => (dispatch) => {
    
    apiInstanceFetch
      .get(
        `sellerWallet/retrieveSellerTransactions?start=${start}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&sellerId=${sellerId}&status=${status}`
      )
      .then((res) => {
        
        dispatch({
          type: ActionType.GET_SELLER_TRANSITION,
          payload: res,
        });
      })
      .catch((error) => console.error(error));
  };
export const getSellerOrder =
  (sellerId, start, limit, status) => (dispatch) => {
    apiInstanceFetch
      .get(
        `order/ordersOfSeller?sellerId=${sellerId}&start=${start}&limit=${limit}&status=${status}`
      )
      .then((res) => {
        if (res.status) {
          dispatch({
            type: ActionType.GET_SELLER_ORDER,
            payload: res,
          });
        }
      })
      .catch((error) => console.error(error));
  };
export const getSellerOrderDetail = (sellerId, orderId) => (dispatch) => {
  apiInstanceFetch
    .get(`order/orderForSeller?sellerId=${sellerId}&orderId=${orderId}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.GET_SELLER_ORDER_DETAIL,
          payload: res.order,
        });
      }
    })
    .catch((error) => console.error(error));
};

// live seller

export const getLiveSeller = (start, limit) => (dispatch) => {
  apiInstanceFetch
    .get(`liveSeller/liveSellerList?start=${start}&limit=${limit}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_LIVE_SELLER,
        payload: res.liveSeller,
      });
    })
    .catch((error) => console.error(error));
};

// get live seller product

// export const getLiveSellerProduct = (sellerId) => (dispatch) => {
//   apiInstanceFetch
//     .get(`product/selectedProducts?sellerId=${sellerId}`)
//     .then((res) => {
//       dispatch({
//         type: ActionType.GET_LIVE_SELLER_PRODUCT,
//         payload: res.SelectedProducts,
//       });
//     })
//     .catch((error) => console.error(error));
// };


export const getLiveSellerProduct = (sellerId) => (dispatch) => {
  dispatch({ type: ActionType.GET_LIVE_SELLER_PRODUCT_REQUEST });
  apiInstanceFetch
    .get(`product/selectedProducts?sellerId=${sellerId}`)
    .then((res) => {
      console.log("res-LIVE-SELLER", res);
      
      dispatch({
        type: ActionType.GET_LIVE_SELLER_PRODUCT_SUCCESS,
        payload: res.SelectedProducts,
      });
    })
    .catch((error) => {
      dispatch({ type: ActionType.GET_LIVE_SELLER_PRODUCT_FAILURE });
      console.error(error);
    });
};

