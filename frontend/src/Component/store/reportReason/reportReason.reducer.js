import * as ActionType from "./reportReason.type";

const initialState = {
    reportReason: [],
};

export const reportReasonReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionType.GET_REPORT_REASON:
            return {
                ...state,
                reportReason: action.payload,
            };

        case ActionType.CREATE_REPORT_REASON:
            let data = [...state.reportReason];
            data.push(action.payload);
            return {
                ...state,
                reportReason: data,
            };

        case ActionType.DELETE_REPORT_REASON:
            return {
                ...state,
                reportReason: state.reportReason.filter(
                    (data) => data._id !== action.payload
                ),
            };

        case ActionType.UPDATE_REPORT_REASON:
            return {
                ...state,
                reportReason: state.reportReason.map((data) =>
                    data._id === action.payload._id ? action.payload : data
                ),
            };

        default:
            return state;
    }
};
