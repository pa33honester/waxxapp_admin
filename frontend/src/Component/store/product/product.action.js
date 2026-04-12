import { apiInstanceFetch } from "../../../util/api";
import axios from "axios";
import * as ActionType from "./product.type";
import { setToast } from "../../../util/toast";;

// GET ALL PRODUCT

export const getProduct = (start, limit) => (dispatch) => {
  apiInstanceFetch
    .get(`product/getRealProducts?start=${start}&limit=${limit}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_REAL_PRODUCT,
        payload: res,
        totalProduct: res.totalProducts,
      });
    })
    .catch((error) => console.error(error));
};
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
export const createProduct = (formData) => (dispatch) => {
  axios
    .post(`product/createProductByAdmin`, formData)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.CREATE_PRODUCT,
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

export const updateProduct =
  (formData, id, sellerId, productCode) => (dispatch) => {
    
    axios
      .patch(
        `product/update?productId=${id}&sellerId=${sellerId}&productCode=${productCode}`,
        formData
      )
      .then((res) => {
        if (res.data.status) {
          dispatch({
            type: ActionType.UPDATE_PRODUCT,
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

export const deleteProduct = (id) => (dispatch) => {
  axios
    .delete(`product/delete?productId=${id}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.DELETE_PRODUCT,
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

export const NewCollection = (product, collection) => (dispatch) => {
  axios
    .patch(`product/isNewCollection?productId=${product}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.PRODUCT_NEW_COLLECTION,
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

export const outOfStock = (product, stock) => (dispatch) => {
  axios
    .patch(`product/isOutOfStock?productId=${product}`)
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.PRODUCT_OUT_OF_STOCK,
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
        type: ActionType.PRODUCT_DETAIL,
        payload: res.product,
      });
    })
    .catch((error) => console.error(error));
};

// PRODUCT_REVIEW

export const getProductReview = (id, start, limit) => (dispatch) => {
  apiInstanceFetch
    .get(`review/getreview?productId=${id}&start=${start}&limit=${limit}`)
    .then((res) => {
      dispatch({
        type: ActionType.PRODUCT_REVIEW,
        payload: res.reviews,
      });
    })
    .catch((error) => console.error(error));
};

// get Product request
export const getProductRequest = (status) => (dispatch) => {
  apiInstanceFetch
    .get(`product/createProductRequestStatusWise?status=${status}`)
    .then((res) => {
      dispatch({
        type: ActionType.PRODUCT_REQUEST,
        payload: res.products,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

export const productAction = (productId, type) => (dispatch) => {
  axios
    .patch(`product/acceptCreateRequest?productId=${productId}&type=${type}`)
    .then((res) => {
      if (res.status) {
        dispatch({
          type: ActionType.PRODUCT_REQUEST_ACTION,
          payload: productId,
        });
        type === "Approved"
          ? setToast("success", "Product Request Accepted")
          : setToast("success", "Product Request Decline");
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
// get Product request
export const getUpdateProductRequest = (status) => (dispatch) => {
  apiInstanceFetch
    .get(`productRequest/updateProductRequestStatusWise?status=${status}`)
    .then((res) => {
      dispatch({
        type: ActionType.GET_UPDATE_PRODUCT_REQUEST,
        payload: res.productRequests,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

export const updateProductAction = (productId, type) => (dispatch) => {
  axios
    .patch(
      `productRequest/acceptUpdateRequest?requestId=${productId}&type=${type}`
    )
    .then((res) => {
      if (res.status) {
        dispatch({
          type: ActionType.PRODUCT_REQUEST_ACTION,
          payload: productId,
        });
        type === "Approved"
          ? setToast("success", "Product Request Accepted")
          : setToast("success", "Product Request Decline");
      }
    })
    .catch((error) => {
      console.log(error);
    });
};
