import React, { useEffect, useState } from "react";
import Button from "../../extra/Button";
import { CLOSE_DIALOGUE } from "../../store/dialogue/dialogue.type";
import Input from "../../extra/Input";
import { connect } from "react-redux";
import {
  createFakeSeller,
  updateFakeSeller,
} from "../../store/fake Seller/fakeSeller.action";
import { useLocation, useNavigate } from "react-router-dom";

const FakeSellerDialog = (props) => {
  
  const state = useLocation();
  const navigate = useNavigate();

  const [mongoId, setMongoId] = useState("");

  const [video, setVideo] = useState([]);
  const [videoPath, setVideoPath] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [image, setImage] = useState([]);
  const [imagePath, setImagePath] = useState("");
  const [address, setAddress] = useState("");
  const [landmark, setLandmark] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessTag, setBusinessTag] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankBusinessName, setBankBusinessName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [IFSCCode, setIFSCCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [countries, setCountries] = useState("");
  const [states, setStates] = useState("");
  const [cities, setCities] = useState("");
  const [error, setError] = useState({
    video: "",
    videoPath: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    gender: "",
    email: "",
    password: "",
    confirmPassword: "",
    imagePath: "",
    address: "",
    landmark: "",
    countries: "",
    states: "",
    cities: "",
    pinCode: "",
    businessName: "",
    businessTag: "",
    bankName: "",
    bankBusinessName: "",
    accountNumber: "",
    IFSCCode: "",
    branchName: "",
  });

  useEffect(() => {

    setMongoId(state?.state?._id);

    setVideoPath(state?.state?.video);

    setFirstName(state?.state?.firstName);
    setLastName(state?.state?.lastName);
    setMobileNumber(state?.state?.mobileNumber);
    setGender(state?.state?.gender);
    setEmail(state?.state?.email);
    setPassword(state?.state?.password);
    setConfirmPassword(state?.state?.password);
    setImagePath(state?.state?.image);
    setAddress(state?.state?.address?.address);
    setLandmark(state?.state?.address?.landMark);
    setPinCode(state?.state?.address?.pinCode);
    setBusinessName(state?.state?.businessName);
    setBusinessTag(state?.state?.businessTag);
    setBankName(state?.state?.bankDetails?.bankName);
    setBankBusinessName(state?.state?.bankDetails?.bankBusinessName);
    setAccountNumber(state?.state?.bankDetails?.accountNumber);
    setIFSCCode(state?.state?.bankDetails?.IFSCCode);
    setBranchName(state?.state?.bankDetails?.branchName);
    setCountries(state?.state?.address?.country);
    setStates(state?.state?.address?.state);
    setCities(state?.state?.address?.city);
  }, [state]);

  const handleCancle = () => {
    navigate(-1);
  };

  const handleUploadImage = (e) => {
    setImage(e.target.files[0]);
    setImagePath(URL.createObjectURL(e.target.files[0]));
    setError((prevErrors) => ({
      ...prevErrors,
      image: "",
    }));
  };
  const handleUploadVideo = (e) => {
    setVideo(e.target.files[0]);
    setVideoPath(URL.createObjectURL(e.target.files[0]));
    setError((prevErrors) => ({
      ...prevErrors,
      video: "",
    }));
  };

  const handleSubmit = () => {

    // ✅ Strip non-digits for validation (but keep + in actual value)
    const digitsOnly = mobileNumber ? mobileNumber.replace(/\D/g, "") : "";


    if (
      !video ||
      !firstName ||
      !lastName ||
      !mobileNumber ||
      !image ||
      mobileNumber?.length < 0 ||
      mobileNumber?.length > 10 ||
      !email ||
      !password ||
      !confirmPassword ||
      !gender ||
      !address ||
      !landmark ||
      !cities ||
      !states ||
      !countries ||
      !pinCode ||
      pinCode < 0 ||
      !businessName ||
      !businessTag ||
      !bankName ||
      !bankBusinessName ||
      !accountNumber ||
      accountNumber < 0 ||
      !IFSCCode ||
      !branchName ||
      password !== confirmPassword
    ) {
      let error = {};
      if (!firstName) error.firstName = "First Name Is Required ";
      if (!lastName) error.lastName = "Last Name Is Required ";
      if (!mobileNumber) error.mobileNumber = "Mobile Number Is Required ";
      else if (digitsOnly.length < 7 || digitsOnly.length > 15)
        error.mobileNumber = "Invalid Mobile Number...";
      // if (mobileNumber?.length > 10)
      //   error.mobileNumber = "Invalid Mobile Number...";
      if (image?.length === 0 || !imagePath) error.image = "Image is required!";
      if (video?.length === 0 || !videoPath) error.video = "Video is required!";
      if (!email) error.email = "Email Is Required ";
      if (!password) error.password = "Password Is Required ";
      if (password !== confirmPassword)
        error.confirmPassword =
          "Confirm Password Is doesn't match to Password ";
      if (!gender) error.gender = "Gender Is Required ";
      if (!address) error.address = "Address Is Required ";
      if (!landmark) error.landmark = "Landmark Is Required ";
      if (!cities) error.cities = "city Is Required ";
      if (!states) error.states = "State Is Required ";
      if (!countries) error.countries = "Country Is Required ";
      if (!pinCode) error.pinCode = "PinCode Is Required ";
      if (pinCode < 0 || pinCode <= 5) error.pinCode = "Invalid PinCode";
      if (!businessName) error.businessName = "Business Name Is Required ";
      if (!businessTag) error.businessTag = "Business Tag Is Required ";
      if (!bankBusinessName)
        error.bankBusinessName = "Bank Business Name Is Required ";
      if (!bankName) error.bankName = "Bank Name Is Required ";
      if (!accountNumber) error.accountNumber = "Account Number Is Required ";
      if (accountNumber < 0)
        error.accountNumber = "Invalid Account Number !... ";
      if (!IFSCCode) error.IFSCCode = "IFSC Code Is Required ";
      if (!branchName) error.branchName = "Branch Name Is Required ";
      return setError({ ...error });
    } else {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("mobileNumber", mobileNumber);
      formData.append("email", email);
      formData.append("image", image);
      formData.append("video", video);
      formData.append("gender", gender);
      formData.append("businessName", businessName);
      formData.append("businessTag", businessTag);
      formData.append("password", confirmPassword);
      formData.append("landMark", landmark);
      formData.append("bankName", bankName);
      formData.append("bankBusinessName", bankBusinessName);
      formData.append("accountNumber", accountNumber);
      formData.append("IFSCCode", IFSCCode);
      formData.append("branchName", branchName);
      formData.append("country", countries);
      formData.append("state", states);
      formData.append("city", cities);
      formData.append("pinCode", pinCode);
      formData.append("address", address);

      if (mongoId) {
        props.updateFakeSeller(formData, mongoId);
      } else {
        props.createFakeSeller(formData);
      }
      navigate(-1);
    }
  };
  return (
    <div className="mainSellerDialog">
      <div className="sellerDialog">
        <div className="sellerHeader primeHeader">
          <div className="row">
            <div className="col-12">
              <div className="d-flex justify-content-end">
                {/* <button
                  className="btn btn-outline-danger rounded-pill px-3"
                  onClick={() => navigate(-1)}
                  style={{ margin: "2px -7px" }}
                >
                  <i className="fa fa-arrow-left me-2"></i> Back
                </button> */}
                <button
                  onClick={() => navigate(-1)}
                  className="btn rounded-pill px-4"
                  style={{ border: "1px solid #b93160", marginLeft: "8px", backgroundColor: "#b93160", color: "#fff" }}
                >
                  ← Back
                </button>
              </div>
            </div>
            <div className="col-10"></div>
            <div className="col-2 text-end">

            </div>
            <div className="col-6"></div>
          </div>
        </div>
        <div className="sellerMain" style={{ margin: "10px 18px" }}>
          <div className="card">
            <div className="card-body">
              <div className="sellerDetail pt-3">
                <div className="row">
                  <div className="col-12">
                    <h2 className="fw-bolder mb-4 text-white">Seller Information</h2>
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`First Name`}
                      placeholder={`First Name`}
                      id={`firstName`}
                      type={`text`}
                      value={firstName}
                      errorMessage={error.firstName && error.firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            firstName: `First Name Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            firstName: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Last Name`}
                      placeholder={`last Name`}
                      id={`lastName`}
                      type={`text`}
                      value={lastName}
                      errorMessage={error.lastName && error.lastName}
                      onChange={(e) => {
                        setLastName(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            lastName: `LastName Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            lastName: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Mobile Number`}
                      placeholder={`Mobile Number`}
                      id={`mobileNumber`}
                      type={`number`}
                      value={mobileNumber}
                      errorMessage={error.mobileNumber && error.mobileNumber}
                      onChange={(e) => {
                        setMobileNumber(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            mobileNumber: `Mobile Number Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            mobileNumber: "",
                          });
                        }
                      }}
                    />
                    {/* <Input
                      label="Mobile Number"
                      placeholder="+91 9876543210"
                      id="mobileNumber"
                      type="tel"
                      value={mobileNumber}
                      errorMessage={error.mobileNumber}
                      onChange={(e) => {
                        let value = e.target.value;

                        // Always ensure it starts with +
                        if (!value.startsWith("+")) {
                          value = "+" + value.replace(/\D/g, "");
                        }

                        // Allow only + and digits
                        if (/^\+?\d*$/.test(value)) {
                          setMobileNumber(value);

                          const digitsOnly = value.replace(/\D/g, "");
                          if (!digitsOnly) {
                            setError({ ...error, mobileNumber: "Mobile Number Is Required" });
                          } else if (digitsOnly.length < 7 || digitsOnly.length > 15) {
                            setError({ ...error, mobileNumber: "Invalid Mobile Number..." });
                          } else {
                            setError({ ...error, mobileNumber: "" });
                          }
                        }
                      }}
                    /> */}

                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Email`}
                      placeholder={`Email`}
                      id={`email`}
                      type={`text`}
                      value={email}
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
                  </div>

                  <div className="col-md-6 col-12">
                    <Input
                      label={`Password`}
                      placeholder={`Password`}
                      id={`password`}
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
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Confirm Password`}
                      placeholder={`Confirm Password`}
                      id={`confirmPassword`}
                      type={`password`}
                      value={confirmPassword}
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
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Image`}
                      id={`sellerImage`}
                      type={`file`}
                      accept={`image/*`}
                      errorMessage={error.image && error.image}
                      onChange={(e) => handleUploadImage(e)}
                    />
                    {imagePath && (
                      <>
                        <img
                          src={imagePath}
                          className="ms-2 mb-4"
                          style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "10px",
                          }}
                          alt=""
                          srcset=""
                        />
                      </>
                    )}
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Video`}
                      id={`sellerVideo`}
                      type={`file`}
                      accept={`video/*`}
                      errorMessage={error.video && error.video}
                      onChange={(e) => handleUploadVideo(e)}
                    />
                    {videoPath && (
                      <>
                        <video
                          src={videoPath}
                          className="ms-2 mb-4"
                          style={{
                            width: "70px",
                            height: "70px",
                            borderRadius: "10px",
                          }}
                          alt=""
                          srcset=""
                        />
                      </>
                    )}
                  </div>
                  <div className="col-md-6 col-12">
                    <div className="prime-input mb-2">
                      <label className="mb-3"> Select Gender </label>
                    </div>
                    <div className="d-flex align-items-center">
                      <Input
                        label={`Male`}
                        name={`gender`}
                        id={`male`}
                        type={`radio`}
                        value={`male`}
                        checked={(gender == "male" || gender == "Male") && true}
                        newClass={`me-3`}
                        onChange={(e) => {
                          setGender(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              gender: `Gender Is Required`,
                            });
                          } else {
                            return setError({
                              ...error,
                              gender: "",
                            });
                          }
                        }}
                      />
                      <Input
                        label={`Female`}
                        name={`gender`}
                        id={`female`}
                        type={`radio`}
                        value={`female`}
                        checked={
                          (gender == "female" || gender == "Female") && true
                        }
                        onChange={(e) => {
                          setGender(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              gender: `Gender Is Required`,
                            });
                          } else {
                            return setError({
                              ...error,
                              gender: "",
                            });
                          }
                        }}
                      />
                    </div>
                    {error.gender && (
                      <>
                        <p className="errorMessage">{error.gender}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <h2 className="fw-bolder my-4 text-white">Address Imformation</h2>
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Address`}
                      placeholder={`Address`}
                      id={`address`}
                      type={`text`}
                      value={address}
                      errorMessage={error.address && error.address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            address: `Address Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            address: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Landmark`}
                      placeholder={`Landmark`}
                      id={`landmark`}
                      type={`text`}
                      value={landmark}
                      errorMessage={error.landmark && error.landmark}
                      onChange={(e) => {
                        setLandmark(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            landmark: `Landmark Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            landmark: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`City`}
                      placeholder={`city`}
                      id={`city`}
                      type={`text`}
                      value={cities}
                      errorMessage={error.cities && error.cities}
                      onChange={(e) => {
                        setCities(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            cities: `Cities Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            cities: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`State`}
                      placeholder={`State`}
                      id={`State`}
                      type={`text`}
                      value={states}
                      errorMessage={error.states && error.states}
                      onChange={(e) => {
                        setStates(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            states: `States Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            states: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Country`}
                      placeholder={`Country`}
                      id={`Country`}
                      type={`text`}
                      value={countries}
                      errorMessage={error.countries && error.countries}
                      onChange={(e) => {
                        setCountries(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            countries: `Countries Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            countries: "",
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="col-md-6 col-12">
                    <Input
                      label={`Pincode`}
                      placeholder={`Pincode`}
                      id={`pinCode`}
                      type={`number`}
                      value={pinCode}
                      errorMessage={error.pinCode && error.pinCode}
                      onChange={(e) => {
                        setPinCode(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            pinCode: `PinCode Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            pinCode: "",
                          });
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12">
                    <h2 className="fw-bolder my-4 text-white">Account Details</h2>
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Business Name`}
                      placeholder={`Business Name`}
                      id={`businessName`}
                      type={`text`}
                      value={businessName}
                      errorMessage={error.businessName && error.businessName}
                      onChange={(e) => {
                        setBusinessName(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            businessName: `Business Name Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            businessName: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Bussiness Tag`}
                      placeholder={`Business Tag`}
                      id={`Bussinesstage`}
                      type={`text`}
                      value={businessTag}
                      errorMessage={error.businessTag && error.businessTag}
                      onChange={(e) => {
                        setBusinessTag(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            businessTag: `Bussiness Tage Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            businessTag: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Bank Bussiness Name`}
                      placeholder={`Bank Bussiness Name`}
                      id={`Bank Bussiness Name`}
                      type={`text`}
                      value={bankBusinessName}
                      errorMessage={
                        error.bankBusinessName && error.bankBusinessName
                      }
                      onChange={(e) => {
                        setBankBusinessName(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            bankBusinessName: `Bank Bussiness Name Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            bankBusinessName: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Bank Name`}
                      placeholder={`Bank Name`}
                      id={`bankName`}
                      type={`text`}
                      value={bankName}
                      errorMessage={error.bankName && error.bankName}
                      onChange={(e) => {
                        setBankName(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            bankName: `Bank Name Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            bankName: "",
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="col-md-6 col-12">
                    <Input
                      label={`Account Number`}
                      placeholder={`Account Number`}
                      id={`accountNumber`}
                      type={`number`}
                      value={accountNumber}
                      errorMessage={error.accountNumber && error.accountNumber}
                      onChange={(e) => {
                        setAccountNumber(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            accountNumber: `Account Number Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            accountNumber: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`Branch Name`}
                      placeholder={`Branch Name`}
                      id={`branchName`}
                      type={`branchName`}
                      value={branchName}
                      errorMessage={error.branchName && error.branchName}
                      onChange={(e) => {
                        setBranchName(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            branchName: `Branch Name Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            branchName: "",
                          });
                        }
                      }}
                    />
                  </div>
                  <div className="col-md-6 col-12">
                    <Input
                      label={`IFSC Code`}
                      placeholder={`IFSC Code`}
                      id={`IFSCCode`}
                      type={`text`}
                      value={IFSCCode}
                      errorMessage={error.IFSCCode && error.IFSCCode}
                      onChange={(e) => {
                        setIFSCCode(e.target.value);
                        if (!e.target.value) {
                          return setError({
                            ...error,
                            IFSCCode: `IFSCCode Is Required`,
                          });
                        } else {
                          return setError({
                            ...error,
                            IFSCCode: "",
                          });
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="row">
                  <div className="col-12 d-flex justify-content-end">
                    <Button
                      btnName={`Close`}
                      btnColor="myCustomButton"
                      style={{ borderRadius: "5px", width: "80px", margin: "2px" }}
                      onClick={handleCancle}
                    />
                    <Button
                      btnName={`Submit`}
                      btnColor={`btnBlackPrime text-light`}
                      style={{ borderRadius: "5px", width: "80px", margin: "2px" }}
                      newClass={`me-2`}
                      onClick={handleSubmit}

                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="sellerFooter primeFooter"></div>
      </div>
    </div>
  );
};

export default connect(null, { createFakeSeller, updateFakeSeller })(
  FakeSellerDialog
);
