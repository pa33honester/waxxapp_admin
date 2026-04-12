
import * as ActionType from "./order.type";

const initialState = {
  order: [],
  totalOrder: 0,
};

export const orderReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_ORDER:
      return {
        ...state,
        order: action.payload.orders,
        totalOrder: action.payload.totalOrders,
      };
   
    case ActionType.UPDATE_ORDER:
      
      return {
        ...state,
        order: state.order.map((data) =>
          data._id === action.payload.updateOrder._id
            ? action.payload.updateOrder
            : data
        ),
        orderDetail: action.payload.updateOrder,
      };
    case ActionType.GET_ORDER_DETAIL:
      
      return {
        ...state,
        orderDetail: action.payload,
      };
    default:
      return state;
  }
};
