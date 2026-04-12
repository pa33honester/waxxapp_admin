import * as ActionType from "./bank.type";
const initialState = {
  bank: [],
};
export const bankReducer = (state = initialState, action) => {
  switch (action.type) {
    case ActionType.GET_BANK:
      return {
        ...state,
        bank: action.payload,
      };

    case ActionType.CREATE_BANK:
      let data = [...state.bank];
      data.unshift(action.payload);
      return {
        ...state,
        bank: data,
      };
    case ActionType.UPDATE_BANK:
      return {
        ...state,
        bank: state.bank.map((data) =>
          data._id === action.payload.id ? action.payload.data : data
        ),
      };

    case ActionType.DELETE_BANK:
      return {
        ...state,
        bank: state.bank.filter(
          (userBlock) => userBlock._id !== action.payload.id
        ),
      };
    default:
      return state;
  }
};
