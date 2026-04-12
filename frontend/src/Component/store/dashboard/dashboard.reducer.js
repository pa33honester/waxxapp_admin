
import * as ActionType from "./dashboard.type";


const initialState = {
  dashboard: [],
   user:[],
   orderData: [],
   userChart : [],
   total : [],
   withCom : [],
   withOut : [],
  userCount : []
};

export const dashboardReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_DASHBOARD:
      
      return {
        ...state,
        dashboard: action.payload,
      };
      case ActionType.GET_USER:
        
      return {
        ...state,
        userCount: action.payload,
      };
      case ActionType.GET_USER_CHART:
      return {
        ...state,
        userChart: action.payload,
      };
      case ActionType.GET_REVENUE_CHART:
      return {
        ...state,
        total: action.payload.total,
        withCom: action.payload.withCom,
        withOut: action.payload.withOut,
      };
      case ActionType.GET_ORDER:
      return {
        ...state,
        orderData: action.payload,
      };
    case ActionType.GET_TOP_PRODUCT:
      return {
        ...state,
        product: action.payload,
      };
    case ActionType.GET_TOP_SELLER:
      return {
        ...state,
        seller: action.payload,
      };
    case ActionType.GET_LIVE_SELLER:
      return {
        ...state,
        liveSeller: action.payload,
      };
    case ActionType.GET_TOP_USER:
      return {
        ...state,
        user: action.payload,
      };
    case ActionType.GET_POPULAR_PRODUCT:
      return {
        ...state,
        popularProduct: action.payload,
      };
    case ActionType.GET_RECENT_ORDER:
      return {
        ...state,
        recentOrders: action.payload,
      };
    default:
      return state;
  }
};
