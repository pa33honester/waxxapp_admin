import * as ActionType from "./reels.type";

const initialState = {
  reels: [],
  totalReels: 0,
  reportedReels: [],
  totalReportOfReels: 0,
  reelInfoDetails: []
};

export const reelsReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_REELS:
      
      return {
        ...state,
        reels: action.payload,
        totalReels: action.totalReels,
      };

    case ActionType.DELETE_REELS:
      return {
        ...state,
        reels: state.reels.filter(
          (data) => data._id !== action.payload && data
        ),
      };
    case ActionType.GET_REEL_INFO:
      return {
        ...state,
        reelInfoDetails: action.payload,
      };
    case ActionType.GET_REEL_LIKE:
      return {
        ...state,
        reelLike: action.payload,
      };
    case ActionType.GET_REEL_COMMENT:
      return {
        ...state,
        reelComment: action.payload,
      };
    case ActionType.GET_REPORTED_REELS:
      
      return {
        ...state,
        reportedReels: action.payload,
        totalReportOfReels: action?.totalReportOfReels,
      };

      case ActionType.CLEAR_REELS:
      return {
        ...state,
        reelInfoDetails: [],
      }
    default:
      return state;
  }
};
