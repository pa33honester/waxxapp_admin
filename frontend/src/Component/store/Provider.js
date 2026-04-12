import { createStore, compose, applyMiddleware } from "redux";
import thunkMiddleware from "redux-thunk";
import rootReducer from "./index";

// Conditionally load Redux DevTools Extension
const composeEnhancer =
  process.env.NODE_ENV === "development" &&
  typeof window === "object" &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

// Create the store
const store = createStore(
  rootReducer,
  composeEnhancer(applyMiddleware(thunkMiddleware))
);

export default store;