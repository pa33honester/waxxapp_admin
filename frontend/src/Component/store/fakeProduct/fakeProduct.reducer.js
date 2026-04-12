import * as ActionType from "./fakeProduct.type";

const initialState = {
  fakeProduct: [],
  productDetail: [],
  totalProduct: 0,
};

export const fakeProductReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_FAKE_PRODUCT:
      return {
        ...state,
        fakeProduct: action.payload.product,
        totalProduct: action.payload.totalProducts,
      };
    case ActionType.CREATE_FAKE_PRODUCT:
      let data = [...state.fakeProduct];
      data.unshift(action.payload);
      return {
        ...state,
        fakeProduct: data,
      };
    case ActionType.UPDATE_FAKE_PRODUCT:
      return {
        ...state,
        fakeProduct: state.fakeProduct.map((data) =>
          data._id === action.payload.id ? action.payload.data : data
        ),
      };
    case ActionType.DELETE_FAKE_PRODUCT:
      return {
        ...state,
        fakeProduct: state.fakeProduct.filter(
          (data) => data._id !== action.payload && data
        ),
      };
    case ActionType.FAKE_PRODUCT_NEW_COLLECTION:
      return {
        ...state,
        fakeProduct: state.fakeProduct.map((Collection) => {
          if (Collection?._id === action.payload?.id)
            return action.payload.data;
          else return Collection;
        }),
      };
    case ActionType.FAKE_PRODUCT_OUT_OF_STOCK:
      return {
        ...state,
        fakeProduct: state.fakeProduct.map((Stock) => {
          if (Stock?._id === action.payload.id) return action.payload.data;
          else return Stock;
        }),
        productDetail: action.payload.data,
      };
    case ActionType.FAKE_PRODUCT_DETAIL:
      return {
        ...state,
        productDetail: action.payload,
      };

    default:
      return state;
  }
};
