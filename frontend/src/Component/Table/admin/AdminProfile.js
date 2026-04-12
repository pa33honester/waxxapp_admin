import React, { useState, useEffect } from "react";
import Input from "../../extra/Input";
import Button from "../../extra/Button";
import { useDispatch, useSelector } from "react-redux";
import {
  getProfile,
  UpdateAdminImage,
  ChangeAdminPassword,
  updateProfile,
} from "../../store/admin/admin.action";
import { setToast } from "../../../util/toast";
import defaultImage from "../../../assets/images/default.jpg";

const AdminProfile = () => {
  const admin = useSelector((state) => state.admin.admin);

  const dispatch = useDispatch();

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [image, setImage] = useState(null);

  const [imagePath, setImagePath] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  const [error, setError] = useState({
    name: "",
    email: "",
    password: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });


  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    setName(admin?.name);
    setEmail(admin?.email);
    setImagePath(admin?.image);
    setError({ name: "", email: "" });

    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }, [admin]);


  const handleSubmitEmail = () => {
    if (!name || !email) {
      let error = {};
      if (!name) error.name = "Name is required !";
      if (!email) error.email = "Email is required !";
      return setError({ ...error });
    } else {
      let data = { name, email };
      dispatch(updateProfile(data));
    }
  };

  const handleChangePassword = () => {
    if (
      !oldPassword ||
      !newPassword ||
      oldPassword === newPassword ||
      !confirmPassword ||
      newPassword !== confirmPassword
    ) {
      let error = {};
      if (!oldPassword) error.oldPassword = "Old Password Is Required!";
      if (!newPassword) error.newPassword = "New Password Is Required !";
      if (oldPassword === newPassword)
        error.newPassword = "New Password can't be same As Old Password !";
      if (!confirmPassword)
        error.confirmPassword = "Confirm Password Is Required !";
      if (newPassword !== confirmPassword)
        error.confirmPassword = "New Password and Confirm Password doesn't match";
      return setError({ ...error });
    } else {
      let data = {
        oldPass: oldPassword,
        confirmPass: confirmPassword,
        newPass: newPassword,
      };
      dispatch(ChangeAdminPassword(data));
    }
  };

  const handleUploadImage = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    setImage(selectedFile);
    setImagePath(URL.createObjectURL(selectedFile));
  };

  const handleChangeImage = () => {
    if (!image) return setToast("error", "Please select an image");
    const formData = new FormData();
    formData.append("image", image);
    dispatch(UpdateAdminImage(formData));
  };

  const handlePrevious = (url) => window.open(url, "_blank");

  return (
    <div className="mainAdminTable">
      <div className="adminTable">
        <div className="col-12 headname text-uppercase">Admin</div>
        <div className="userMain">
          <div style={{ margin: "10px 28px" }}>
            <div className="row">

              {/* Left Panel */}
              <div className="col-4 mt-2" >
                <div className="card  text-center gap-1" style={{ borderRadius: "5px", minHeight: "33vh", padding: "35px" }}>
                  <input
                    id="file-input"
                    type="file"
                    accept="image/*"
                    className="d-none"
                    onChange={handleUploadImage}
                  />
                  <div className="position-relative d-inline-block">

                    <img
                      src={imagePath || admin?.image}
                      onClick={() => handlePrevious(imagePath)}
                      alt=""
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = defaultImage;
                      }}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #b93160",
                      }}
                    />
                    <label
                      htmlFor="file-input"
                      className="position-absolute bottom-0 bg-light rounded-circle p-0"
                      style={{ cursor: "pointer" }}
                    >
                      <i className="fa-solid fa-camera text-white"></i>
                    </label>
                  </div>
                  <p className="fw-bold mt-2 mb-0">{admin?.email}</p>

                  <button
                    className="btn btn-sm btn-primary mt-2 text-uppercase"
                    style={{ backgroundColor: "#b93160", border: "none" }}
                    onClick={handleChangeImage}
                  >
                    Upload Image
                  </button>

                </div>
              </div>

              {/* Right Panel */}
              <div className="col-8 mt-2">
                {/* Personal Info */}
                <div className="card p-4 shadow-md " style={{ backgroundColor: "#fff", borderRadius: "5px" }}>
                  <div className="d-flex align-items-center mb-3">
                    <i className="fa fa-user text-danger me-2" />
                    <h5 className="mb-0 fw-bold text-uppercase tracking-wide">Personal Information</h5>
                  </div>

                  <div className="mb-3">
                    <Input
                      label="Name"
                      value={name}
                      placeholder="Enter your name"
                      errorMessage={error.name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="mb-3">
                    <Input
                      label="Email Address"
                      type="email"
                      value={email}
                      placeholder="Enter your email"
                      errorMessage={error.email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="d-flex justify-content-end">
                    <Button
                      btnName="Submit"
                      btnColor="btn themeBtn px-4 py-1 "
                      style={{
                        borderRadius: "6px",
                        backgroundColor: "#b93160",
                        color: "#fff",
                      }}
                      onClick={handleSubmitEmail}
                    />
                  </div>
                </div>

                {/* Change Password */}
                <div className="card p-4 shadow-md  mt-3" style={{ backgroundColor: "#fff", borderRadius: "5px" }}>
                  <div className="d-flex align-items-center mb-3">
                    <i className="fa fa-refresh text-danger me-2" />
                    <h5 className="mb-0 fw-bold text-uppercase tracking-wide">Change Password</h5>
                  </div>

                  <div className="mb-3 position-relative">
                    <label className="form-label fw-semibold">Current Password</label>
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      className="form-control form-control-lg rounded-3"
                      placeholder="Current Password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <i
                      className={`fa ${showCurrentPassword ? "fa-eye-slash" : "fa-eye"}`}
                      style={{
                        position: "absolute",
                        top: "67%",
                        right: "16px",
                        cursor: "pointer",
                        transform: "translateY(-50%)",
                        color: "#999",
                      }}
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    />
                    {error.oldPassword && (
                      <small className="text-danger ms-1">{error.oldPassword}</small>
                    )}
                  </div>

                  <div className="mb-3">
                    <input
                      type="password"
                      className="form-control form-control-lg rounded-3"
                      placeholder="New Password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    {error.newPassword && <small className="text-danger">{error.newPassword}</small>}
                  </div>

                  <div className="mb-3">
                    <input
                      type="password"
                      className="form-control form-control-lg rounded-3"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    {error.confirmPassword && (
                      <small className="text-danger">{error.confirmPassword}</small>
                    )}
                  </div>

                  <p className="text-muted mb-3" style={{ fontSize: "0.875rem" }}>
                    Password must be at least 6 characters
                  </p>

                  <div className="d-flex gap-2">
                    <button
                      className="btn themeBtn text-light px-4 py-1 "
                      style={{ borderRadius: "6px", backgroundColor: "#b93160" }}
                      onClick={handleChangePassword}
                    >
                      Update Password
                    </button>
                    <button
                      className="btn myCustomButton px-4 py-1 "
                      style={{ borderRadius: "8px" }}
                      onClick={() => {
                        setOldPassword("");
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
