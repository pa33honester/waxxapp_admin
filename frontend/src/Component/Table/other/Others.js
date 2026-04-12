import React, { useEffect, useState } from "react";
import Button from "../../extra/Button";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useDispatch, useSelector } from "react-redux";
import { getSetting, updateSetting } from "../../store/setting/setting.action";

const Others = () => {

  const dispatch = useDispatch();
  const { setting } = useSelector((state) => state.setting);
  const [active, setActive] = useState("Privacy");
  const [privacyPolicyLink, setPrivacyPolicyLink] = useState("");
  const [termsAndConditionsLink, setTermsAndConditionsLink] = useState('');

  const [error, setError] = useState({
    privacyPolicyLink: "",
    termsAndConditionsLink: "",
  });


  useEffect(() => {
    dispatch(getSetting());
  }, [dispatch ]);

  useEffect(() => {
    setPrivacyPolicyLink(setting?.privacyPolicyLink || '');
    setTermsAndConditionsLink(setting?.termsAndConditionsLink || '');
  }, [setting]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let errors = {};
    // Privacy Policy Link Validation
    if (!privacyPolicyLink || privacyPolicyLink.trim() === "" || privacyPolicyLink === "<p><br></p>") {
      errors.privacyPolicyLink = "Privacy Policy content cannot be empty.";
    }

    // Terms and Conditions Link Validation
    if (!termsAndConditionsLink || termsAndConditionsLink.trim() === "" || termsAndConditionsLink === "<p><br></p>") {
      errors.termsAndConditionsLink = "Terms and Conditions content cannot be empty.";
    }

    if (Object.keys(errors).length > 0) {
      setError(errors);
      return;
    }

    let settingData = {
      privacyPolicyLink,
      termsAndConditionsLink
    };

    dispatch(updateSetting(settingData, setting?._id))
  };

  return (
    <>
      <div className="sellerHeader primeHeader">
        <div
          style={{
            display: "flex",
            width: "fit-content",
            background: "#fafafd",
            borderRadius: "8px",
            border: "1px solid #ededed",
            margin: "10px 0",
          }}
        >
          <Button
            btnName="Privacy policy"
            newClass="themeFont"
            style={{
              borderRadius: "8px 0 0 8px",
              backgroundColor: active === "Privacy" ? "#f7dada" : "#fff",
              color: active === "Privacy" ? "#b93160" : "#2f2b3db3",
              border: "none",
              fontWeight: "500",
              padding: "10px 22px",
              boxShadow: active === "Privacy" ? "0 0 4px #f7dada" : "none",
              transition: "all 0.2s",
              cursor: "pointer",
            }}
            onClick={() => setActive("Privacy")}
          />
          <Button
            btnName="Terms and condition"
            newClass="themeFont"
            style={{
              borderRadius: "0 8px 8px 0",
              backgroundColor: active === "Terms" ? "#f7dada" : "#fff",
              color: active === "Terms" ? "#b93160" : "#2f2b3db3",
              border: "none",
              fontWeight: "500",
              padding: "10px 22px",
              boxShadow: active === "Terms" ? "0 0 4px #f7dada" : "none",
              transition: "all 0.2s",
              cursor: "pointer",
            }}
            onClick={() => setActive("Terms")}
          />
        </div>
        <div style={{ marginTop: "18px" }}>
          {active === "Privacy" ? (
            <div>
              <h4>Privacy Policy:</h4>
              <ReactQuill
                className="mt-4"
                theme="snow"
                value={privacyPolicyLink}
                onChange={(content) => {
                  setPrivacyPolicyLink(content);
                  if (error?.privacyPolicyLink) {
                    setError({ ...error, privacyPolicyLink: null });
                  }
                }}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike", "blockquote"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "image"],
                    ["clean"],
                  ],
                }}
                placeholder="Write your Privacy Policy here..."
              />
              {error?.privacyPolicyLink && (
                <div style={{ color: "red", marginTop: "5px" }}>
                  {error.privacyPolicyLink}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h4>Terms and Conditions:</h4>
              <ReactQuill
                className="mt-4"
                theme="snow"
                value={termsAndConditionsLink}
                onChange={(content) => {
                  setTermsAndConditionsLink(content);
                  if (error?.termsAndConditionsLink) {
                    setError({ ...error, termsAndConditionsLink: null });
                  }
                }}
                modules={{
                  toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline", "strike", "blockquote"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["link", "image"],
                    ["clean"],
                  ],
                }}
                placeholder="Write your Terms and Conditions here..."
              />
              {error?.termsAndConditionsLink && (
                <div style={{ color: "red", marginTop: "5px" }}>
                  {error.termsAndConditionsLink}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-12 d-flex justify-content-end">
          <Button
            newClass={`whiteFont`}
            btnName={`Submit`}
            btnColor={`#b93160`}
            style={{ width: "90px", borderRadius: "6px", color: "#fff", backgroundColor: "#b93160", marginRight: "30px" }}
            onClick={(e) => handleSubmit(e)}
          />
        </div>
      </div>
    </>
  );
};

export default Others;
