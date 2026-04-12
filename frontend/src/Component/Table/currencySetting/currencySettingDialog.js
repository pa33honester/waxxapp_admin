import React, { useEffect, useState } from "react";
import Button from "../../extra/Button";
import Input from "../../extra/Input";
import { CLOSE_DIALOGUE } from "../../store/dialogue/dialogue.type";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  createWithdraw,
  updateWithdraw,
} from "../../store/withdraw/withdraw.action";
import { createCurrency, updateCurrency } from "../../store/currency/currency.action";

const CurrencySettingDialog = (props) => {
  const dispatch = useDispatch();
  const { dialogueData } = useSelector((state) => state.dialogue);
  const [mongoId, setMongoId] = useState("");
  const [name, setName] = useState();
  const [symbol, setSymbol] = useState();
  const [currencyCode, setCurrencyCode] = useState();
  const [countryCode, setCountryCode] = useState();

  const [error, setError] = useState({
    name: "",
    symbol: "",
    currencyCode: "",
    countryCode: "",
    imagePath: "",
    addDetail: "",
  });

  useEffect(() => {
    setMongoId(dialogueData?._id);
    setName(dialogueData?.name);
    setSymbol(dialogueData?.symbol)
    setCurrencyCode(dialogueData?.currencyCode);
    setCountryCode(dialogueData?.countryCode);
  }, [dialogueData]);




  const handleSubmit = (e) => {
    e.preventDefault();

    let error = {};

    if (!name) error.name = "Name is required!";
    if (!symbol) error.symbol = "Symbol is required!";

    if (!currencyCode) {
      error.currencyCode = "Currency Code is required!";
    } else if (currencyCode.length !== 3) {
      error.currencyCode = "Currency Code must be exactly 3 characters!";
    }

    if (!countryCode) {
      error.countryCode = "Country Code is required!";
    } else if (countryCode.length !== 2) {
      error.countryCode = "Country Code must be exactly 2 characters!";
    }

    if (Object.keys(error).length > 0) {
      setError(error);
      return;
    }
    const data = {
      name,
      symbol,
      currencyCode: currencyCode.toUpperCase(),
      countryCode: countryCode.toUpperCase(),
    };

    if (mongoId) {
      dispatch(updateCurrency(data, mongoId));
    } else {
      dispatch(createCurrency(data));
    }

    dispatch({ type: CLOSE_DIALOGUE });
  };

  return (
    <div className="mainDialogue fade-in">
      <div className="Dialogue">
        <div className="dialogueHeader">
          <div className="headerTitle fw-bold">Currency</div>
          <div
            className="closeBtn "
            onClick={() => {
              dispatch({ type: CLOSE_DIALOGUE });
            }}
          >
            <i class="fa-solid fa-xmark"></i>
          </div>
        </div>
        <div className="dialogueMain">
          <div className="row">
            <div className="col-12">
              <Input
                label={`Name`}
                id={`name`}
                type={`text`}
                value={name}
                placeholder={`Enter Name`}
                errorMessage={error.name && error.name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      name: `Name Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      name: "",
                    });
                  }
                }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <Input
                label={`Symbol`}
                id={`name`}
                type={`text`}
                value={symbol}
                placeholder={`Add Symbol`}
                errorMessage={error.symbol && error.symbol}
                onChange={(e) => {
                  setSymbol(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      symbol: `Symbol Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      symbol: "",
                    });
                  }
                }}
              />
            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <Input
                label={`Currency Code`}
                id={`currency code`}
                type={`text`}
                placeholder={`Add Code`}
                value={currencyCode}
                errorMessage={error.currencyCode && error.currencyCode}
                onChange={(e) => {
                  let val = e.target.value.toUpperCase(); // Always uppercase
                  setCurrencyCode(val);

                  if (!val) {
                    setError({ ...error, currencyCode: "Currency Code is required!" });
                  } else if (val.length !== 3) {
                    setError({ ...error, currencyCode: "Must be exactly 3 characters" });
                  } else {
                    setError({ ...error, currencyCode: "" });
                  }
                }}
              />

            </div>
          </div>

          <div className="row">
            <div className="col-12">
              <Input
                label={`Country Code`}
                id={`country code`}
                type={`text`}
                placeholder={`Add Code`}
                value={countryCode}
                errorMessage={error.countryCode && error.countryCode}
                onChange={(e) => {
                  let val = e.target.value.toUpperCase(); // Always uppercase
                  setCountryCode(val);

                  if (!val) {
                    setError({ ...error, countryCode: "Country Code is required!" });
                  } else if (val.length !== 2) {
                    setError({ ...error, countryCode: "Must be exactly 2 characters" });
                  } else {
                    setError({ ...error, countryCode: "" });
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="dialogueFooter">
          <div className="dialogueBtn">
            <Button
              btnName={`Submit`}
              btnColor={`btnBlackPrime text-light`}
              style={{ borderRadius: "5px", width: "80px" }}
              newClass={`me-2`}
              onClick={handleSubmit}
            />
            <Button
              btnName={`Close`}
              btnColor="myCustomButton"
              style={{ borderRadius: "5px", width: "80px" }}
              onClick={() => {
                dispatch({ type: CLOSE_DIALOGUE });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(null, { createWithdraw, updateWithdraw })(
  CurrencySettingDialog
);
