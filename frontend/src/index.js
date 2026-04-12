import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "../src/assets/css/style.css";
import "../src/assets/css/default.css";
import "../src/assets/css/custom.css";
// import "../src/assets/js/custom"
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
// React Redux In Set Provider
import { Provider } from "react-redux";
import store from "./Component/store/Provider";

// Connect Axios
import { baseURL, apiBase, secretKey } from "./util/config";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import Loader from "./util/Loader";
import {
  CLOSE_LOADER,
  LOADER_OPEN,
} from "./Component/store/dialogue/dialogue.type";

// Default Base URL Join In Axios (use proxied API path)
axios.defaults.baseURL = baseURL;

// Default Key Join In Axios
axios.defaults.headers.common["key"] = secretKey;

axios.interceptors.request.use(
  (req) => {
    store.dispatch({ type: LOADER_OPEN });
    return req;
  },
  (error) => {
    console.log(error);
  }
);

axios.interceptors.response.use(
  (res) => {
    store.dispatch({ type: CLOSE_LOADER });
    return res;
  },
  (err) => {
    if (err.message === "Network Error") {
    }
    store.dispatch({ type: CLOSE_LOADER });
    return Promise.reject(err);
  }
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  // <React.StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <App />
        <ToastContainer />
        <Loader />
      </Provider>
    </BrowserRouter>
  // </React.StrictMode>
);

reportWebVitals();
