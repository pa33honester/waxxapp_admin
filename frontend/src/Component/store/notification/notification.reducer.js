import * as actionType from "./notification.type";

//Initial State
const initialState = {
  notificationDialog: {},
  notification: {},
  sellerNotification: {},
  id: null,
};

//Notification Reducer
export const notificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case actionType.SEND_SELLER_NOTIFICATION:
      ;
      return {
        ...state,

        sellerNotification: action.payload.data,
        id: action.payload.id,
      };

    case actionType.SEND_NOTIFICATION:
      
      return {
        ...state,
        notification: action.payload.data,
      };

    default:
      return state;
  }
};
