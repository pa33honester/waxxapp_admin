
import * as ActionType from "./category.type";

const initialState = {
  category: [],
  subCategory: [],
};

export const categoryReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_CATEGORY:
      return {
        ...state,
        category: action.payload,
      };

    case ActionType.UPDATE_CATEGORY:
      return {
        ...state,
        category: state.category.map((data) =>
          data._id === action.payload.id ? action.payload.data : data
        ),
      };
    case ActionType.DELETE_CATEGORY:
      return {
        ...state,
        category: state.category.filter(
          (data) => data._id !== action.payload && data
        ),
      };
   
    case ActionType.CREATE_CATEGORY:
      let data = [...state.category];
      data.unshift(action.payload);
      return {
        ...state,
        category: data,
      };
   
    default:
      return state;
  }
};
