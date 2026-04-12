import * as ActionType from "./withdraw.type";
const initialState = {
  withdraw: [],
  
};
export const withdrawReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_WITHDRAW:
      return {
        ...state,
        withdraw: action.payload,
      };
   
    case ActionType.CREATE_WITHDRAW:
      let data = [...state.withdraw];
      data.unshift(action.payload);
      return {
        ...state,
        withdraw: data,
      };
    case ActionType.UPDATE_WITHDRAW:
      return {
        ...state,
        withdraw: state.withdraw.map((data) =>
          data._id === action.payload.id ? action.payload.data : data
        ),
      };
   
    case ActionType.DELETE_WITHDRAW:
     
      
      return {
        ...state,
        withdraw: state.withdraw.map((userBlock) => {
          if (userBlock._id === action.payload.id) return action.payload.data;
          else return userBlock;
        }),
       
      };
    default:
      return state;
  }
};
