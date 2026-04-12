import * as ActionType from "./videoReport.type";

const initialState = {
    videoReport: [],
    totalReportReels: 0,
};


export const videoReportReducer = (state = initialState, action) => {
    switch (action.type) {
        case ActionType.GET_VIDEO_REPORT:
            console.log("action.payload", action.payload);
            
            return {
                ...state,
                videoReport: action.payload.reportOfReels,
                totalReportReels: action.payload.totalReportOfReels,
            };


        case ActionType.DELETE_VIDEO_REPORT:
            return {
                ...state,
                videoReport: state.videoReport.filter(
                    (data) => data._id !== action.payload
                ),
            };

        case ActionType.UPDATE_VIDEO_REPORT:
            return {
                ...state,
                videoReport: state.videoReport.filter((redeem) => redeem._id !== action?.payload),
            };

        default:
            return state;
    }
};