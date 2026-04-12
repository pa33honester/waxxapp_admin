import {
  CLOSE_LOADER,
  LOADER_OPEN,
} from "../Component/store/dialogue/dialogue.type";
import { baseURL, apiBase, secretKey } from "./config";
import store from "../Component/store/Provider";
import { token } from "../Component/Pages/Admin";
import axios from "axios";

export const openSpinner = () => {
  return store.dispatch({ type: LOADER_OPEN });
};

export const closeSpinner = () => {
  return store.dispatch({ type: CLOSE_LOADER });
};
function handleErrors(response) {
    // if (response.status === 500) {
  //   sessionStorage.clear();
  //   localStorage.clear();
  //   axios.defaults.headers.common["key"] = "";
  //   axios.defaults.headers.common["Authorization"] = "";
  //   window.location.href = "/";
  // }
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response?.status}`);
  }
  return response.json();
}
export const apiInstanceFetch = {
  baseURL: baseURL, // use proxied API path for fetch calls
  headers: {
    "Content-Type": "application/json",
    key: `${secretKey}`,
  },
  get: async (url) => {
    openSpinner();
    return fetch(`${apiInstanceFetch?.baseURL}${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        key: `${secretKey}`,
        Authorization: `${sessionStorage.getItem("token")}`, // dynamically fetch the token from sessionStorage
      },
    })
      .then(handleErrors)
      .finally(() => closeSpinner());
  },

  post: (url, data) => {
    openSpinner();
    return fetch(`${apiInstanceFetch.baseURL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        key: `${secretKey}`,
        Authorization: `${sessionStorage.getItem("token")}`, // dynamically fetch the token from sessionStorage
      },
      body: data,
    })
      .then(handleErrors)
      .finally(() => closeSpinner());
  },

  patch: (url, data) => {
    openSpinner();
    return fetch(`${apiInstanceFetch.baseURL}${url}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        key: `${secretKey}`,
        Authorization: `${sessionStorage.getItem("token")}`, // dynamically fetch the token from sessionStorage
      },
      body: JSON.stringify(data),
    })
      .then(handleErrors)
      .finally(() => closeSpinner());
  },

  put: (url, data) => {
    openSpinner();
    return fetch(`${apiInstanceFetch.baseURL}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        key: `${secretKey}`,
        Authorization: `${sessionStorage.getItem("token")}`, // dynamically fetch the token from sessionStorage
      },
      body: JSON.stringify(data),
    })
      .then(handleErrors)
      .finally(() => closeSpinner());
  },

  delete: (url) => {
    openSpinner();
    return fetch(`${apiInstanceFetch.baseURL}${url}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        key: `${secretKey}`,
        Authorization: `${sessionStorage.getItem("token")}`, // dynamically fetch the token from sessionStorage
      },
    })
      .then(handleErrors)
      .finally(() => closeSpinner());
  },
};
