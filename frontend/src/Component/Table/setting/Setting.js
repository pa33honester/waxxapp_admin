import { useEffect, useState } from "react";
import Input from "../../extra/Input";
import SettingBox from "./SettingBox";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  getSetting,
  updateSetting,
  handleToggleSwitch,
  handleSellerToggleSwitch,
} from "../../store/setting/setting.action";
import { getWithdraw } from "../../store/withdraw/withdraw.action";
import Button from "../../extra/Button";
import ToggleSwitch from "../../extra/ToggleSwitch";
import "react-quill/dist/quill.snow.css";
import InfoTooltip from "../../extra/InfoTooltip";
import { auctionSetting, chargesSetting, openAISetting, privateKeyJson, resendApiSetting, withdrawalSetting, zegoApp } from "../../extra/infoContent";

const Setting = (props) => {
  const { setting } = useSelector((state) => state.setting);

  const dispatch = useDispatch();
  // box 1
  const [settingId, setSettingId] = useState("");
  const [zegoAppId, setZegoAppId] = useState("");
  const [paymentReminderForLiveAuction, setPaymentReminderForLiveAuction] = useState("");
  const [minPayout, setMinPayout] = useState("");
  const [paymentReminderForManualAuction, setPaymentReminderForManualAuction] = useState("");
  const [zegoAppSignIn, setZegoAppSignIn] = useState("");
  // box 2
  // const [privacyPolicyLink, setPrivacyPolicyLink] = useState("");
  // const [privacyPolicyText, setPrivacyPolicyText] = useState("");
  const [resendkey, setResendKey] = useState("");
  // const [termsAndConditionsLink, setTermsAndConditionsLink] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState("");



  const [cancelOrderCharges, setCancelOrderCharges] = useState("");
  const [adminCommissionCharges, setAdminCommissionCharges] = useState("");

  const [isFakeData, setIsFakeData] = useState(false);

  // box 3

  // box 7
  const [isAddProductRequest, setIsAddProductRequest] = useState(false);
  const [isUpdateProductRequest, setIsUpdateProductRequest] = useState(false);
  const [privateKey, setPrivateKey] = useState("");

  const [addressProofRequired, setAddressProofRequired] = useState(setting?.addressProofRequired || false);
  const [addressProofActive, setAddressProofActive] = useState(setting?.addressProofActive || false);

  const [govIdRequired, setGovIdRequired] = useState(setting?.govIdRequired || false);
  const [govIdActive, setGovIdActive] = useState(setting?.govIdActive || false);

  const [registrationCertRequired, setRegistrationCertRequired] = useState(setting?.registrationCertRequired || false);
  const [registrationCertActive, setRegistrationCertActive] = useState(setting?.registrationCertActive || false);


  const [error, setError] = useState({
    zegoAppId: "",
    paymentReminderForLiveAuction: "",
    minPayout: "",
    paymentReminderForManualAuction: "",
    zegoAppSignIn: "",
    // privacyPolicyLink: "",
    resendKey: "",
    // termsAndConditionsLink: "",
    openaiApiKey: "",
    // privacyPolicyText: "",
    // shippingCharges: "",
    withdrawCharges: "",
    withdrawLimit: "",
    cancelOrderCharges: "",
    adminCommissionCharges: "",
    razorPayId: "",
    razorSecretKey: "",
    stripePublishableKey: "",
    stripeSecretKey: "",
    privateKey,
  });


  useEffect(() => {
    dispatch(getSetting());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getWithdraw());
  }, [dispatch]);

  //onselect function of selecting multiple values

  //onRemove function for remove multiple values

  useEffect(() => {
    setSettingId(setting?._id);
    // box 1
    setZegoAppId(setting?.zegoAppId);
    setPaymentReminderForLiveAuction(setting?.paymentReminderForLiveAuction);
    setMinPayout(setting?.minPayout);
    setPaymentReminderForManualAuction(setting?.paymentReminderForManualAuction);
    setZegoAppSignIn(setting?.zegoAppSignIn);
    // box 2
    // setPrivacyPolicyLink(setting?.privacyPolicyLink);
    // setPrivacyPolicyText(setting?.privacyPolicyText);
    setIsFakeData(setting?.isFakeData);

    // box 7
    setIsAddProductRequest(setting?.isAddProductRequest);
    setIsUpdateProductRequest(setting?.isUpdateProductRequest);
    setPrivateKey(JSON.stringify(setting?.privateKey));
    setAdminCommissionCharges(setting?.adminCommissionCharges);
    setCancelOrderCharges(setting?.cancelOrderCharges);
    setResendKey(setting?.resendApiKey);
    // setTermsAndConditionsLink(setting?.termsAndConditionsLink || '');
    setOpenaiApiKey(setting?.openaiApiKey);
  }, [setting]);

  const handleSubmit = () => {

    if (
      !zegoAppId ||
      !paymentReminderForLiveAuction ||
      !minPayout ||
      !paymentReminderForManualAuction ||
      !zegoAppSignIn ||
      // !privacyPolicyLink ||
      !resendkey ||
      // !termsAndConditionsLink ||
      !openaiApiKey ||
      // !privacyPolicyText ||

      !cancelOrderCharges ||
      cancelOrderCharges <= 0 ||
      !adminCommissionCharges ||
      adminCommissionCharges <= 0
    ) {
      let error = {};
      if (!zegoAppId) error.zegoAppId = "ZegoAppId Is Required ";
      if (!paymentReminderForLiveAuction)
        error.paymentReminderForLiveAuction =
          "Payment Reminder For Live Auction Is Required ";
      if (!minPayout) error.minPayout = "Min Payout Is Required ";
      if (!paymentReminderForManualAuction)
        error.paymentReminderForManualAuction =
          "Payment Reminder For Manual Auction Is Required ";
      if (!zegoAppSignIn) error.zegoAppSignIn = "ZegoAppSignIn Is Required ";
      // if (!privacyPolicyLink)
      //   error.privacyPolicyLink = "Privacy Policy Link Is Required ";
      if (!resendkey)
        error.resendKey = "Resend Api Key Is Required ";
      // if (!termsAndConditionsLink)
      //   error.termsAndConditionsLink = "Terms And Conditions Link Is Required ";
      if (!openaiApiKey)
        error.openaiApiKey = "Openai Api Key Is Required ";
      // if (!privacyPolicyText)
      //   error.privacyPolicyText = "Privacy Policy Text Is Required ";

      if (!cancelOrderCharges)
        error.cancelOrderCharges = "Cancel Order Charges Is Required";
      if (cancelOrderCharges <= 0)
        error.cancelOrderCharges = "Enter Correct Cancel Order Charges";

      if (!adminCommissionCharges)
        error.adminCommissionCharges = "Admin Commission Charges Is Required";
      if (adminCommissionCharges <= 0)
        error.adminCommissionCharges =
          "Enter Correct Admin Commission Charges ";

      return setError({ ...error });
    } else {
      let settingData = {
        zegoAppId,
        paymentReminderForLiveAuction,
        minPayout,
        paymentReminderForManualAuction,
        zegoAppSignIn,
        // privacyPolicyLink,
        resendApiKey: resendkey,
        // termsAndConditionsLink,
        openaiApiKey,
        // privacyPolicyText,
        privateKey,
        adminCommissionCharges,
        cancelOrderCharges
      };

      props.updateSetting(settingData, setting?._id);
    }
  };

  const handleClick = (field, toggleType) => {
    console.log("field", field, "toggleType", toggleType);



    //Handle Update Switch Value
    dispatch(handleSellerToggleSwitch(setting._id, field, toggleType));
  };

  return (
    <>
      <div className="mainup">


        <div className="settingHeader primeHeader">
          <div className="col-12 headname" style={{ marginTop: "15px", marginBottom: "-5px", marginLeft: "2px" }}>App Setting </div>
        </div>
        <div className="settingMain">
          <div className="row" style={{ margin: "0px 2px" }}>
            {/*-------------- Box 1 --------------*/}
            <SettingBox title={`Zegocloud Setting`}>
              <Input
                type={`text`}
                label={`Zegocloud App Id`}
                value={zegoAppId}
                newClass={`col-12`}
                placeholder={`Enter Your Zegocloud App Id....`}
                errorMessage={error.zegoAppId && error.zegoAppId}
                onChange={(e) => {
                  setZegoAppId(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      zegoAppId: `Zegocloud App Id Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      zegoAppId: "",
                    });
                  }
                }}
              />
              <Input
                type={`text`}
                label={`Zegocloud App Sign In`}
                value={zegoAppSignIn}
                newClass={`col-12`}
                errorMessage={error.zegoAppSignIn && error.zegoAppSignIn}
                onChange={(e) => {
                  setZegoAppSignIn(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      zegoAppSignIn: `Zegocloud App Sign In Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      zegoAppSignIn: "",
                    });
                  }
                }}
              />

              <div style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end"
              }}>
                <InfoTooltip
                  title="Zego App Id"
                  content={zegoApp}
                />
              </div>

            </SettingBox>

              <SettingBox title={`Become Seller Setting`} className="mb-5">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <div style={{ width: "200px" }} />
                <span className="fw-semibold" style={{ width: "80px", textAlign: "center" }}>Require</span>
                <span className="fw-semibold" style={{ width: "80px", textAlign: "center" }}>Active</span>
              </div>

              {/* Address Proof Row */}
              <div className="d-flex justify-content-between align-items-center mt-2">
                <h5 className="me-2 fw-semibold" style={{ width: "200px" }}>Address Proof</h5>
                <div style={{ width: "80px", textAlign: "center" }}>
                  <ToggleSwitch
                    value={setting?.addressProof?.isRequired}
                    onClick={() => {
                      handleClick("addressProof", "isRequired");
                      if (setting?.addressProof?.isActive === false && setting?.addressProof?.isRequired === false) {
                        setTimeout(() => {
                          handleClick("addressProof", "isActive");
                        }, 1000); // 2 second delay, apko jitna chahiye adjust kar sakte hain
                      }
                    }}
                  />
                </div>
                <div style={{ width: "80px", textAlign: "center" }}>
                  <ToggleSwitch
                    value={setting?.addressProof?.isActive}
                    onClick={() => {
                      handleClick("addressProof", "isActive");
                      if (setting?.addressProof?.isRequired === true && setting?.addressProof?.isActive === true) {
                        setTimeout(() => {
                          handleClick("addressProof", "isRequired");
                        }, 1000);
                      }
                    }}
                  />
                </div>
              </div>


              {/* Government ID Row */}
              <div className="d-flex justify-content-between align-items-center mt-2">
                <h5 className="me-2 fw-semibold" style={{ width: "200px" }}>Government ID</h5>
                <div style={{ width: "80px", textAlign: "center" }}>
                  <ToggleSwitch
                    value={setting?.govId?.isRequired}
                    onClick={() => {
                      handleClick("govId", "isRequired");
                      if (setting?.govId?.isActive === false && setting?.govId?.isRequired === false) {
                        setTimeout(() => {
                          handleClick("govId", "isActive");
                        }, 1000);
                      }
                    }}
                  />
                </div>
                <div style={{ width: "80px", textAlign: "center" }}>
                  <ToggleSwitch
                    value={setting?.govId?.isActive}
                    onClick={() => {
                      handleClick("govId", "isActive");
                      if (setting?.govId?.isRequired === true && setting?.govId?.isActive === true) {
                        setTimeout(() => {
                          handleClick("govId", "isRequired");
                        }, 1000);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Registration Certificate Row */}
              <div className="d-flex justify-content-between align-items-center mt-2">
                <h5 className="me-2 fw-semibold" style={{ width: "200px", whiteSpace: "nowrap" }}>Registration Certificate</h5>
                <div style={{ width: "80px", textAlign: "center" }}>
                  <ToggleSwitch
                    value={setting?.registrationCert?.isRequired}
                    onClick={() => {
                      handleClick("registrationCert", "isRequired");
                      if (setting?.registrationCert?.isActive === false && setting?.registrationCert?.isRequired === false) {
                        setTimeout(() => {
                          handleClick("registrationCert", "isActive");
                        }, 1000);
                      }
                    }}
                  />
                </div>
                <div style={{ width: "80px", textAlign: "center" }}>
                  <ToggleSwitch
                    value={setting?.registrationCert?.isActive}
                    onClick={() => {
                      handleClick("registrationCert", "isActive");
                      if (setting?.registrationCert?.isRequired === true && setting?.registrationCert?.isActive === true) {
                        setTimeout(() => {
                          handleClick("registrationCert", "isRequired");
                        }, 1000);
                      }
                    }}
                  />
                </div>
              </div>
            </SettingBox>


            {/* Box 7 */}
            <SettingBox
              title={`Add Product Request`}
              title2={`New product request enable/disable for seller`}
              toggleSwitch={{
                switchValue: isAddProductRequest,
                handleClick: () => {
                  handleClick("productRequest");
                },
              }}
            ></SettingBox>
            <SettingBox
              title={`Update Product Request`}
              title2={`Enable/disable product request update for seller`}
              toggleSwitch={{
                switchValue: isUpdateProductRequest,
                handleClick: () => {
                  handleClick("updateProductRequest");
                },
              }}
            ></SettingBox>

            <SettingBox title={`Charges Setting`}>
              <Input
                type={`number`}
                label={`Cancel Order Charges (%)`}
                value={cancelOrderCharges}
                newClass={`col-6 pb-2`}
                placeholder={`Enter You Cancle Order Charge....`}
                errorMessage={
                  error.cancelOrderCharges && error.cancelOrderCharges
                }
                onChange={(e) => {
                  setCancelOrderCharges(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      cancelOrderCharges: `Cancle Order ChargeIs Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      cancelOrderCharges: "",
                    });
                  }
                }}
              />

              <Input
                type={`number`}
                label={`Admin Commission Charges (%)`}
                value={adminCommissionCharges}
                newClass={`col-6`}
                placeholder={`Enter You Admin Commission Charges`}
                errorMessage={
                  error.adminCommissionCharges && error.adminCommissionCharges
                }
                onChange={(e) => {
                  setAdminCommissionCharges(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      adminCommissionCharges: `Admin Commission Charges Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      adminCommissionCharges: "",
                    });
                  }
                }}
              />

              <div style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end"
              }}>
                <InfoTooltip
                  title="Charges Setting"
                  content={chargesSetting}
                />
              </div>
            </SettingBox>

            <SettingBox title={`Resend API Setting`}>
              <Input
                type={`text`}
                label={`Resend Api Key`}
                value={resendkey}
                newClass={`col-12`}
                placeholder={`Enter You Resend Api Key here`}
                errorMessage={
                  error.resendKey && error.resendKey
                }
                onChange={(e) => {
                  setResendKey(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      resendKey: `Resend Api Key Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      resendKey: "",
                    });
                  }
                }}
              />

              <div style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end"
              }}>
                <InfoTooltip
                  title="Resend API Key"
                  content={resendApiSetting}
                />
              </div>
            </SettingBox>

            <SettingBox title={`Minimum Withdrawal Limit (Seller) (${setting?.currency?.currencyCode})`}>
              <Input
                type={`number`}
                label={`Minimum Withdrawal Amount`}
                value={minPayout}
                newClass={`col-12`}
                placeholder={`Enter Amount....`}
                errorMessage={error.minPayout && error.minPayout}
                onChange={(e) => {
                  setMinPayout(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      minPayout: `Minimum Withdrawal Amount Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      minPayout: "",
                    });
                  }
                }}
              />

              <div style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end"
              }}>
                <InfoTooltip
                  title="Withdrawal Setting"
                  content={withdrawalSetting}
                />
              </div>

            </SettingBox>

            <SettingBox title={`Open AI Key Setting`}>
              <Input
                type={`text`}
                label={`Open AI Key`}
                value={openaiApiKey}
                newClass={`col-12`}
                placeholder={`Enter You Open AI Key here`}
                errorMessage={
                  error.openaiApiKey && error.openaiApiKey
                }
                onChange={(e) => {
                  setOpenaiApiKey(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      openaiApiKey: `Open AI Key Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      openaiApiKey: "",
                    });
                  }
                }}
              />

              <div style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end"
              }}>
                <InfoTooltip
                  title="Open AI Setting"
                  content={openAISetting}
                />
              </div>

            </SettingBox>



            <SettingBox title={`Firebase Notification Setting `}>
              <div className="prime-input">
                <label
                  className="float-left styleForTitle"
                  style={{
                    color: "#999AA4"
                  }}
                  htmlFor="privateKey"
                >
                  Private Key JSON ( To handle firebase push notification )
                </label>
                <textarea
                  name=""
                  className="form-control mt-2"
                  id="privateKey"
                  rows={10}
                  value={privateKey}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    try {
                      const newData = JSON.parse(newValue);
                      setPrivateKey(newValue);
                      setError("");
                    } catch (error) {
                      // Handle invalid JSON input
                      console.error("Invalid JSON input:", error);
                      setPrivateKey(newValue);
                      return setError({
                        ...error,
                        privateKey: "Invalid JSON input",
                      });
                    }
                  }}
                ></textarea>

                {error.privateKey && (
                  <div className="pl-1 text-left">
                    <p className="errorMessage">{error.privateKey}</p>
                  </div>
                )}
              </div>

              <div style={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end"
              }}>
                <InfoTooltip
                  title="Firebase Notification"
                  content={privateKeyJson}
                />
              </div>
            </SettingBox>

            <SettingBox
              title={`Fake Data`}
              title2={`Disable/Enable fake data in app`}
              toggleSwitch={{
                switchName: " ",
                switchValue: isFakeData,
                handleClick: () => {
                  handleClick("isFakeData");
                },
              }}
            >
            </SettingBox>
            {/* <SettingBox title={`Become Seller Setting`}>
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="me-2 fw-semibold">Address Proof</h5>
                <div className="d-flex gap-5">
                  <div className="d-flex">
                    <span className="me-2 fw-semibold">Require</span>
                    <ToggleSwitch
                      value={setting?.addressProof?.isRequired}
                      onClick={() => handleClick("addressProof", "isRequired")}
                    />
                  </div>
                  <div className="d-flex">
                    <span className="me-2 fw-semibold">Active</span>
                    <ToggleSwitch
                      value={setting?.addressProof?.isActive}
                      onClick={() => handleClick("addressProof", "isActive")}
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <h5 className="me-2 fw-semibold">Government ID</h5>
                <div className="d-flex gap-5">
                  <div className="d-flex">
                    <span className="me-2 fw-semibold">Require</span>
                    <ToggleSwitch
                      value={setting?.govId?.isRequired}
                      onClick={() => handleClick("govId", "isRequired")}
                    />
                  </div>
                  <div className="d-flex">
                    <span className="me-2 fw-semibold">Active</span>
                    <ToggleSwitch
                      value={setting?.govId?.isActive}
                      onClick={() => handleClick("govId", "isActive")}
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex justify-content-between align-items-center mt-3">
                <h5 className="me-2 fw-semibold">Registration Certificate</h5>
                <div className="d-flex gap-5">
                  <div className="d-flex">
                    <span className="me-2 fw-semibold">Require</span>
                    <ToggleSwitch
                      value={setting?.registrationCert?.isRequired}
                      onClick={() => handleClick("registrationCert", "isRequired")}
                    />
                  </div>
                  <div className="d-flex">
                    <span className="me-2 fw-semibold">Active</span>
                    <ToggleSwitch
                      value={setting?.registrationCert?.isActive}
                      onClick={() => handleClick("registrationCert", "isActive")}
                    />
                  </div>
                </div>
              </div>
            </SettingBox> */}
          

           

          </div>
          <div className="row mt-5">
            <div className="col-12 d-flex justify-content-end">
              <Button
                newClass={`whiteFont`}
                btnName={`Submit`}
                btnColor={`#b93160`}
                style={{ width: "90px", borderRadius: "6px", color: "#fff", backgroundColor: "#b93160", marginBottom: "20px" }}
                onClick={(e) => handleSubmit(e)}
              />
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default connect(null, {
  getSetting,
  updateSetting,
  handleToggleSwitch,
  getWithdraw,
})(Setting);
