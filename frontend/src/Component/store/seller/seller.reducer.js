
import * as ActionType from "./seller.type";

const initialState = {
  seller: [],
  totalSeller: 0,
  sellerWallet: {},
  sellerProfile: {},
  sellerTransition: [],
  sellerTransitionTotal: 0,
  total: 0,
  liveProduct: [],
  loadingLiveProduct: false,
};
// console.log("live product" , liveProduct);

export const sellerReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_SELLER:
      return {
        ...state,
        seller: action.payload,
        totalSeller: action.totalSeller,
      };
    case ActionType.GET_SELLER_DROP_DOWN:
      return {
        ...state,
        seller: action.payload
      }
    case ActionType.BLOCK_UNBLOCK_SELLER:
      return {
        ...state,
        seller: state.seller.map((sellerBlock) =>

          sellerBlock._id === action.payload.id ? { ...sellerBlock, isBlock: action.payload.data.isBlock } : sellerBlock
        ),
        sellerProfile: action.payload.data,
      };
    case ActionType.CREATE_SELLER:
      let data = [...state.seller];
      data.unshift(action.payload);

      return {
        ...state,
        seller: data,
      };
    case ActionType.UPDATE_SELLER:
      return {
        ...state,
        seller: state.seller.map((data) =>
          data._id === action.payload.updateSeller._id
            ? action.payload.updateSeller
            : data
        ),
      };
    case ActionType.GET_SELLER_PROFILE:
      return {
        ...state,
        sellerProfile: action.payload,
      };
    case ActionType.GET_SELLER_PRODUCT:
      return {
        ...state,
        product: action.payload,
      };
    case ActionType.GET_SELLER_WALLET:
      return {
        ...state,
        sellerWallet: action.payload,
      };
    case ActionType.GET_SELLER_TRANSITION:
      console.log("action.payload-SELLER TRANSITION", action.payload);
      
      return {
        ...state,
        sellerTransition: action.payload.data,
        sellerTransitionTotal: action.payload.total,
      };
    case ActionType.GET_SELLER_ORDER:
      return {
        ...state,
        sellerOrder: action.payload.orders,
        total: action.payload.total,
      };
    case ActionType.GET_SELLER_ORDER_DETAIL:
      return {
        ...state,
        sellerOrderDetail: action.payload,
      };
    case ActionType.GET_LIVE_SELLER:
      return {
        ...state,
        liveSeller: action.payload,

      };
    // case ActionType.GET_LIVE_SELLER_PRODUCT:

    //   return {
    //     ...state,
    //     liveProduct: action.payload,
    //   };

    //   case ActionType.CLEAR_LIVE_SELLER:
    //   return {
    //     ...state,
    //     liveProduct: [],
    //   }

    case ActionType.GET_LIVE_SELLER_PRODUCT_REQUEST:
      return { ...state, loadingLiveProduct: true };
    case ActionType.GET_LIVE_SELLER_PRODUCT_SUCCESS:
      console.log("action.payload--LIVE-SELLER", action.payload);
      
      return { ...state, loadingLiveProduct: false, liveProduct: action.payload };
    case ActionType.GET_LIVE_SELLER_PRODUCT_FAILURE:
      return { ...state, loadingLiveProduct: false };
    case ActionType.CLEAR_LIVE_SELLER:
      return { ...state, liveProduct: [] };
    default:
      return state;
  }
};
