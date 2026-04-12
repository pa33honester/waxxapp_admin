import React, { useEffect, useState } from "react";
import Button from "../../extra/Button";
import { CLOSE_DIALOGUE } from "../../store/dialogue/dialogue.type";
import Input from "../../extra/Input";
import { connect, useDispatch, useSelector } from "react-redux";
import { warningPay } from "../../../util/Alert";
import { getSellerProfile } from "../../store/seller/seller.action";
import Swal from "sweetalert2";

const RedeemDialog = (props) => {
  const { dialogueData } = useSelector((state) => state.dialogue);

  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    dispatch({ type: CLOSE_DIALOGUE });
    const data = warningPay();
    data
      .then((isDeleted) => {
        if (isDeleted) {
          // props.deleteAttribute();
          dispatch({ type: CLOSE_DIALOGUE });

          Swal.fire({
            icon: "success",
            title: "Success!",
            text: "Payment was successfully Paid to Seller.",
          });
        }
      })
      .catch((err) => console.log(err));
  };
  return (
    <div className="mainDialogue fade-in">
      <div className="Dialogue">
        <div className="dialogueHeader">
          <div className="headerTitle fw-bold">{dialogueData.sellerId?.firstName + "  " +  dialogueData.sellerId?.lastName +"'s" + " " + "Bank Details"}   </div>
          <div
            className="closeBtn "
            onClick={() => {
              dispatch({ type: CLOSE_DIALOGUE });
            }}
          >
            <i class="fa-solid fa-xmark"></i>
          </div>
        </div>
        <div className="dialogueMain py-0 sellerDialougeWith">
          <div className="row">
            <div className="col-6">
              <Input
                label={`Bank Name`}
                id={`bankName`}
                type={`text`}
                value={dialogueData?.sellerId?.bankDetails?.bankName}
                readOnly
                disabled
              />
            </div>
            <div className="col-6">
              <Input
                label={`AccountNumber`}
                id={`accountNumber`}
                type={`text`}
                value={dialogueData?.sellerId?.bankDetails?.accountNumber}
                readOnly
                disabled
              />
            </div>
            <div className="col-6">
              <Input
                label={`IFSC Code`}
                id={`IFSCCode`}
                type={`text`}
                value={dialogueData?.sellerId?.bankDetails?.IFSCCode}
                readOnly
                disabled
              />
            </div>
            <div className="col-6">
              <Input
                label={`BankBusinessName`}
                id={`name`}
                type={`text`}
                value={dialogueData?.sellerId?.bankDetails?.bankBusinessName}
                readOnly
                disabled
              />
            </div>
            <div className="col-6">
              <Input
                label={`Branch Name`}
                id={`branchName`}
                type={`text`}
                value={dialogueData?.sellerId?.bankDetails?.branchName}
                readOnly
                disabled
              />
            </div>
          </div>
        </div>
        <div className="dialogueFooter pt-0" style={{justifyContent : "center"}}>
          <div className="dialogueBtn">
            <Button
              newClass={`themeFont boxCenter userBtn px-4`}
              btnName={`Marked As Paid`}
              style={{
                borderRadius: "5px",
                margin: "auto",
                padding: "10px",
                width: "250px",
                backgroundColor: "#f7dada",
                color: " #B93160",
                cursor: "pointer",
              }}
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(null, { getSellerProfile })(RedeemDialog);
