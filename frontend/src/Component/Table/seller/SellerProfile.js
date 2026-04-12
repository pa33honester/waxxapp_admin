import Title from "../../extra/Title";
import React, { useState } from "react";
import ToggleSwitch from "../../extra/ToggleSwitch";
import { connect, useSelector } from "react-redux";
import {
  getSellerProfile,
  sellerIsBlock,
} from "../../store/seller/seller.action";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Shop from "./Profile/Shop";
import SellerProduct from "./Profile/SellerProduct";
import Transition from "./Profile/Transition";
import SellerOrder from "./Profile/SellerOrder";
import Button from "../../extra/Button";

const SellerProfile = () => {
  const [type, setType] = useState(() => {
    const StatusType = sessionStorage.getItem("Shop");
    return StatusType !== null ? StatusType : "Shop";
  });
  const navigate = useNavigate();

  useEffect(() => {
    sessionStorage.setItem("Shop", type);
  }, [type]);

  return (
    <>
      <div className="mainSellerProfile">
        <div className="sellerProfile">
          <div className="sellerProfileHeader primeHeader">
          
            <div className="row">
              <div className="col-10">
                <h4 className="fw-bolder text-white">Seller</h4>
              
              </div>
              <div className="col-12">
                <div>
                  <div className="sellerMenuHeader mt-3">
                    <ul className="dashboardMenu d-flex">
                      <li
                        className={`pb-0 ${
                          type === "Shop" && "activeLineDash "
                        }`}
                      >
                        <a
                          className={`profileDash mb-0 ${
                            type === "Shop" && "activeLineDashFont "
                          }`}
                          onClick={() => {
                            setType("Shop");
                          }}
                        >
                          Shop
                        </a>
                      </li>
                      <li
                        className={`pb-0 ${
                          type === "Product" && "activeLineDash "
                        }`}
                      >
                        <a
                          className={`profileDash ${
                            type === "Product" && "activeLineDashFont "
                          }`}
                          onClick={() => {
                            setType("Product");
                          }}
                        >
                          
                          Product
                        </a>
                      </li>
                      <li
                        className={`pb-0 ${
                          type === "Order" && "activeLineDash "
                        }`}
                      >
                        <a
                          className={`profileDash ${
                            type === "Order" && "activeLineDashFont "
                          }`}
                          onClick={() => {
                            setType("Order");
                          }}
                        >
                          Order
                        </a>
                      </li>
                      <li
                        className={`pb-0 ${
                          type === "Transition" && "activeLineDash "
                        }`}
                      >
                        <a
                          className={`profileDash ${
                            type === "Transition" && "activeLineDashFont "
                          }`}
                          onClick={() => {
                            setType("Transition");
                          }}
                        >Transaction
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div>
              {type === "Shop" && (
                <>
                  <Shop />
                </>
              )}
              {type === "Product" && (
                <>
                  <SellerProduct />
                </>
              )}
              {type === "Transition" && (
                <>
                  <Transition />
                </>
              )}
              {type === "Order" && (
                <>
                  <SellerOrder />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default connect(null, {
  getSellerProfile,
  sellerIsBlock,
})(SellerProfile);
