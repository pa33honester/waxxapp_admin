import * as ActionType from "./dialogue.type";
const initialState = {
  dialogue: false,
  dialogueType: "",
  dialogueData: null,
  extraData: null,
  isLoading: false,
};

export const dialogueReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.OPEN_DIALOGUE:
      
      return {
        ...state,
        dialogue: true,
        dialogueType: action.payload.type || "",
        dialogueData: action.payload.data || null,
        extraData: action.payload.extraData || null,
      };
    case ActionType.CLOSE_DIALOGUE:
      return {
        ...state,
        dialogue: false,
        dialogueType: "",
        dialogueData: null,
        extraData: null,
      };
    case ActionType.LOADER_OPEN:
      return {
        ...state,
        isLoading: true,
      };
    case ActionType.CLOSE_LOADER:
      return {
        ...state,
        isLoading: false,
      };

    default:
      return state;
  }
};
