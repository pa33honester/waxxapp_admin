import { apiInstanceFetch } from "../../../util/api";
import * as ActionType from "./attribute.type"; 
import axios from "axios";
import { setToast } from "../../../util/toast";;
// get attributes
export const getAttribute = ({subCategoryId , fieldType}) => (dispatch) => {
  apiInstanceFetch
    .get(`attributes/listAllAttributes?subCategoryId=${subCategoryId}&fieldType=${fieldType}`)
    .then((res) => {
      
      dispatch({ type: ActionType.GET_ATTRIBUTE, payload: res.attributes });
    })
    .catch((error) => console.log(error.message));
};

// get attribute type wise
export const getAttributeType = (type) => (dispatch) => {
  apiInstanceFetch
    .get(`attributes/typeWise?type=${type}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_TYPE_ATTRIBUTE,
        payload: res.attributes,
      });
    })
    .catch((error) => console.log(error.message));
};

// create attributes

export const createAttribute = (data) => (dispatch) => {
  axios
    .post(`attributes/insertAttributes`, data)
    .then((res) => {
      
      
      if (res.data.status) {
        
        dispatch({
          type: ActionType.CREATE_ATTRIBUTE,
          payload: res.data.attributes,
        });
        setToast("success", "attributes created successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log(error.message));
};

// edit attributes

export const updateAttribute = (data) => (dispatch) => {
  
  axios
    .patch(`attributes/updateAttributes`, data)
    .then((res) => {

      if (res.status) {
        dispatch({
          type: ActionType.UPDATE_ATTRIBUTE,
          payload: res.data.existingAttr,
        });
        setToast("success", "attributes update successfully");
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => console.log(error.message));
};

// delete attributes

export const deleteAttribute = (data) => (dispatch) => {
  apiInstanceFetch
    .delete(`attributes/destroyAttribute?attributeId=${data}`)
    .then((res) => {
      if (res.status) {
        dispatch({
          type: ActionType.DELETE_ATTRIBUTE,
          payload: data,
        });
        setToast("success", "attributes Delete successfully");
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => console.log(error.message));
};


export const getAllSubcategory = () => (dispatch) => {
  apiInstanceFetch
    .get(`subCategory/fetchActiveSubCategories`)
    .then((res) => {
      
      dispatch({ type: ActionType.GET_SUBCATEGORY, payload: res.subCategories });
    })
    .catch((error) => console.log(error.message));
};
