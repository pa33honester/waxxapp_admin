import axios from "axios";

// Set Token In Axios
export function setToken(token) {
  if (token) {
    return axios.defaults.headers.common["Authorization"] = token;
  } else {
    return delete axios.defaults.headers.common["Authorization"];
  }
}

// Set Key In Axios
export function SetDevKey(key) {
  if (key) {
    return (axios.defaults.headers.common["key"] = key);
  } else {
    return delete axios.defaults.headers.common["key"];
  }
}
