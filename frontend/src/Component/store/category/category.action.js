import axios from "axios";
import * as ActionType from "./category.type";
import { apiInstanceFetch } from "../../../util/api";
import { setToast } from "../../../util/toast";

export const getCategory = () => (dispatch) => {
  apiInstanceFetch
    .get(`category/getCategory`)
    .then((res) => {
      // 
      dispatch({
        type: ActionType.GET_CATEGORY,
        payload: res.category,
      });
    })
    .catch((error) => console.error(error));
};

// CREATE_CATEGORY
export const createCategory = (formData) => (dispatch) => {
  axios
    .post(`category/create`, formData)
    .then((res) => {
      
      if (res.data.status) {
        dispatch({
          type: ActionType.CREATE_CATEGORY,
          payload: res.data.category,
        });
        
        setToast("success", "Category Create successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

// UPDATE_CATEGORY

export const updateCategory = (formData, id) => (dispatch) => {
  axios
    .patch(`category/update?categoryId=${id}`, formData)
    .then((res) => {
      
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_CATEGORY,
          payload: { data: res.data.category, id },
        });
        setToast("success", "Category update successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

// DELETE_CATEGORY

export const deleteCategory = (id) => (dispatch) => {
  axios
    .delete(`category/delete?categoryId=${id}`)
    .then((res) => {
      
      if (res.data.status) {
        dispatch({
          type: ActionType.DELETE_CATEGORY,
          payload: id,
        });
        setToast("success", "Category Delete successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

// sub category

export const getSubCategory = () => (dispatch) => {
  apiInstanceFetch
    .get(`subCategory`)
    .then((res) => {
      
      dispatch({
        type: ActionType.GET_SUB_CATEGORY,
        payload: res.subCategory,
      });
    })
    .catch((error) => console.error(error));
};

