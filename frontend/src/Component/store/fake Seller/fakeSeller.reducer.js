import * as ActionType from "./fakeSeller.type";

const initialState = {
  fakeSeller: [],
  fakeProduct: [],
  totalSellers: 0,
};

export const fakeSellerReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_FAKE_SELLER:
      return {
        ...state,
        fakeSeller: action.payload,
        totalSellers: action.totalSellers,
      };
    case ActionType.GET_FAKE_SELLER_NAME:
      return {
        ...state,
        fakeSeller: action.payload,

      };

    case ActionType.GET_PRODUCTS:

      return {
        ...state,
        fakeProduct: action.payload,
        totalSellers: action.totalSellers,
      };

    case ActionType.IS_LIVE_SELLER:
      return {
        ...state,
        fakeSeller: state.fakeSeller.map((sellerLive) => {
          if (sellerLive._id === action?.payload?.id) {

            // Update the seller's `isLive` status
            return {
              ...sellerLive,
              isLive: action.payload.data.isLive,
              selectedProducts: action.payload.data.selectedProducts  
            };
          } else {
            return sellerLive;
          }
        }),
      };

    case ActionType.IS_OFFLINE:
      
      return {
        ...state,
        fakeSeller: state.fakeSeller.map((sellerLive) => {
          if (sellerLive._id === action.payload.id) {

            // Update the seller's `isLive` status
            return {
              ...sellerLive,
              isLive: action.payload.data.isLive,  // Update the `isLive` field
            };
          } else {
            return sellerLive;
          }
        }),
      };


    case ActionType.CREATE_FAKE_SELLER:
      let data = [...state.fakeSeller];
      data.unshift(action.payload);

      return {
        ...state,
        fakeSeller: data,
      };
    case ActionType.UPDATE_FAKE_SELLER:
      return {
        ...state,
        fakeSeller: state.fakeSeller.map((data) =>
          data._id === action.payload.updateSeller._id
            ? action.payload.updateSeller
            : data
        ),
      };
    case ActionType.DELETE_FAKE_SELLER:
      return {
        ...state,
        fakeSeller: state.fakeSeller.filter(
          (data) => data._id !== action.payload && data
        ),
      };
    case ActionType.ISLIVE_FAKE_SELLER:
      return {
        ...state,
        fakeSeller: state.fakeSeller.map((sellerLive) => {
          if (sellerLive._id === action.payload.id) return action.payload.data;
          else return sellerLive;
        }),
      };

    default:
      return state;
  }
};
