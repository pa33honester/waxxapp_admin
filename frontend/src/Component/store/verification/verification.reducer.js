import * as ActionType from "./verification.type";

const initialState = {
  queue: [],
  total: 0,
};

export const verificationReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_VERIFICATION_QUEUE:
      return {
        ...state,
        queue: action.payload.items,
        total: action.payload.total,
      };
    case ActionType.REVIEW_VERIFICATION:
      // Drop the reviewed item from the visible queue. The backend
      // status is now `verified` or `rejected` (no longer in the
      // default `pending_review` filter); the next refresh will
      // also re-pull but optimistic remove keeps the UI snappy.
      return {
        ...state,
        queue: state.queue.filter((v) => v._id !== action.payload.verificationId),
      };
    default:
      return state;
  }
};
