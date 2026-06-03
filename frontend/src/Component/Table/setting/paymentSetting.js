import { useEffect, useState } from "react";
import Input from "../../extra/Input";
import SettingBox from "./SettingBox";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  getSetting,
  updateSetting,
  handleToggleSwitch,
} from "../../store/setting/setting.action";
import { getWithdraw } from "../../store/withdraw/withdraw.action";
import Button from "../../extra/Button";
import InfoTooltip from "../../../Component/extra/InfoTooltip";
import { flutterWaveContent, paystackContent } from "../../../Component/extra/infoContent";

const PaymentSetting = (props) => {
  const { setting } = useSelector((state) => state.setting);
  const dispatch = useDispatch();
  const [cancelOrderCharges, setCancelOrderCharges] = useState();
  const [adminCommissionCharges, setAdminCommissionCharges] = useState();
  const [flutterWaveSwitch, setFlutterWaveSwitch] = useState(false);
  const [isCashOnDelivery, setIsCashOnDelivery] = useState(false);
  const [flutterWaveId, setFlutterWaveId] = useState("");
  const [paystackSwitch, setPaystackSwitch] = useState(false);
  const [paystackPublicKey, setPaystackPublicKey] = useState("");
  const [paystackSecretKey, setPaystackSecretKey] = useState("");


  // error

  const [error, setError] = useState({
    agoraKey: "",
    agoraCertificate: "",
    cancelOrderCharges: "",
    adminCommissionCharges: "",
    flutterWaveId: ""
  });

  useEffect(() => {
    dispatch(getSetting());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getWithdraw());
  }, [dispatch]);

  useEffect(() => {
    setCancelOrderCharges(setting?.cancelOrderCharges);
    setAdminCommissionCharges(setting?.adminCommissionCharges);
    setFlutterWaveSwitch(setting?.flutterWaveSwitch)
    setIsCashOnDelivery(setting?.isCashOnDelivery)
    setFlutterWaveId(setting?.flutterWaveId)

    // Paystack
    setPaystackSwitch(setting?.paystackSwitch);
    setPaystackPublicKey(setting?.paystackPublicKey ?? "");
    setPaystackSecretKey(setting?.paystackSecretKey ?? "");
  }, [setting]);

  const handleSubmit = () => {
    if (!flutterWaveId) {
      return setError({ ...error, flutterWaveId: "flutterWaveId is required" });
    }
    props.updateSetting({
      flutterWaveId,
      paystackPublicKey,
      paystackSecretKey,
    }, setting?._id);
  };

  const handleClick = (type) => {
    props.handleToggleSwitch(setting?._id, type);
  };

  return (
    <>
      <div className="mainSettingBar" style={{ margin: "0px 15px" }}>
        <div className="settingBar ">
          <div className="settingHeader primeHeader">
            <div className="col-12 headname" style={{ marginTop: "15px", marginBottom: "-5px", marginLeft: "0px" }}>Payment Setting </div>
          </div>
          <div className="settingMain">
            <div className="row">
              {/* box 3 */}

              {/* <SettingBox title={`Charges Setting`}>
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
              </SettingBox> */}


              <SettingBox
                submit={(e) => handleSubmit(e)}
                title={`Flutter Wave Setting`}
                toggleSwitch={{
                  switchName: "FlutterWave",
                  switchValue: flutterWaveSwitch,
                  handleClick: () => {
                    handleClick("flutterWave");
                  },
                }}
              >
                <Input
                  type={`text`}
                  label={`FlutterWave Id`}
                  value={flutterWaveId}
                  newClass={`col-12`}
                  placeholder={`Enter You FlutterWaveId....`}
                  errorMessage={error.flutterWaveId && error.flutterWaveId}
                  onChange={(e) => {
                    setFlutterWaveId(e.target.value);
                    if (!e.target.value) {
                      return setError({
                        ...error,
                        flutterWaveId: `flutterWaveId Is Required`,
                      });
                    } else {
                      return setError({
                        ...error,
                        flutterWaveId: "",
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
                    title="Flutterwave Setting"
                    content={flutterWaveContent}
                  />
                </div>

              </SettingBox>

              <SettingBox
                submit={(e) => handleSubmit(e)}
                title={`Cash On Delivery`}
                toggleSwitch={{
                  switchName: "COD",
                  switchValue: isCashOnDelivery,
                  handleClick: () => {
                    handleClick("isCashOnDelivery");
                  },
                }}
              >
              </SettingBox>

              {/* Paystack */}

              <SettingBox
                submit={(e) => handleSubmit(e)}
                title={`Paystack Payment Setting`}
                toggleSwitch={{
                  switchName: "Paystack",
                  switchValue: paystackSwitch,
                  handleClick: () => {
                    handleClick("paystack");
                  },
                }}
              >
                <Input
                  type={`text`}
                  label={`Paystack Public Key`}
                  value={paystackPublicKey}
                  newClass={`col-12`}
                  placeholder={`Paystack public key (pk_...)`}
                  onChange={(e) => {
                    setPaystackPublicKey(e.target.value);
                  }}
                />

                <Input
                  type={`text`}
                  label={`Paystack Secret Key`}
                  value={paystackSecretKey}
                  newClass={`col-12`}
                  placeholder={`Paystack secret key (sk_...)`}
                  onChange={(e) => {
                    setPaystackSecretKey(e.target.value);
                  }}
                />
                <div style={{
                  width: "100%",
                  display: "flex",
                  justifyContent: "flex-end"
                }}>
                  <InfoTooltip
                    title="Paystack Setting"
                    content={paystackContent}
                  />
                </div>
              </SettingBox>

              {/* Box 6 */}
            </div>
            <div className="row mt-3">
              <div className="col-12 d-flex justify-content-end">
                <Button
                  newClass={`whiteFont`}
                  btnName={`Submit`}
                  btnColor={`btnBlackPrime`}
                  style={{ width: "90px", borderRadius: "6px", color: "#fff", backgroundColor: "#b93160" }}
                  onClick={(e) => handleSubmit(e)}
                />
              </div>
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
})(PaymentSetting);
