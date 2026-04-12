
import * as ActionType from "./faq.type";

const initialState = {
  FaQ: [],     
};

export const FaQReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_FAQ:
      return {
        ...state,
        FaQ: action.payload,
      };
    case ActionType.CREATE_FAQ:
      let data = [...state.FaQ];
      data.unshift(action.payload);
      return {
        ...state,
        FaQ: data,
      };
      case ActionType.UPDATE_FAQ:
        return {
          ...state,
          FaQ: state.FaQ.map((data) =>
            data._id === action.payload.id ? action.payload.data : data
          ),
        };
      case ActionType.DELETE_FAQ:
        return {
          ...state,
          FaQ: state.FaQ.filter(
            (data) => data._id !== action.payload && data
          ),
        };
    default:
      return state;
  }
};
