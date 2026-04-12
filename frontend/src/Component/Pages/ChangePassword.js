import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { resetPassword } from "../store/admin/admin.action";
import { useParams } from "react-router-dom";
import Input from "../extra/Input";
import Button from "../extra/Button";

const ChangePassword = () => {
  const dispatch = useDispatch();

  const searchParams = new URLSearchParams(window.location.search);

  const adminId = searchParams.get("id");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleChangePassword = () => {
    if (!newPassword || !confirmPassword || newPassword !== confirmPassword) {
      let error = {};

      if (!newPassword) error.newPassword = "New Password Is Required !";

      if (!confirmPassword)
        error.confirmPassword = "Confirm Password Is Required !";
      if (newPassword !== confirmPassword)
        error.confirmPassword =
          "New Password and Confirm Password doesn't match";
      return setError({ ...error });
    } else {
      let data = {
        confirmPassword: confirmPassword,
        newPassword: newPassword,
      };
      dispatch(resetPassword(adminId, data));
    }
  };

  return (
    <>
      <div className="mainLoginPage">
        <div className="loginDiv">
          <div className="row">
            <div
              className="col-xl-6 d-xxl-block d-xl-block d-none  boxCenter"
              style={{ background: "#b93160" }}
            >
              <div
                className="p-5"
                style={{
                  background: "#b93160",
                }}
              >
                <img
                  className="img-fluid"
                  src={require("../../assets/images/Group 2033 1.png")}
                  alt=""
                  srcset=""
                />
              </div>
            </div>
            <div className="col-xl-6 col-md-12 boxCenter">
              <div className="loginDiv2">
                <div className="loginPage pt-3">
                  <div className="my-4">
                    <div className="loginLogo  me-3 pt-1 pe-1">
                      <img
                        src={require("../../assets/images/Frame 162747.png")}
                        alt=""
                        width={"80px"}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "16px",
                      fontWeight: "400",
                      lineHeight: "22px",
                      letterSpacing: "0.48px",
                    }}
                    className=""
                  >
                    <p className="fw-bold">
                      If you have forgotten your password you can reset it here!
                    </p>
                  </div>

                  <div className="loginInput">
                    <Input
                      label={`New Password`}
                      id={`New Password`}
                      type={`password`}
                      errorMessage={error.newPassword && error.newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            newPassword: `New Password Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            newPassword: "",
                          });
                        }
                      }}
                    />

                    <Input
                      label={`Confirm Password`}
                      id={`Confirm Password`}
                      type={`password`}
                      errorMessage={
                        error.confirmPassword && error.confirmPassword
                      }
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            confirmPassword: `Confirm Password Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            confirmPassword: "",
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="loginButton boxCenter mt-5">
                    <Button
                      newClass={`whiteFont ms-3`}
                      btnColor={`btnBlackPrime`}
                      style={{
                        borderRadius: "20px",
                        width: "170px",
                        height: "46px",
                      }}
                      btnName={`Submit`}
                      onClick={handleChangePassword}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ChangePassword;
