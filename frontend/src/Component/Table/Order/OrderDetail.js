import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { getOrderDetail, orderUpdate } from "../../store/order/order.action";
import { useLocation, useNavigate } from "react-router-dom";
import { getDefaultCurrency } from "../../store/currency/currency.action";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { colors } from "../../../util/SkeletonColor";
import { getSetting } from "../../store/setting/setting.action";
import { baseURL } from "../../../util/config";

const OrderDetail = () => {
  const { orderDetail } = useSelector((state) => state.order);
  console.log("orderDetail", orderDetail);
  
  const { defaultCurrency } = useSelector((state) => state.currency);
  const { setting } = useSelector((state) => state.setting);
  const { state } = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // console.log("Order Detail:", orderDetail);


  const [loading, setLoading] = useState(true);
  const [instructions, setInstructions] = useState("");

  useEffect(() => {
    dispatch(getSetting());
    dispatch(getOrderDetail(state?._id || state));
    dispatch(getDefaultCurrency());
  }, [dispatch, state]);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  const getBadgeClass = (status) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "confirmed":
        return "badge-primary"; // or "badge-info"
      case "out for delivery":
      case "out_of_delivery":
        return "badge-info";
      case "cancel":
      case "cancelled":
        return "badge-danger";
      default:
        return "badge-secondary";
    }
  };

  return (
    <div className=" mt-4 shadow-md  " style={{ margin: "0px 35px" }}>
      <div className="row flex-column-reverse flex-md-row">
        <div className="d-flex justify-content-between flex-wrap mb-3">
          <div>
            <h4 className="fw-semibold mb-2">Order {orderDetail?.orderId}</h4>
            <h6 className="text-muted">({orderDetail?.items?.length} items)</h6>
          </div>

          <div>
            <button
              onClick={() => navigate(-1)}
              className="btn   rounded-pill px-4 mb-4"
              style={{ border: "1px solid #b93160", backgroundColor: "#b93160", color: "#fff" }}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* LEFT SIDE: Product Items */}
        <div className="col-12 col-md-8">
          {orderDetail?.items?.map((item, idx) => (
            <div className="d-flex flex-column flex-sm-row mb-4 p-3 border  bg-white shadow-sm" style={{ borderRadius: "5px" }} key={idx}>
              {loading ? (
                <>
                  <Skeleton
                    height={120}
                    width={100}
                    className="rounded me-3"
                    baseColor={colors?.baseColor}
                    highlightColor={colors?.highlightColor}
                  />
                  <div className="flex-grow-1 mt-3 mt-sm-0 w-100">
                    <Skeleton height={20} width="60%" className="mb-2" />
                    <Skeleton height={15} width="80%" className="mb-1" />
                    <Skeleton height={15} width="70%" className="mb-3" />
                    <div className="d-flex justify-content-between">
                      <Skeleton height={20} width="30%" />
                      <Skeleton height={20} width="20%" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={item.productId?.mainImage}
                    alt=""
                    className="me-3 img-fluid"
                    style={{
                      width: "100px",
                      height: "120px",
                      objectFit: "cover",
                      borderRadius: "8px"
                    }}
                  />
                  <div className="flex-grow-1 mt-3 mt-sm-0">
                    <h6 className="fw-semibold mb-1">{item.productId?.productName}</h6>
                    {/* <div className="text-muted small mb-2">
                      {item.attributesArray?.map((att, i) => (
                        <span key={i} className="me-3">
                          {att.name}:
                          <strong>
                            {att.name.toLowerCase().includes("color") ? (
                              <span
                                style={{
                                  display: "inline-block",
                                  width: "10px",
                                  height: "10px",
                                  backgroundColor: att.value,
                                  borderRadius: "10%",
                                  marginLeft: "5px"
                                }}
                              />
                            ) : (
                              att.value
                            )}
                          </strong>
                        </span>
                      ))}
                    </div> */}

                    {/* <div className="text-muted small mb-2">
                      {item.attributesArray?.map((att, i) => (
                        <span key={i} className="me-3">
                          <span className="fw-semibold">{att.name}:</span>{" "}
                          {att.fieldType === 1 || att.fieldType === 2 ? (
                            // Show minLength and maxLength for fieldType 1 or 2
                            <span>
                              <span className="badge bg-light text-dark border me-1">
                                Min: <b>{att.minLength}</b>
                              </span>
                              <span className="badge bg-light text-dark border">
                                Max: <b>{att.maxLength}</b>
                              </span>
                            </span>
                          ) : (att.fieldType === 4 || att.fieldType === 5 || att.fieldType === 6) && Array.isArray(att.values) ? (
                            // Show values as list of tags for fieldType 4, 5, 6
                            <span>
                              {att.values.map((val, vi) => (
                                <span
                                  key={vi}
                                  className="badge bg-light text-dark border me-1"
                                  style={{ borderRadius: "8px", fontWeight: 500, fontSize: 13 }}
                                >
                                  {typeof val === "object" && val !== null
                                    ? (val.value || val.name || Object.values(val)[0])
                                    : String(val)}
                                </span>
                              ))}
                            </span>
                          ) : (
                            // Default: show att.value (like old code)
                            <span className="ms-1 fw-semibold">{att.value ?? "-"}</span>
                          )}
                        </span>
                      ))}
                    </div> */}

                    <div className="fw-bold mt-2">
                      Seller : {item?.sellerId?.firstName || "-" + " " + item?.sellerId?.lastName || "-"}
                    </div>

                    <div className="fw-bold mt-2">
                      Product Code : {item?.productCode|| "-" + " " + item?.productCode || "-"}
                    </div>

                    <div className="fw-bold mt-2">
                      Quantity : {item?.productQuantity || "-"}
                    </div>

                    <div className=" mb-2">
                      <div className="fw-bold mt-2 mb-1">
                        Attributes
                      </div>
                      {item.attributesArray?.map((att, i) => (
                        <span key={i} className="me-3">
                          {/* <img src={att.image ? att.image.includes("http") ? att.image : `${baseURL}${att.image}` : ""} alt="" className="me-3 img-fluid" style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "8px" }} /> */}
                          <span className="fw-semibold">{att.name}:</span>{" "}
                          {/* Show values as tags if 'values' is an array, otherwise show "-" */}
                          {Array.isArray(att.values) && att.values.length > 0 ? (
                            <span>
                              {att.values.map((val, vi) => (
                                <span
                                  key={vi}
                                  // className="badge bg-light text-dark border me-1"
                                  style={{ borderRadius: "8px", fontWeight: 500, fontSize: 13 }}
                                >
                                  {typeof val === "object" && val !== null
                                    ? (val.value || val.name || Object.values(val)[0])
                                    : String(val)}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <span className="ms-1 fw-semibold">-</span>
                          )}
                        </span>
                      ))}
                    </div>




                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center">
                      <div className="fw-bold mt-2">
                        {/* {item.purchasedTimeProductPrice.toFixed(2)}({setting?.currency?.symbol}) */}
                      </div>
                      <div className="mt-2">
                        <span className={`badge ${getBadgeClass(item.status)}`}>
                          {item.status}
                        </span>

                      </div>
                    </div>
                  </div>


                </>
              )}
            </div>
          ))}
        </div>


        {/* RIGHT SIDE: Summary + Address + Logistics */}
        <div className="col-12 col-md-4 mt-4 mt-md-0" >
          {/* Cart Total */}
          <div className="border p-4 rounded bg-light mb-4" style={{ borderRadius: "5px" }}>
            <h5 className="mb-3 fw-bold">CART TOTAL</h5>
            <p className="mb-1 fw-semibold">Special Instructions For Seller</p>
            <div className="d-flex justify-content-between mb-1">
              <span>Subtotal</span>
              <strong>{setting?.currency?.symbol}{orderDetail?.subTotal}</strong>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span>Discount</span>
              <strong className="text-danger">{setting?.currency?.symbol} {orderDetail?.discount}</strong>
            </div>
            <div className="d-flex justify-content-between mb-1">
              <span>Shipping</span>
              <strong className="text-success">+{setting?.currency?.symbol} {orderDetail?.totalShippingCharges}</strong>
            </div>
            <hr />
            <div className="d-flex justify-content-between mb-1">
              <span>Total</span>
              <strong className="fs-5">{setting?.currency?.symbol} {orderDetail?.finalTotal}</strong>
            </div>
          </div>

          {/* Shipping Address */}
          {orderDetail?.shippingAddress && (
            <div className="border p-4 rounded bg-light mb-4" style={{ borderRadius: "5px" }}>
              <h5 className="mb-3 fw-bold">SHIPPING ADDRESS</h5>
              <p className="mb-1"><strong>Name : </strong> {orderDetail?.shippingAddress?.name ? orderDetail?.shippingAddress?.name : "-"}</p>
              <p className="mb-1"><strong>Address : </strong> {orderDetail?.shippingAddress?.address ? orderDetail?.shippingAddress?.address : "-"}</p>
              <p className="mb-1"><strong>City : </strong> {orderDetail?.shippingAddress?.city ? orderDetail?.shippingAddress?.city : "-"}</p>
              <p className="mb-1"><strong>State : </strong> {orderDetail?.shippingAddress?.state ? orderDetail?.shippingAddress?.state : "-"}</p>
              <p className="mb-1"><strong>Zip Code : </strong> {orderDetail?.shippingAddress?.zipCode ? orderDetail?.shippingAddress?.zipCode : "-"}</p>
              <p className="mb-1"><strong>Country : </strong> {orderDetail?.shippingAddress?.country ? orderDetail?.shippingAddress?.country : "-"}</p>
            </div>
          )}

          {/* Promo Code */}
          <div className="border p-4 rounded bg-light mb-4" style={{ borderRadius: "5px" }}>
            <h5 className="mb-3 fw-bold">Promo Code</h5>
            {orderDetail?.promoCode ? (
              <>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Promo Code : </span>
                  <strong className="text-success">{orderDetail?.promoCode?.promoCode ? orderDetail?.promoCode?.promoCode : "-"}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Discount Amount : </span>
                  <strong className="text-danger">{orderDetail?.promoCode?.discountAmount ? orderDetail?.promoCode?.discountAmount : "-"}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Discount Type : </span>
                  <strong>{orderDetail?.promoCode?.discountType ? orderDetail?.promoCode?.discountType : "-"}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Conditions : </span>
                  <strong>{orderDetail?.promoCode?.conditions ? orderDetail?.promoCode?.conditions : "-"}</strong>
                </div>
              </>
            ) : (
              <div className="text-muted">No Promo Code Applied</div>
            )}
          </div>

          {/* Logistics */}
          {orderDetail?.logistics && (
            <div className="border p-4 rounded bg-light mb-4" style={{ borderRadius: "5px" }}>
              <h5 className="mb-3 fw-bold">LOGISTICS DETAILS</h5>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tracking Link:</span>
                <a href={orderDetail?.logistics?.trackingLink} target="_blank" rel="noopener noreferrer" className="text-decoration-underline">
                  {orderDetail?.logistics?.trackingLink ? "Track Order" : "Not Available"}
                </a>
              </div>
              <div className="mt-3 text-muted">
                <strong>Status: </strong>
                <span className={orderDetail?.logistics?.status === "Delivered" ? "text-success" : "text-danger"}>
                  {orderDetail?.logistics?.status}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default connect(null, { getOrderDetail, orderUpdate })(OrderDetail);


// import React, { useEffect, useState } from "react";
// import { connect, useDispatch, useSelector } from "react-redux";
// import { getOrderDetail, orderUpdate } from "../../store/order/order.action";
// import { getDefaultCurrency } from "../../store/currency/currency.action";
// import { useLocation, useNavigate } from "react-router-dom";
// import defaultImage from "../../../assets/images/default.jpg";
// import { getSetting } from "../../store/setting/setting.action";

// const OrderDetail = () => {
//   const { orderDetail } = useSelector((state) => state.order);
//   console.log("orderDetail--", orderDetail);

//   const { defaultCurrency } = useSelector((state) => state.currency);
//   const { setting } = useSelector((state) => state.setting);
//   console.log("setting--", setting);

//   const { state } = useLocation();
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   useEffect(() => {
//     dispatch(getSetting());
//     dispatch(getOrderDetail(state?._id || state));
//     dispatch(getDefaultCurrency());
//   }, [dispatch, state]);

//   // Utility function for fallback images
//   const handleImgError = (e) => {
//     e.target.onerror = null;
//     e.target.src = defaultImage;
//   };

//   // Utility to build badge class for status
//   const getBadgeClass = (status) => {
//     switch (status?.toLowerCase()) {
//       case "delivered": return "badge bg-success";
//       case "pending": return "badge bg-warning text-dark";
//       case "confirmed": return "badge bg-primary";
//       case "out for delivery": case "out_of_delivery":
//         return "badge bg-info";
//       case "cancel": case "cancelled":
//         return "badge bg-danger";
//       default:
//         return "badge bg-secondary";
//     }
//   };

//   // Helper to display "-" if value falsy
//   const show = (val) => val ? val : "-";

//   return (
//     <>
//       <div className="container mt-4" style={{ maxWidth: "1555px" }}>
//         <div className="d-flex justify-content-between align-items-center mb-4">
//           <h4 className="fw-bold">Order Details</h4>
//           <button onClick={() => navigate(-1)} className="btn btn-outline-danger rounded-pill px-4">
//             &larr; Back
//           </button>
//         </div>

//         {/* --- Order Summary --- */}
//         <div className="row">
//           <div className="col-xl-8 col-lg-7 pb-3">
//             <div className="card mb-4" style={{ borderRadius: "8px" }}>
//               <div className="card-body">
//                 <h6 className="card-title text-primary mb-3">Order Summary </h6>
//                 <div className="row">
//                   <div className="col-md-6 mb-2">
//                     <div className="mb-1"><span className="form-label text-muted ">Order ID :</span> <strong>{show(orderDetail?.orderId)}</strong></div>
//                     <div className="mb-1"><span className="form-label text-muted">Date :</span> {show(orderDetail?.createdAt.split("T")[0])}</div>
//                     <div className="mb-1">
//                       <span className="form-label text-muted">Time :</span>{" "}
//                       {orderDetail?.createdAt && (() => {
//                         const time = new Date(`1970-01-01T${orderDetail.createdAt.split("T")[1]}`);
//                         return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
//                       })()}
//                     </div>
//                     <div className="mb-1"><span className="form-label text-muted">Items:</span> {show(orderDetail?.totalItems)}</div>
//                     <div className="mb-1"><span className="form-label text-muted">Total Quantity:</span> {show(orderDetail?.totalQuantity)}</div>
//                     <div className=" d-flex align-items-center"><span className="form-label text-muted mt-1">Status:</span>
//                       <span  className={`ms-1 ${getBadgeClass(orderDetail?.items?.[0]?.status)}`}>{show(orderDetail?.items?.[0]?.status)}</span>
//                     </div>
//                   </div>
//                   <div className="col-md-6 mb-2">
//                     <div className="mb-1"><span className="form-label text-muted">Payment Gateway:</span> {show(orderDetail?.paymentGateway)}</div>
//                     <div className="mb-1"><span className="form-label text-muted">Payment Status:</span> {show(orderDetail?.paymentStatus === 1 ? "Paid" : "Cash On Delivery")}</div>
//                     <div className="mb-1"><span className="form-label text-muted">Discount:</span> {setting?.currency?.symbol}{show(orderDetail?.discount)}</div>
//                     <div className="mb-1"><span className="form-label text-muted">Shipping Charges:</span> {setting?.currency?.symbol}{show(orderDetail?.totalShippingCharges)}</div>
//                     <div className="mb-1"><span className="form-label text-muted">Final Total:</span> <strong>{setting?.currency?.symbol}{show(orderDetail?.finalTotal)}</strong></div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* --- Product Listing --- */}
//             <div className="card mb-4" style={{ borderRadius: "8px" }}>
//               <div className="card-body">
//                 <h6 className="card-title text-success mb-3">Products</h6>
//                 {orderDetail?.items?.map((item, idx) => (
//                   <div key={idx} className="row align-items-center mb-3 pb-2 border-bottom">
//                     <div className="col-3 text-center">
//                       <img
//                         src={item?.productId?.mainImage}
//                         width={80}
//                         height={90}
//                         className="rounded"
//                         alt={item?.productId?.productName}
//                         style={{ objectFit: "cover" }}
//                         onError={handleImgError}
//                       /><br />
//                       <span className="p-1 rounded-pill bg-info mt-1 d-flex justify-content-center text-white">{show(item?.productId?.productName)}</span>
//                     </div>
//                     <div className="col-9">
//                       <div className="mb-1"><strong>Qty:</strong> {show(item?.productQuantity)}</div>
//                       <div className="mb-1"><strong>Price:</strong> {setting?.currency?.symbol}{show(item?.purchasedTimeProductPrice)}</div>
//                       <div className="mb-1"><strong>Item Discount:</strong> {show(item?.itemDiscount)}</div>
//                       <div className="mb-1"><strong>Shipping Charges:</strong> {setting?.currency?.symbol}{show(item?.purchasedTimeShippingCharges)}</div>
//                       <div className="mb-1"><strong>Commission Per Product:</strong> {show(item?.commissionPerProductQuantity)}</div>
//                       <div className="mb-1"><strong>Delivery Date:</strong> {show(item?.date)}</div>
//                       {/* <div className="mb-1"><strong>Delivery Service:</strong> {show(item?.deliveredServiceName)}</div> */}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>


//             {/* Attributes Section */}
//             <div>
//               <h5 className="mb-3">Attributes ({orderDetail?.items?.[0]?.attributesArray?.length || 0})</h5>
//               <div className="d-flex flex-wrap gap-3">
//                 {orderDetail?.items?.[0]?.attributesArray?.map((att, idx) => (
//                   <div
//                     className="p-3"
//                     key={idx}
//                     style={{
//                       minWidth: 270,
//                       background: "#fff",
//                       borderRadius: 12,
//                       boxShadow: "0 2px 10px #0001",
//                       position: "relative"
//                     }}
//                   >
//                     {/* Title */}
//                     <div className="fw-bold mb-2">{att.name}</div>
//                     {/* fieldType 1 or 2: show min/max */}
//                     {(att.fieldType === 1 || att.fieldType === 2) ? (
//                       <div className="d-flex justify-content-between">
//                         <div>
//                           <div className="text-muted small">Max Length</div>
//                           <div>{att.maxLength}</div>
//                         </div>
//                         <div>
//                           <div className="text-muted small">Min Length</div>
//                           <div>{att.minLength}</div>
//                         </div>
//                       </div>
//                     ) : null}
//                     {/* fieldType 4,5,6: show value tags */}
//                     {(att.fieldType === 4 || att.fieldType === 5 || att.fieldType === 6) && att.values && Array.isArray(att.values) ? (
//                       <div>
//                         <div className="text-muted small mb-1">Values</div>
//                         <div className="d-flex flex-wrap gap-2">
//                           {att.values.map((val, vi) => (
//                             <span
//                               key={vi}
//                               className="badge bg-light text-dark border"
//                               style={{ padding: "8px 12px", borderRadius: 8, fontWeight: 500, fontSize: 14 }}
//                             >
//                               {typeof val === "object" && val !== null
//                                 ? (val.value || val.name || Object.values(val)[0])
//                                 : String(val)}
//                             </span>
//                           ))}
//                         </div>
//                       </div>
//                     ) : null}
//                   </div>
//                 ))}
//               </div>
//             </div>



//           </div>

//           {/* --- Order details, Address, Seller, Logistics --- */}
//           <div className="col-xl-4 col-lg-5 pb-3">

//             {/*--- Shipping Address ---*/}
//             <div className="card mb-4" style={{ borderRadius: "8px" }}>
//               <div className="card-body">
//                 <h6 className="card-title text-success mb-3">Shipping Address</h6>
//                 {/* If object */}
//                 {orderDetail?.shippingAddress ? (
//                   <>
//                     <div className="mb-1"><strong>Name:</strong> {show(orderDetail?.shippingAddress?.name)}</div>
//                     <div className="mb-1"><strong>Address:</strong> {show(orderDetail?.shippingAddress?.address)}</div>
//                     <div className="mb-1"><strong>City:</strong> {show(orderDetail?.shippingAddress?.city)}</div>
//                     <div className="mb-1"><strong>Pincode:</strong> {show(orderDetail?.shippingAddress?.zipCode)}</div>
//                     <div className="mb-1"><strong>Country:</strong> {show(orderDetail?.shippingAddress?.country)}</div>
//                     <div className="mb-1"><strong>State:</strong> {show(orderDetail?.shippingAddress?.state)}</div>
//                   </>
//                 ) : (
//                   <div className="text-muted">No address found.</div>
//                 )}
//               </div>
//             </div>

//             {/*--- Seller Info ---*/}
//             <div className="card mb-4" style={{ borderRadius: "8px" }}>
//               <div className="card-body">
//                 <h6 className="card-title text-info mb-3">Seller Info</h6>
//                 <>
//                   <div><strong>Name:</strong> {orderDetail?.items?.[0]?.sellerId?.firstName} {orderDetail?.items?.[0]?.sellerId?.lastName}</div>
//                   {/* <div><strong>Seller ID:</strong> {show(orderDetail?.items?.[0]?.sellerId)}</div> */}
//                 </>
//               </div>
//             </div>

//             {/*--- Logistics ---*/}
//             <div className="card mb-4" style={{ borderRadius: "8px" }}>
//               <div className="card-body">
//                 <h6 className="card-title text-warning mb-3">Logistics</h6>
//                 {orderDetail?.items?.[0]?.trackingLink && (
//                   <>
//                     <div className="mb-1"><strong>Tracking Link: </strong>
//                       <a href={orderDetail?.items?.[0]?.trackingLink} target="_blank" rel="noopener noreferrer">Track Package</a>
//                     </div>
//                     <div className="mb-1"><strong>Tracking ID:</strong> {show(orderDetail?.items?.[0]?.trackingId)}</div>
//                     <div className="mb-1 d-flex justify-content-start  align-items-center">
//                       <strong className="me-2">Status:</strong>{" "}
//                       <span className={getBadgeClass(orderDetail?.items?.[0]?.status)}>
//                         {show(orderDetail?.items?.[0]?.status)}
//                       </span>
//                     </div>
//                   </>
//                 )}
//                 {!orderDetail?.items?.[0]?.trackingLink && <div className="text-muted">No logistics/tracking data.</div>}
//               </div>
//             </div>

//             {/*--- Promo Code ---*/}
//             <div className="card mb-4" style={{ borderRadius: "8px" }}>
//               <div className="card-body">
//                 <h6 className="card-title text-danger mb-3">Promo Code</h6>
//                 {orderDetail?.promoCode ? (
//                   <div>
//                     <div className="mb-1"><strong>Promo Code :</strong> {orderDetail?.promoCode?.promoCode}</div>
//                     <div className="mb-1"><strong>Discount :</strong> {orderDetail?.promoCode?.discountAmount}</div>
//                     <div className="mb-1"><strong>Type :</strong> {orderDetail?.promoCode?.discountType}</div>
//                     <div className="mb-1"><strong>Conditions :</strong> {orderDetail?.promoCode?.conditions}</div>
//                   </div>
//                 ) : (
//                   <div className="text-muted">No promo code applied.</div>
//                 )}
//               </div>
//             </div>






//           </div>
//         </div>

//         {/* Styles */}
//         <style>
//           {`
//             .card { box-shadow: 0 2px 10px rgba(0,0,0,.1); border: none; }
//             .card-title { font-weight: 600; font-size: 1.05rem; border-bottom:2px solid #f1f3f4; margin-bottom:1rem; padding-bottom:.4rem;}
//             @media (max-width: 768px) { .col-xl-8, .col-xl-4, .col-lg-7, .col-lg-5 { flex: 0 0 100%; max-width: 100%; }}
//           `}
//         </style>
//       </div>
//     </>
//   );
// };

// export default connect(null, { getOrderDetail, orderUpdate })(OrderDetail);
