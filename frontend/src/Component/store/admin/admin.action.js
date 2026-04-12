import axios from "axios";
import * as ActionType from "./admin.type";
import { setToast } from "../../../util/toast";
import { apiInstanceFetch } from "../../../util/api";
import { secretKey } from "../../../util/config";

export const signupAdmin = (signup) => (dispatch) => {
  axios
    .post("admin/create", signup)
    .then((res) => {
      if (res.data.status) {
        dispatch({ type: ActionType.SIGNUP_ADMIN });
        setToast("success", "Signup Successfully!");
        setTimeout(() => {
          window.location.href = "/admin-login";
        }, 3000);
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => {
      setToast("error", error);
      console.log(error);
    });
};

export const updateCode = (signup) => (dispatch) => {
  axios
    .patch("admin/updateCode", signup)
    .then((res) => {
      if (res.data.status) {
        setToast("success", "Purchase Code Update Successfully !");
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => {
      setToast("error", error);
    });
};

export const loginAdmin = (login, navigate) => (dispatch) => {
  axios
    .post("admin/login", login)
    .then((res) => {
      if (res.data.status) {
        
        
        dispatch({ type: ActionType.LOGIN_ADMIN, payload: res.data.token });

        setToast("success", "Login Successfully!");
        setTimeout(() => {
          navigate("/admin");
        }, 1500)
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => {
      setToast("error", error);
    });
};

// get profile
export const getProfile = () => (dispatch) => {
  apiInstanceFetch
    .get("admin/profile")
    .then((res) => {
      dispatch({ type: ActionType.PROFILE_ADMIN, payload: res.admin });
    })
    .catch((error) => {
      console.log("error", error);
    });
};

// Update Admin profile image

export const UpdateAdminImage = (formData) => (dispatch) => {
  axios
    .patch("admin/updateImage", formData, {
      headers: {
        key: `${secretKey}`,
        Authorization: `${sessionStorage.getItem("token")}`,
      }
    })
    .then((res) => {
      if (res.data.status) {
        dispatch({
          type: ActionType.UPDATE_IMAGE_PROFILE,
          payload: res.data.admin,
        });
        setToast("success", "Image Update Successfully");
      }
    })
    .catch((error) => {
      setToast("error", error);
    });
};

export const updateProfile = (profileData) => (dispatch) => {
  
  apiInstanceFetch
    .patch("admin/updateProfile", profileData)
    .then((res) => {
      if (res.status === true) {
        dispatch({ type: ActionType.UPDATE_PROFILE, payload: res.admin });
        setToast("success", "Profile Update Successfully");
      } else {
        setToast(res.data.message);
      }
    })
    .catch(({ response }) => {
      console.log(response?.data);
    });
};

export const ChangeAdminPassword = (password) => (dispatch) => {
  apiInstanceFetch
    .patch("admin/updatePassword", password)
    .then((res) => {
      if (res.status === true) {
        setToast("success", "Your Password Changed Successfully !");
        dispatch({ type: ActionType.LOGOUT_ADMIN });
        setTimeout(() => {
          window.location.href = "/";
        }, [3000]);
      } else {
        setToast("error", res.message);
      }
    })
    .catch((error) => {
      setToast(error.message);
    });
};

export const forgotPassword = (data) => (dispatch) => {
  axios.post("admin/forgotPassword", data).then((res) => {
    if (res.data.status === true) {
      setToast("success", "Email Send Successfully !");
    } else {
      setToast("error", res.data.message);
    }
  });
};

export const resetPassword = (adminId, data) => (dispatch) => {
  axios
    .post(`admin/setPassword?adminId=${adminId}`, data)
    .then((res) => {
      if (res.data.status === true) {
        setToast("success", "Password Changed Successfully !");
        setTimeout(() => {
          dispatch({ type: ActionType.LOGOUT_ADMIN });
          window.location.href = "/";
        }, [100]);
      } else {
        setToast("error", res.data.message);
      }
    })
    .catch((error) => {
      setToast(error.message);
    });
};
