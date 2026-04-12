import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./fakeProduct.type";
import { setToast } from "../../../util/toast";

// GET ALL PRODUCT


export const getFakeProduct = (start, limit) => (dispatch) => {
  apiInstanceFetch
    .get(`product/getFakeProducts?start=${start}&limit=${limit}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_FAKE_PRODUCT,
        payload: res,
        totalProduct: res.totalProducts,
      });
    })
    .catch((error) => console.error(error));
};

// CREATE_CATEGORY
export const createFakeProduct = (formData) => (dispatch) => {
  axios
    .post(`product/createProductByAdmin`, formData)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.CREATE_FAKE_PRODUCT,
          payload: res.data.product,
        });
        setToast("success", "Product Create successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

// UPDATE_CATEGORY

export const updateFakeProduct =
  (formData, id, sellerId, productCode) => (dispatch) => {
    
    axios
      .patch(
        `product/update?productId=${id}&sellerId=${sellerId}&productCode=${productCode}`,
        formData
      )
      .then((res) => {
        
        if (res.data.status) {
          dispatch({
            type: ActionType.UPDATE_FAKE_PRODUCT,
            payload: { data: res.data.product, id },
          });
          setToast("success", "Product update successfully");
        } else {
          setToast("error", res.data.message);
        }
      })
      .catch((error) => console.log("error", error.message));
  };

// DELETE_CATEGORY

export const deleteFakeProduct = (id) => (dispatch) => {
  axios
    .delete(`product/delete?productId=${id}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.DELETE_FAKE_PRODUCT,
          payload: id,
        });
        setToast("success", "Product Delete successfully");
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => console.log("error", error.message));
};

// PRODUCT_NEW_COLLECTION

export const FakeNewCollection = (product, collection) => (dispatch) => {
  axios
    .patch(`product/isNewCollection?productId=${product}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.FAKE_PRODUCT_NEW_COLLECTION,
          payload: { data: res.data.product, id: collection._id },
        });

        setToast(
          "success",
          `${collection?.seller?.firstName} Is ${
            res.data.product.isNewCollection == true
              ? "Add New Collection"
              : "Remove New Collection"
          } Successfully!`
        );
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error));
};

// PRODUCT_OUT OF STOCK

export const FakeOutOfStock = (product, stock) => (dispatch) => {
  axios
    .patch(`product/isOutOfStock?productId=${product}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.FAKE_PRODUCT_OUT_OF_STOCK,
          payload: { data: res.data.product, id: stock._id },
        });

        setToast(
          "success",
          `${stock?.seller?.firstName} Is ${
            stock.isOutOfStock == true
              ? "Instock Product"
              : "Out Of Stock Product"
          } Successfully!`
        );
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => setToast("error", error));
};

// PRODUCT_DETAIL

export const getProductDetail = (id) => (dispatch) => {
  apiInstanceFetch
    .get(`product/productDetailsForAdmin?productId=${id}`)
    .then((res) => {
      dispatch({
        type: ActionType.FAKE_PRODUCT_DETAIL,
        payload: res.product,
      });
    })
    .catch((error) => console.error(error));
};

// PRODUCT_REVIEW

export const getFakeProductReview = (id, start, limit) => (dispatch) => {
  apiInstanceFetch
    .get(`review/getreview?productId=${id}&start=${start}&limit=${limit}`)
    .then((res) => {
      dispatch({
        type: ActionType.FAKE_PRODUCT_REVIEW,
        payload: res.reviews,
      });
    })
    .catch((error) => console.error(error));
};

