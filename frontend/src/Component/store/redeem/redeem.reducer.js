import { GET_SELLER_WITHDRAWAL_REQUEST, ADMIN_WALLET, GET_REDEEM_REQUEST, REDEEM_ACTION, ACCEPTSELLERWITHDRAWALREQUEST, GET_ADMIN_EARNING, DECLINESELLERWITHDRAWALREQUEST } from "./redeem.type";

const initialState = {
  redeem: [],
  // total: 0,
  adminCommision: {},
  sellerWithdrawal: [],
  adminEarning: [],
  totalEarnings: "",
  adminTotalEarnings: "",
  total: ""
};

const redeemReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_REDEEM_REQUEST:

      return {
        ...state,
        redeem: action.payload.data,
        total: action.payload.total
      };
    case REDEEM_ACTION:

      return {

        ...state,
        redeem: state.redeem.filter((redeem) => redeem._id !== action.payload),
      };
    case ADMIN_WALLET:

      return {
        ...state,
        adminCommision: action.payload,

      };

    case GET_SELLER_WITHDRAWAL_REQUEST:
      return {
        ...state,
        sellerWithdrawal: action.payload.data,
        // totalEarnings : action.payload.totalEarnings,
        total: action.payload.total

      };

    case ACCEPTSELLERWITHDRAWALREQUEST:
      return {
        ...state,
        sellerWithdrawal: state.sellerWithdrawal.filter((redeem) => redeem._id !== action?.payload),
      };

    case DECLINESELLERWITHDRAWALREQUEST:
      return {
        ...state,
        sellerWithdrawal: state.sellerWithdrawal.filter((redeem) => redeem._id !== action?.payload),
      };

    case GET_ADMIN_EARNING:
      return {
        ...state,
        adminEarning: action.payload.data,
        adminTotalEarnings : action.payload.totalEarnings,
        total: action.payload.total
      };


    default:
      return state;
  }
};

export default redeemReducer;
