import { useEffect, useState } from "react";
import Button from "../extra/Button";
import Input from "../extra/Input";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../store/admin/admin.action";
import { connect, useSelector } from "react-redux";
import EraShop from "../../assets/images/EraShopImage.png"
import loginlogo2 from "../../assets/images/loginlogo2.png"

const Login = (props) => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = () => {
    if (!email || !password) {
      let error = {};
      if (!email) error.email = "Email Is Required !";
      if (!password) error.password = "password is required !";
      return setError({ ...error });
    } else {
      let login = {
        email,
        password,
      };

      props.loginAdmin(login, navigate);
    }
  };

  return (
    <>
      <div className="mainLoginPage">
        <div className="loginDiv">
          <div className="row">
            <div
              className="col-xl-6 d-xxl-block d-xl-block d-none boxCenter p-5"
            style={{ background: "#B93160" }}
            >
                <img
                  className="img-fluid"
                  src={EraShop}
                  alt="text logo"
                  srcset=""
                />
                <img className="img-fluid"
                src={loginlogo2}
                alt="login logo" />
            </div>
            <div className="col-xl-6 col-md-12 boxCenter"
              style={{
                background: "#FEFEFE"
              }}
            >
              <div className="loginDiv2">
                <div className="loginPage pt-3">
                  <div className="my-4">
                    <div className="loginLogo me-3 pt-1 pe-1">
                      <img
                        src={require("../../assets/images/Eralogo22.png")}
                        alt=""
                        width={"80px"}
                      />
                    </div>
                  </div>
                  <div
                    style={{
                      color: "#000",
                      fontSize: "16px",
                      fontWeight: "400",
                      lineHeight: "22px",
                      letterSpacing: "0.48px",
                    }}
                    className=""
                  >
                    <p>Welcome back !!!</p>
                  </div>
                  <div className=" mb-3">
                    <h3
                      className="fw-bold text-dark"
                      style={{ fontSize: "56px", fontWeight: "600" }}
                    >
                      Log In
                    </h3>
                  </div>
                  <div className="loginInput">
                    <Input
                      label={`Email`}
                      id={`loginEmail`}
                      type={`email`}
                      value={email}
                      style={{ background: "rgba(185, 49, 96, 0.11)" }}
                      errorMessage={error.email && error.email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            email: `Email Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            email: "",
                          });
                        }
                      }}
                    />

                    <Input
                      label={`Password`}
                      id={`loginPassword`}
                      type={`password`}
                      value={password}
                      errorMessage={error.password && error.password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            password: `Password Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            password: "",
                          });
                        }
                      }}
                    />
                  </div>

                  <span className="d-flex align-items-center justify-content-end fw-semibold pdlogin">
                    <a href="/forgotPassword" style={{ color: "#7E7E7E " }}>
                      Forgot password?
                    </a>
                  </span>

                  <div className="loginButton mt-5">
                  
                    <Button
                      newClass={`blackFont ms-3`}
                      btnColor={`btnBlackPrime`}
                      style={{
                      
                        borderRadius: "20px",
                        width: "170px",
                        height: "46px",
                        color:"#fff"
                      }}
                      btnName={`Log In`}
                      onClick={handleSubmit}
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

export default connect(null, { loginAdmin })(Login);

{
  /*  */
}
