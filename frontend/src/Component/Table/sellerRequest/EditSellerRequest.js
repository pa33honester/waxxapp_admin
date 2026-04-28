import React, { useState } from "react";
import "animate.css";
import Input from "../../extra/Input";
import Button from "../../extra/Button";
import { connect, useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { sellerRequestUpdate } from "../../store/sellerRequest/sellerRequest.action";
import $ from "jquery";
import male from "../../../assets/images/g-7.png";
import { useLocation, useNavigate } from "react-router-dom";

const EditSellerRequest = (props) => {
  const state = useLocation();
  const navigate = useNavigate();
  const [mongoId, setMongoId] = useState("");
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
  const [momoNumber, setMomoNumber] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [momoName, setMomoName] = useState("");
  const [countries, setCountries] = useState("");
  const [states, setStates] = useState("");
  const [cities, setCities] = useState("");

  const [error, setError] = useState({
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
    momoNumber: "",
    networkName: "",
    momoName: "",
  });

  const dispatch = useDispatch();

  useEffect(() => {
    if (state) {
      setMongoId(state?.state?._id);
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
      setMomoNumber(state?.state?.bankDetails?.momoNumber);
      setNetworkName(state?.state?.bankDetails?.networkName);
      setMomoName(state?.state?.bankDetails?.momoName);
      setCountries(state?.state?.address?.country);
      setStates(state?.state?.address?.state);
      setCities(state?.state?.address?.city);
    }
  }, [state]);

  const handleUploadImage = (e) => {
    setImage(e.target.files[0]);
    setImagePath(URL.createObjectURL(e.target.files[0]));
  };

  const handleCancle = () => {
    navigate("/admin/sellerRequest");
  };

  const handleSubmit = () => {
    if (
      !firstName ||
      !lastName ||
      !mobileNumber ||
      !image ||
      mobileNumber < 0 ||
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
      !momoNumber ||
      momoNumber < 0 ||
      !networkName ||
      !momoName ||
      password !== confirmPassword
    ) {
      let error = {};
      if (!firstName) error.firstName = "First Name Is Required ";
      if (!lastName) error.lastName = "Last Name Is Required ";
      if (!mobileNumber) error.mobileNumber = "Mobile Number Is Required ";
      if (mobileNumber < 0) error.mobileNumber = "Invalid Mobile Number...";
      if (image?.length === 0 || !imagePath) error.image = "Image is required!";
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
      if (!momoNumber) error.momoNumber = "Momo Number Is Required ";
      if (momoNumber < 0)
        error.momoNumber = "Invalid Momo Number !... ";
      if (!networkName) error.networkName = "Network Name Is Required ";
      if (!momoName) error.momoName = "Momo Name Is Required ";
      return setError({ ...error });
    } else {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("mobileNumber", mobileNumber);
      formData.append("email", email);
      formData.append("password", confirmPassword);
      formData.append("image", image);
      formData.append("gender", gender);
      formData.append("landMark", landmark);
      formData.append("businessName", businessName);
      formData.append("businessTag", businessTag);
      formData.append("bankName", bankName);
      formData.append("bankBusinessName", bankBusinessName);
      formData.append("momoNumber", momoNumber);
      formData.append("networkName", networkName);
      formData.append("momoName", momoName);
      formData.append("country", countries);
      formData.append("state", states);
      formData.append("city", cities);
      formData.append("pinCode", pinCode);
      formData.append("address", address);

      props.sellerRequestUpdate(formData, mongoId);

      setTimeout(() => {
        navigate("/admin/sellerRequest");
      }, 3800);
    }
  };

  $(document).ready(function () {
    $("img").bind("error", function () {
      // Set the default image
      $(this).attr("src", male);
    });
  });

  return (
    <>
      <div className="mainSellerDialog">
        <div className="sellerDialog">
          <div className="sellerHeader primeHeader">
            <div className="row">
              <div className="col-10">
                <h3 className="fw-bold">Edit Seller Request</h3>
              </div>
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
                      <h4 className="fw-bolder mb-4">Seller Information</h4>
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
                          checked={
                            (gender == "male" || gender == "Male") && true
                          }
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
                      <h4 className="fw-bolder my-4">Address Imformation</h4>
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
                      <h4 className="fw-bolder my-4">Account Details</h4>
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
                        label={`Business Tage`}
                        placeholder={`Business Tage`}
                        id={`Businesstage`}
                        type={`text`}
                        value={businessTag}
                        errorMessage={error.businessTag && error.businessTag}
                        onChange={(e) => {
                          setBusinessTag(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              businessTag: `Business Tage Is Required`,
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
                        label={`Bank Business Name`}
                        placeholder={`Bank Business Name`}
                        id={`Bank Business Name`}
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
                              bankBusinessName: `Bank Business Name Is Required`,
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
                        label={`Momo Number`}
                        placeholder={`Momo Number`}
                        id={`momoNumber`}
                        type={`text`}
                        value={momoNumber}
                        errorMessage={
                          error.momoNumber && error.momoNumber
                        }
                        onChange={(e) => {
                          setMomoNumber(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              momoNumber: `Momo Number Is Required`,
                            });
                          } else {
                            return setError({
                              ...error,
                              momoNumber: "",
                            });
                          }
                        }}
                      />
                    </div>
                    <div className="col-md-6 col-12">
                      <Input
                        label={`Momo Name`}
                        placeholder={`Momo Name`}
                        id={`momoName`}
                        type={`text`}
                        value={momoName}
                        errorMessage={error.momoName && error.momoName}
                        onChange={(e) => {
                          setMomoName(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              momoName: `Momo Name Is Required`,
                            });
                          } else {
                            return setError({
                              ...error,
                              momoName: "",
                            });
                          }
                        }}
                      />
                    </div>
                    <div className="col-md-6 col-12">
                      {/* Network Name is restricted to {MTN, Vodafone, AirtelTigo}. */}
                      <label htmlFor="networkName" className="form-label">Network Name</label>
                      <select
                        id="networkName"
                        className="form-select"
                        value={networkName || ""}
                        onChange={(e) => {
                          setNetworkName(e.target.value);
                          if (!e.target.value) {
                            return setError({ ...error, networkName: `Network Name Is Required` });
                          }
                          return setError({ ...error, networkName: "" });
                        }}
                      >
                        <option value="">Select your network</option>
                        <option value="MTN">MTN</option>
                        <option value="Vodafone">Vodafone</option>
                        <option value="AirtelTigo">AirtelTigo</option>
                      </select>
                      {error.networkName && (
                        <div className="text-danger mt-1" style={{ fontSize: 12 }}>{error.networkName}</div>
                      )}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12 d-flex justify-content-end">
                      <Button
                        newClass={`themeFont mx-2 btn `}
                        btnColor={`btn-outline-danger`}
                        btnName={`Close`}
                        onClick={handleCancle}
                        style={{
                          borderRadius: "10px",
                          border: "1px solid red",
                        }}
                      />
                      <Button
                        newClass={`themeFont mx-2 btn`}
                        btnColor={`btn-outline-success`}
                        btnName={`Submit`}
                        onClick={handleSubmit}
                        style={{
                          borderRadius: "10px",
                          border: "1px solid green",
                        }}
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
    </>
  );
};

export default connect(null, { sellerRequestUpdate })(EditSellerRequest);
