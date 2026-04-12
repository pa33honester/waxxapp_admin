import * as ActionType from "./promoCode.type";


const initialState = {
  promoCode: [],
};

const promoCodeReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_PROMOCODE:
      return {
        ...state,
        promoCode: action.payload,
      };
      case ActionType.CREATE_PROMOCODE:
          let data = [...state.promoCode];
          data.unshift(action.payload);
          return {
            ...state,
            promoCode: data,
          };
          case ActionType.UPDATE_PROMOCODE:
            return {
              ...state,
              promoCode: state.promoCode.map((data) =>
                data._id === action.payload.id ? action.payload.data : data
              ),
            };
          case ActionType.DELETE_PROMOCODE:
            return {
              ...state,
              promoCode: state.promoCode.filter(
                (data) => data._id !== action.payload && data
              ),
            };
    default:
      return state;
  }
};

export default promoCodeReducer;
