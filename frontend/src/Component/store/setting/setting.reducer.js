
import * as ActionType from "./setting.type";
const initialState = {
  setting: [],
};

export const settingReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_SETTING:
      return {
        ...state,
        setting: action.payload,
      };
    case ActionType.UPDATE_SETTING:
      return {
        ...state,

      };
    //Handle Update Switch Value
    case ActionType.HANDLE_TOGGLE_SWITCH:

      return {
        ...state,
        setting: action.payload.setting,
      };

    case ActionType.HANDLE_SELLER_TOGGLE_SWITCH:
      return {
        ...state,
        setting: action.payload.setting,
      };
    default:
      return state;
  }
};
