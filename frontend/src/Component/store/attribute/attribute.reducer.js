import { useEffect } from "react";
import * as ActionType from "./attribute.type";
const initialState = {
  attribute: [],
  subcategory: [],
  // attributeType: [],

};


export const attributeReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_ATTRIBUTE:

      return {
        ...state,
        attribute: action.payload,
      };
    case ActionType.GET_TYPE_ATTRIBUTE:
      return {
        ...state,
        attributeType: action.payload,
      };

    case ActionType.CREATE_ATTRIBUTE:

      // let data = [...state.attribute];
      // data.unshift(action.payload);
      return {
        ...state,
        attribute: action.payload,
      };
    case ActionType.UPDATE_ATTRIBUTE:
      return {
        ...state,
        attribute: state.attribute.map((data) => {
          const attribute = data?.attributes?.[0];
          if (attribute?._id === action.payload?.attributes?.[0]?._id) {
            return { ...data, attributes: [action.payload.attributes[0]] };
          }
          return data;
        }),
      };

    case ActionType.DELETE_ATTRIBUTE:
      return {
        ...state,
        attribute: state.attribute.filter(
          (data) => data._id !== action.payload && data
        ),
      };

    case ActionType.GET_SUBCATEGORY:

      return {
        ...state,
        subcategory: action.payload,
      };

    case ActionType.CLEAN_DATA:
      return {
        ...state,
        subcategory: action.payload, // yaha payload empty array milega to subcategory clear hoga
      };

    default:
      return state;
  }
};
