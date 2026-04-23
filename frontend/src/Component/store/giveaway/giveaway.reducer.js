import * as ActionType from "./giveaway.type";

const initialState = {
  giveaways: [],
};

export const giveawayReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_GIVEAWAYS:
      return { ...state, giveaways: action.payload };
    case ActionType.CANCEL_GIVEAWAY:
      return {
        ...state,
        giveaways: state.giveaways.map((g) =>
          g._id === action.payload ? { ...g, status: 4 } : g
        ),
      };
    default:
      return state;
  }
};
