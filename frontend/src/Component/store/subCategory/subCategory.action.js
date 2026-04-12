import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./subCategory.type";
import { setToast } from "../../../util/toast";

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

// category wise sub category
export const getCategoryWiseSubCategory = (categoryId) => (dispatch) => {
  apiInstanceFetch
    .get(`subCategory/categoryWiseSubCategory?categoryId=${categoryId}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_CATEGORY_WISE_SUBCATEGORY,
        payload: res.data,
      });
    })
    .catch((error) => console.error(error));
};
// CREATE_CATEGORY
export const createSubCategory = (formData) => (dispatch) => {
  axios
    .post(`subCategory/create`, formData)
    .then((res) => {
      ;
      if (res.data.status) {
        dispatch({
          type: ActionType.CREATE_SUB_CATEGORY,
          payload: res.data.subCategory,
        });
        setToast("success", "subCategory Create successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

// UPDATE_CATEGORY

export const updateSubCategory = (formData, id) => (dispatch) => {
  axios
    .patch(`subCategory/update?subCategoryId=${id}`, formData)
    .then((res) => {
      
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_SUB_CATEGORY,
          payload: { data: res.data.subCategory, id },
        });
        setToast("success", "subCategory update successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

// DELETE_CATEGORY

export const deleteSubCategory = (id) => (dispatch) => {
  axios
    .delete(`subCategory/delete?subCategoryId=${id}`)
    .then((res) => {
      
      if (res?.data?.status) {
        dispatch({
          type: ActionType.DELETE_SUB_CATEGORY,
          payload: id,
        });
        setToast("success", "subCategory Delete successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};
