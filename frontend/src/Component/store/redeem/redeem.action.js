import { apiInstanceFetch } from "../../../util/api";
import { GET_REDEEM_REQUEST, REDEEM_ACTION, ADMIN_WALLET, ACCEPTSELLERWITHDRAWALREQUEST, GET_SELLER_WITHDRAWAL_REQUEST, GET_ADMIN_EARNING, DECLINESELLERWITHDRAWALREQUEST } from "./redeem.type";
import axios from "axios";
import { setToast } from "../../../util/toast";;

//get reels
export const getRedeem = (type) => (dispatch) => {
  apiInstanceFetch
    .get(`sellerWallet/sellerPendingWithdrawalRequestedAmountForAdmin`)
    .then((res) => {
      dispatch({
        type: GET_REDEEM_REQUEST,

        payload: {
          data: res.sellerPendingWithdrawalRequestedAmount,
          total: res.totalsellerPendingWithdrawalRequestedAmount,
        },
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

//action for redeem request
export const action = (redeemId) => (dispatch) => {
  axios
    .post(`sellerWallet/byAdminToSeller?sellerWalletId=${redeemId}`)
    .then((res) => {
      if (res.status) {
        dispatch({ type: REDEEM_ACTION, payload: redeemId });

        setToast(
          "success",
          "Seller Withdrawal Requested Amount Pay Successfully"
        );
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

export const getAdminWallet = () => (dispatch) => {

  apiInstanceFetch
    .get("sellerWallet/adminCommissionWallet")
    .then((res) => {

      dispatch({ type: ADMIN_WALLET, payload: res.data });
    })
    .catch((error) => {
      console.log("error", error);
    });
};

export const getWithdrawalRequest = (start, limit, startDate, endDate, type) => (dispatch) => {

  apiInstanceFetch
    .get(`withdrawRequest/listWithdrawalRequests?start=${start}&limit=${limit}&startDate=${startDate}&endDate=${endDate}&type=${type}`)
    .then((res) => {

      dispatch({ type: GET_SELLER_WITHDRAWAL_REQUEST, payload: res });
    })
    .catch((error) => {
      console.log("error", error);
    });
};


export const acceptWithdrawalRequest = (payload) => (dispatch) => {
  apiInstanceFetch
    .patch(`withdrawRequest/approveWithdrawalRequest?requestId=${payload.requestId}&personId=${payload.personId}`)
    .then((res) => {
      if (res.status) {
        dispatch({ type: ACCEPTSELLERWITHDRAWALREQUEST, payload: payload.requestId });
        setToast(
          "success",
          "Seller Withdrawal Requested Accept Successfully"
        );
      }
    })
    .catch((error) => {
      console.log(error);
    });
};

export const declineWithdrawalRequest = (payload) => (dispatch) => {
  apiInstanceFetch
    .patch(`withdrawRequest/rejectWithdrawalRequest?requestId=${payload.requestId}&personId=${payload.personId}&reason=${payload.reason}`)
    .then((res) => {

      if (res.status) {
        dispatch({
          type: DECLINESELLERWITHDRAWALREQUEST,
          payload: payload.requestId
        });
        setToast(
          "success",
          "Seller Withdrawal Request Declined Successfully"
        );
      }
    })
    .catch((error) => {
      console.log(error);
      setToast("error", "Failed to decline request");
    });
};


export const getAdminEarning = (start, limit, startDate, endDate) => (dispatch) => {
  apiInstanceFetch
    .get(`sellerWallet/fetchAdminEarnings?start=${start}&limit=${limit}&startDate=${startDate}&endDate=${endDate}`)
    .then((res) => {
      dispatch({ type: GET_ADMIN_EARNING, payload: res });
    })
    .catch((error) => {
      console.log("error", error);
    });
};

