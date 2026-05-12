import * as ActionType from "./accountRequest.type";

const initialState = {
  accountRequests: [],
};

export const accountRequestReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_ACCOUNT_REQUESTS:
      return {
        ...state,
        accountRequests: action.payload,
      };
    case ActionType.APPROVE_ACCOUNT_REQUEST:
    case ActionType.REJECT_ACCOUNT_REQUEST: {
      const updated = action.payload?.request;
      if (!updated) {
        // no updated doc returned — just drop the row by id
        return {
          ...state,
          accountRequests: state.accountRequests.filter((d) => d._id !== action.payload?.id),
        };
      }
      return {
        ...state,
        accountRequests: state.accountRequests.map((d) => (d._id === updated._id ? updated : d)),
      };
    }
    case ActionType.DELETE_ACCOUNT_REQUEST:
      return {
        ...state,
        accountRequests: state.accountRequests.filter((d) => d._id !== action.payload),
      };
    default:
      return state;
  }
};
