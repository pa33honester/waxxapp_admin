import * as ActionType from "./dashboard.type";
import { apiInstanceFetch } from "../../../util/api";
import { setToast } from "../../../util/toast";

export const getDashboard = () => (dispatch) => {
  apiInstanceFetch
    .get(`dashboard`)
    .then((res) => {
      
      if (res.status) {
        
        dispatch({
          type: ActionType.GET_DASHBOARD,
          payload: res.dashboard,
        });
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => console.error(error));
};

export const getUser = (startDate,endDate) => (dispatch) => {
  
  apiInstanceFetch
    .get(`dashboard/analyticOfUsers?startDate=${startDate}&endDate=${endDate}`)
    .then((res) => {
      if (res.status) {
        
        dispatch({
          type: ActionType.GET_USER,
          payload: res.users,
        });
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => console.error(error));
};
export const getUserChart = (startDate,endDate) => (dispatch) => {
  apiInstanceFetch
    .get(`dashboard/chartAnalyticOfUsers?startDate=${startDate}&endDate=${endDate}`)
    .then((res) => {
      
      if (res.status) {
        
        dispatch({
          type: ActionType.GET_USER_CHART,
          payload: res.chartAnalyticOfUsers,
        });
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => console.error(error));
};


export const getRevenueChart = (startDate,endDate) => (dispatch) => {
  apiInstanceFetch
    .get(`dashboard/revenueAnalyticsChartData?startDate=${startDate}&endDate=${endDate}`)
    .then((res) => {

      
      if (res.status) {
        
        dispatch({
          type: ActionType.GET_REVENUE_CHART,
          payload: { total: res.totalCommission, withCom: res.totalEarningWithCommission,withOut : res.totalEarningWithoutCommission },
        });
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => console.error(error));
};
export const getOrder = (startDate,endDate) => (dispatch) => {
  

  apiInstanceFetch
    .get(`dashboard/analyticOfOrders?startDate=${startDate}&endDate=${endDate}`)
    .then((res) => {
      
      if (res.status) {
        
        dispatch({
          type: ActionType.GET_ORDER,
          payload: res.orders,
        });
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => console.error(error));
};


export const getTopSellingProduct = () => (dispatch) => {
  apiInstanceFetch
    .get(`product/topSellingProducts`)
    .then((res) => {
      if (res.status) {
        dispatch({
          type: ActionType.GET_TOP_PRODUCT,
          payload: res.products,
        });
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => console.error(error));
};
export const getTopSellingSeller = () => (dispatch) => {
  apiInstanceFetch
    .get(`seller/topSellers`)
    .then((res) => {
      if (res.status) {
        dispatch({
          type: ActionType.GET_TOP_SELLER,
          payload: res.topSellers,
        });
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => console.error(error));
};
export const getTopUser = () => (dispatch) => {
  apiInstanceFetch
    .get(`user/topCustomers`)
    .then((res) => {
      if (res.status) {
        dispatch({
          type: ActionType.GET_TOP_USER,
          payload: res.topCustomers,
        });
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => console.error(error));
};

export const getPopularProduct = () => (dispatch) => {
  apiInstanceFetch
    .get(`product/popularProducts`)
    .then((res) => {
      if (res.status) {
        dispatch({
          type: ActionType.GET_POPULAR_PRODUCT,
          payload: res.popularProducts,
        });
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => console.error(error));
};

export const getRecenetOrder = () => (dispatch) => {
  apiInstanceFetch
    .get(`order/recentOrders`)
    .then((res) => {
      if (res.status) {
        dispatch({
          type: ActionType.GET_RECENT_ORDER,
          payload: res.orders,
        });
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => console.error(error));
};
