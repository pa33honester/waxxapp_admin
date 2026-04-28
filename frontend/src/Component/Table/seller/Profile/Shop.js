import React from "react";
import { useEffect } from "react";
import {
  getSellerProfile,
  sellerIsBlock,
  getSellerProduct,
  getSellerWallet,
} from "../../../store/seller/seller.action";
import { connect, useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getDefaultCurrency } from "../../../store/currency/currency.action";
import defaultImage from "../../../../assets/images/default.jpg";

const Shop = (props) => {
  const { sellerProfile, sellerWallet } = useSelector((state) => state.seller);
  console.log("sellerProfile", sellerProfile);
  
  const { defaultCurrency } = useSelector((state) => state.currency);
  const { state } = useLocation();
  const id = state;
  console.log("state", state);
  
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getSellerProfile(id));
    dispatch(getSellerWallet(id));
    dispatch(getDefaultCurrency());
  }, [dispatch]);

  return (
    <>
      <div className="row mt-4">
        <div className="col-12">
          <div className="row">
            {/* Profile Avatar Section */}
            <div className="col-xl-6 col-md-12 pb-3">
              <div className="card" style={{ borderRadius: "8px" }}>
                <div className="card-body">
                  <h6 className="card-title text-primary mb-3">Profile Avatar</h6>
                  
                  <div className="row">
                    <div className="col-md-5 text-center mb-3"  style={{ display: "flex", justifyContent: "center" , alignItems: "start" , marginTop: "50px"}}>
                      <img
                        src={sellerProfile?.image}
                        width={120}
                        height={120}
                        style={{ borderRadius: "5px", objectFit: "cover" }}
                        alt="Profile"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/dummy.png";
                        }}
                      />
                    </div>
                    
                    <div className="col-md-7">
                      <div className="mb-3">
                        <label className="form-label text-muted">Name</label>
                        <div className="fw-bold">
                          {sellerProfile?.firstName || "-"} {sellerProfile?.lastName || ""}
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label text-muted">User Name</label>
                        <div>{sellerProfile?.businessTag || "-"}</div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label text-muted">Mobile number</label>
                        <div>{sellerProfile?.mobileNumber || "-"}</div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label text-muted">Gender</label>
                        <div>{sellerProfile?.gender || "-"}</div>
                      </div>

                       <div className="mb-3">
                        <label className="form-label text-muted">Total Earned ({defaultCurrency?.symbol})</label>
                        <div>{sellerProfile?.netPayout || "-"}</div>
                      </div>

                       <div className="mb-3">
                        <label className="form-label text-muted">Total Amount Withdrawn ({defaultCurrency?.symbol})</label>
                        <div>{sellerProfile?.amountWithdrawn || "-"}</div>
                      </div>

                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Info Section */}
            <div className="col-xl-6 col-md-12 pb-3">
              <div className="card" style={{ borderRadius: "8px" }}>
                <div className="card-body">
                  <h6 className="card-title text-success mb-3">Address Info</h6>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Address</label>
                        <div>{sellerProfile?.address?.address || "-"}</div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label text-muted">City</label>
                        <div>{sellerProfile?.address?.city || "-"}</div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label text-muted">Pincode</label>
                        <div>{sellerProfile?.address?.pincode || "-"}</div>
                      </div>
                    </div>
                    
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Landmark</label>
                        <div>{sellerProfile?.address?.landMark || "-"}</div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label text-muted">Country</label>
                        <div>{sellerProfile?.address?.country || "-"}</div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label text-muted">State</label>
                        <div>{sellerProfile?.address?.state || "-"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            {/* Bank Details Info Section */}
            <div className="col-xl-6 col-md-12 pb-3">
              <div className="card" style={{ borderRadius: "8px" }}>
                <div className="card-body">
                  <h6 className="card-title text-info mb-3">Bank Details Info</h6>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted">Bank Business Name</label>
                    <div>{sellerProfile?.bankDetails?.bankBusinessName || "Swiftbest Enterprises"}</div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Bank Name</label>
                        <div>{sellerProfile?.bankDetails?.bankName || "-"}</div>
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label text-muted">Momo Number</label>
                        <div>{sellerProfile?.bankDetails?.momoNumber || "-"}</div>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label text-muted">Momo Name</label>
                        <div>{sellerProfile?.bankDetails?.momoName || "-"}</div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label text-muted">Network Name</label>
                        <div>{sellerProfile?.bankDetails?.networkName || "-"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Identity Proof Section */}
            {/* <div className="col-xl-6 col-md-12 pb-3">
              <div className="card" style={{ borderRadius: "8px" }}>
                <div className="card-body">
                  <h6 className="card-title text-warning mb-3">Identity Proof</h6>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted">Document Type</label>
                    <div>{sellerProfile?.documentType || "-"}</div>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label text-muted">Document Image</label>
                    <div className="mt-2">
                      {sellerProfile?.documentImage ? (
                        <img
                          src={sellerProfile?.documentImage ? sellerProfile?.documentImage : defaultImage}
                          alt="Document"
                          style={{ 
                            maxWidth: "200px", 
                            maxHeight: "150px", 
                            borderRadius: "5px",
                            border: "1px solid #ddd"
                          }}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = defaultImage;
                          }}
                        />
                      ) : (
                        <div 
                          style={{ 
                            width: "200px", 
                            height: "150px", 
                            backgroundColor: "#f8f9fa",
                            border: "2px dashed #dee2e6",
                            borderRadius: "5px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#6c757d"
                          }}
                        >
                          No Document Image
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>

      {/* Custom CSS for better styling */}
      <style jsx>{`
        .card {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          border: none;
          transition: all 0.3s ease;
        }
        
        .card:hover {
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }
        
        .form-label {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 0.25rem;
        }
        
        .card-title {
          font-weight: 600;
          font-size: 1.1rem;
          border-bottom: 2px solid #f1f3f4;
          padding-bottom: 0.5rem;
        }
        
        .text-primary { color: #007bff !important; }
        .text-success { color: #28a745 !important; }
        .text-info { color: #17a2b8 !important; }
        .text-warning { color: #ffc107 !important; }
      `}</style>
    </>
  );
};

export default connect(null, {
  getSellerProfile,
  sellerIsBlock,
  getSellerProduct,
  getSellerWallet,
})(Shop);
