
import * as ActionType from "./user.type";

const initialState = {
  user: [],
  totalUser: 0,
  totalOrder : 0,
};

export const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_USER:
      return {
        ...state,
        user: action.payload.data,
        totalUser: action.payload.totalUser,
      };
    case ActionType.GET_USER_PROFILE:
      return {
        ...state,
        userProfile: action.payload,
      };
    case ActionType.BLOCK_UNBLOCK_USER:
      return {
        ...state,
        user: state.user.map((userBlock) => {
          if (userBlock._id === action.payload.id) return action.payload.data;
          else return userBlock;
        }),
        userProfile: action.payload.data,
      };
      case ActionType.GET_USER_ORDER: 
      
      return{
        ...state,
        order : action.payload,
        totalOrder: action.totalOrder
      }
    default:
      return state;
  }
};
