import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { Rating } from "react-simple-star-rating";
import { getLiveSellerProduct } from "../../store/seller/seller.action";
import male from "../../../assets/images/dummy.jpg"
import { capitalize } from "@mui/material";
import { getSetting } from "../../store/setting/setting.action";
import { CLEAR_LIVE_SELLER } from "../../store/seller/seller.type";

const LiveSellerProduct = (props) => {
  const { state } = useLocation();
  console.log("state**-CHEAK", state);
  // const [loading, setLoading] = useState(true); 


  const { liveProduct, loadingLiveProduct } = useSelector((state) => state.seller);
  console.log("liveProduct", liveProduct);

  const { setting } = useSelector((state) => state.setting);

  const dispatch = useDispatch();

  // useEffect(() => {
  //   dispatch(getLiveSellerProduct(state?._id));
  // }, [dispatch, state?._id]);



  useEffect(() => {
    dispatch(getSetting())
  }, [])

  useEffect(() => {
    return () => {
      dispatch({ type: CLEAR_LIVE_SELLER, payload: null })
    }
  }, [])

  if (loadingLiveProduct) {
    return <div className="mainLoaderBox">
      <div className="loader"></div>
    </div>
  }



  return (
    <>
      <div className="row m-3 mt-5">
        {state?.selectedProducts?.map((product) => {
          return (
            <>
              <div className="col-xl-3 col-lg-3 col-sm-6">
                <div className="card" style={{ borderRadius: "5px", boxShadow: "0 0 3px rgba(0 , 0 , 0 , 0.4)" }}>
                  <div className="card-body p-0">
                    <div className="pro-img">
                      <img
                        src={product?.mainImage}
                        width="100%"
                        height={350}
                        style={{
                          objectFit: "cover",
                          borderRadius: "8px 8px 0px 0px",
                          position: "relative",
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = male;
                        }}
                        alt=""
                      />
                      <div
                        className="ping"
                        style={{
                          position: "absolute",
                          top: "5px",
                          left: "7px",
                        }}
                      ></div>
                    </div>
                    <div className="pro-content p-2">
                      {/* <p className="mb-1">
                        Total Sold : {product.sold ? product.sold : 0}
                      </p> */}
                      <b className="" style={{ fontSize: "15px", fontWeight: "400" }}>{capitalize(product?.productName)}</b> <br />
                      {/* <Rating
                        className="my-2 fs-6"
                        initialValue={product?.rating}
                        readonly={true}
                        allowFraction
                      /> */}
                      <h6 className="" style={{ color: "", fontWeight: "500", marginTop: "7px" }}>
                        {product?.price}({setting?.currency?.symbol})
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        })}
      </div>
    </>
  );
};

export default connect(null, { getLiveSellerProduct })(LiveSellerProduct);
