import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import Button from "../../extra/Button";
import Input from "../../extra/Input";
import { CLOSE_DIALOGUE } from "../../store/dialogue/dialogue.type";
import {
  createPromoCode,
  updatePromoCode,
} from "../../store/PromoCode/promoCode.action";

const PromoDialog = (props) => {
  const { dialogueData } = useSelector((state) => state.dialogue);
  const dispatch = useDispatch();

  const [mongoId, setMongoId] = useState(0);
  const [promoCode, setPromoCode] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [conditions, setConditions] = useState("");
  const [discountType, setDiscountType] = useState("");
  const [error, setError] = useState({
    discountAmount: "",
    conditions: "",
    promoCode: "",
    discountType: "",
    minOrderValue: "",
  });

  useEffect(() => {
    setMongoId(dialogueData?._id);
    setConditions(dialogueData?.conditions || "");
    setPromoCode(dialogueData?.promoCode || "");
    setMinOrderValue(dialogueData?.minOrderValue || "");
    setDiscountAmount(dialogueData?.discountAmount || "");
    setDiscountType(dialogueData?.discountType || "");
  }, [dialogueData]);

  const handleSubmit = () => {
    const parsedMinOrder = parseFloat(minOrderValue);
    const parsedDiscountAmount = parseFloat(discountAmount);

    let validationError = {};
    if (!promoCode) validationError.promoCode = "PromoCode is Required!";
    if (!conditions) validationError.conditions = "Conditions are required!";
    if (!minOrderValue) {
      validationError.minOrderValue = "Min Order Value is required!";
    } else if (parsedMinOrder <= 0) {
      validationError.minOrderValue = "Enter valid Min Order Value!";
    }
    if (!discountAmount) {
      validationError.discountAmount = "Discount Amount is required!";
    } else if (parsedDiscountAmount <= 0) {
      validationError.discountAmount = "Enter valid Discount Amount!";
    }
    if (!discountType) validationError.discountType = "Discount Type is required!";

    if (Object.keys(validationError).length > 0) {
      return setError(validationError);
    }

    const data = {
      promoCode,
      conditions,
      discountAmount: parsedDiscountAmount,
      discountType,
      minOrderValue: parsedMinOrder,
    };

    if (mongoId) {
      props.updatePromoCode(data, mongoId);
    } else {
      props.createPromoCode(data);
    }

    dispatch({ type: CLOSE_DIALOGUE });
  };

  return (
    <div className="mainDialogue fade-in ">
      <div className="Dialogue">
        <div className="dialogueHeader">
          <div className="headerTitle fw-bold text-white">PromoCode</div>
          <div
            className="closeBtn"
            onClick={() => dispatch({ type: CLOSE_DIALOGUE })}
          >
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>

        <div className="dialogueMain">
          <div className="row">
            <div className="col-12">
              <Input
                label="PromoCode"
                id="promoCode"
                type="text"
                value={promoCode}
                placeholder="Enter promoCode..."
                errorMessage={error.promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  setError({ ...error, promoCode: "" });
                }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12" style={{ marginBottom: "10px" }}>
              <label
                className="styleForTitle mb-2"
                style={{ color: "#000", fontSize: "14px"}}
              >
                Discount Type
              </label>
              <select
                className="form-control form-control-line"
                value={discountType}
                onChange={(e) => {
                  setDiscountType(e.target.value);
                  setError({ ...error, discountType: "" });
                }}
              >
                <option value="" disabled>
                  --select--
                </option>
                <option value="0">Flat</option>
                <option value="1">Percentage</option>
              </select>
              {error.discountType && (
                <p className="errorMessage">{error.discountType}</p>
              )}
            </div>

            <div className="col-6">
              <Input
                label="Min Order Value"
                id="minOrderValue"
                type="number"
                value={minOrderValue}
                placeholder="Enter minOrderValue..."
                errorMessage={error.minOrderValue}
                onChange={(e) => {
                  setMinOrderValue(e.target.value);
                  setError({ ...error, minOrderValue: "" });
                }}
              />
            </div>

            <div className="col-6">
              <Input
                label="Discount Amount"
                id="discountAmount"
                type="number"
                value={discountAmount}
                placeholder="Enter discountAmount..."
                errorMessage={error.discountAmount}
                onChange={(e) => {
                  setDiscountAmount(e.target.value);
                  setError({ ...error, discountAmount: "" });
                }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-md-12">
              <label
                className="float-left styleForTitle"
                style={{ color: "#000", fontSize: "14px" }}
              >
                Conditions
              </label>
              <textarea
                className="form-control"
                placeholder="Conditions..."
                rows="5"
                value={conditions}
                onChange={(e) => {
                  setConditions(e.target.value);
                  setError({ ...error, conditions: "" });
                }}
              />
              <div className="pl-1 text-left mt-2">
                <p className="text-danger">
                  <b>Note:</b> You can add multiple conditions separated by commas (,)
                </p>
              </div>
              {error.conditions && (
                <p className="errorMessage">{error.conditions}</p>
              )}
            </div>
          </div>
        </div>

        <div className="dialogueFooter">
          <div className="dialogueBtn">
            <Button
              btnName="Submit"
              btnColor="btnBlackPrime text-light"
              style={{ borderRadius: "5px", width: "80px" }}
              newClass="me-2"
              onClick={handleSubmit}
            />
            <Button
              btnName="Close"
              btnColor="myCustomButton"
              style={{ borderRadius: "5px", width: "80px" }}
              onClick={() => dispatch({ type: CLOSE_DIALOGUE })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(null, { createPromoCode, updatePromoCode })(PromoDialog);
