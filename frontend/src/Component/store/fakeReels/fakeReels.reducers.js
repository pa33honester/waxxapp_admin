import * as ActionType from "./fakeReels.type";

const initialState = {
  fakeReels: [],
  totalReels: 0,
};

export const fakeReelsReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_FAKE_REELS:
      return {
        ...state,
        fakeReels: action.payload,
        totalReels: action.totalReels,
      };
    // case ActionType.CREATE_FAKE_REELS:
    //   const transformedData = {
    //     video: action.payload.video,
    //     thumbnail: action.payload.thumbnail,
    //     sellerId: {
    //       firstName: action.payload.sellerId.firstName,
    //       lastName: action.payload.sellerId.firstName,
    //     },
    //     like: action.payload.like,
    //     comment: action.payload.comment,
    //     createdAt: action.payload.createdAt,
    //   };

    //   return {
    //     ...state,
    //     fakeReels: [transformedData, ...state.fakeReels],
    //   };

    case ActionType.CREATE_FAKE_REELS:
      return {
        ...state,
        fakeReels: [action.payload, ...state.fakeReels],
      };

    case ActionType.UPDATE_FAKE_REEL:
      
      return {
        ...state,
        fakeReels: state.fakeReels.map((data) =>
          data?._id === action?.payload?.data?._id
            ? action.payload.data
            : data
        ),
      };
    case ActionType.DELETE_FAKE_REELS:
      return {
        ...state,
        fakeReels: state.fakeReels.filter(
          (data) => data._id !== action.payload && data
        ),
      };
    default:
      return state;
  }
};
