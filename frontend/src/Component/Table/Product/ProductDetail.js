import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector, connect } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { Rating } from "react-simple-star-rating";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {
  getProductDetail,
  outOfStock,
  getProductReview,
} from "../../store/product/product.action";
import { getDefaultCurrency } from "../../store/currency/currency.action";
import Pagination from "../../extra/Pagination";
import formatImageUrl from "../../extra/functions"; // Import your formatting function
import defaultImage from "../../../assets/images/default.jpg";

const ProductDetail = (props) => {
  const { productDetail, review } = useSelector((state) => state.product);
  console.log("productDetail++++++", productDetail);

  const { defaultCurrency } = useSelector((state) => state.currency);
  const location = useLocation();
  const isProductDetailPage = location.pathname === "/admin/productDetail";
  const { state } = useLocation();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const swiperRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [size, setSize] = useState(10);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedSleeve, setSelectedSleeve] = useState(null);

  useEffect(() => {
    // dispatch(getProductDetail(state));
    dispatch(getDefaultCurrency());
  }, [state?._id, dispatch]);

  useEffect(() => {
    dispatch(getProductReview(state?._id, currentPage, size));
  }, [state?._id, currentPage, size, dispatch]);

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const val = parseInt(event, 10);
    setRowsPerPage(val);
    setSize(val);
    setCurrentPage(1);
  };

  // Image error handler
  const handleImageError = (e) => {
    // e.target.src = formatImageUrl(null); // This will return the default image
    e.currentTarget.onerror = null;
    e.currentTarget.src = defaultImage;
  }


  return (
    <div style={{ background: "#f4f5f7", minHeight: "100vh", padding: "2rem", backgroundColor: "#F8F7FA" }}>
      <div className="d-flex justify-content-between align-items-center" style={{ marginTop: "-25px" }}>
        <div className="headname" style={{ marginLeft: "0px" }}>Product Detail</div>
        <div>
          <button
            onClick={() => navigate(-1)}
            className="btn rounded-pill px-4 mb-4"
            style={{ border: "1px solid #b93160", marginLeft: "10px", backgroundColor: "#b93160", color: "white" }}
          >
            ← Back
          </button>
        </div>
      </div>

      <div className="bg-white shadow-lg p-4" style={{ borderRadius: "5px" }}>
        {/* Product Section - Image Left, Info Right */}
        <div className="row">
          {/* LEFT BOX: Images */}
          <div className="col-12 col-xl-6 col-xxl-4">
            <div className="bg-white shadow-none rounded-4 h-100">
              <div className="row g-3" style={{ height: "100%" }}>
                {/* LEFT: Swiper Thumbnail (Vertical) */}
                <div className="col-3">
                  <Swiper
                    direction="vertical"
                    spaceBetween={10}
                    slidesPerView={4}
                    navigation
                    modules={[Navigation]}
                    style={{ height: "350px", width: "80px" }}
                  >
                    {state?.images?.map((img, index) => (
                      <SwiperSlide key={index}>
                        <img
                          src={formatImageUrl(img) || defaultImage}
                          alt={`thumb-${index}`}
                          onError={handleImageError}
                          onClick={() => swiperRef.current?.slideTo(index)}
                          style={{
                            width: "100%",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "8px",
                            // border: "2px solid #ccc",
                            cursor: "pointer",
                            transition: "border 0.1s ease-in"
                          }}

                          onMouseOver={(e) => (e.currentTarget.style.border = "2px solid #b93160")}
                          onMouseOut={(e) => (e.currentTarget.style.border = "2px solid #ccc")}

                        />
                      </SwiperSlide>
                    )) || []}
                  </Swiper>
                </div>

                {/* RIGHT: Main Product Image */}
                <div className="col-9">
                  <div className="d-flex h-100">
                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={10}
                      slidesPerView={1}
                      onSwiper={(swiper) => (swiperRef.current = swiper)}
                      style={{ height: "600px", borderRadius: "12px", overflow: "hidden" }}
                    >
                      {state?.images?.map((img, index) => (
                        <SwiperSlide key={index}>
                          <img
                            src={formatImageUrl(img) || defaultImage}
                            alt={`image-${index}`}
                            onError={handleImageError}
                            className="w-100"
                            style={{
                              objectFit: "cover",
                              borderRadius: "12px",
                              height: "75%"
                            }}
                          />
                        </SwiperSlide>
                      )) || [
                          // Fallback if no images exist
                          <SwiperSlide key="default">
                            <img
                              src={formatImageUrl(null) || defaultImage}
                              alt="default-image"
                              className="w-100 h-100"
                              style={{
                                objectFit: "cover",
                                borderRadius: "12px"
                              }}

                            />
                          </SwiperSlide>
                        ]}
                    </Swiper>
                    <div
                      className="d-none d-sm-block"
                      style={{
                        width: '1.5px',        // 1~2px recommended
                        minHeight: '100%',
                        background: '#e0e0e0', // Or #f0f0f0 for even more subtle
                        borderRadius: '1px',
                        margin: '0 1.25rem',   // Optional: adjust space between boxes
                      }}
                    ></div>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* RIGHT BOX: Product Info */}
          <div className="col-12 col-xl-6 col-xxl-8">

            <div className="bg-white shadow-md rounded-4 h-100">
              <h4 className="mb-2 text-dark" style={{ textTransform: "uppercase" }}>
                {state?.productName}
              </h4>
              <div className="d-flex gap-4 mb-3">
                <div className="mt-1">
                  <p className="text-muted mb-1">Product Code: <strong>{state?.productCode}</strong></p>
                  <p className="text-muted mb-1">Category: {state?.category?.name}</p>

                  <div className="d-flex flex-wrap gap-2 align-items-center mb-2">
                    {/* <div className="text-muted fs-16">
                      <Rating
                        initialValue={state?.rating[0]?.avgRating}
                        readonly={true}
                        allowFraction
                      /> */}
                    {/* </div> */}
                    {/* <div className="text-white fw-normal">
                      {"(" + state?.review + " Customer Review )"}
                    </div> */}
                  </div>
                </div>
                <div>
                  <p className="text-muted mb-1">Seller: {state?.seller?.firstName}</p>
                  <span
                    className={`badge ${state?.isOutOfStock ? "bg-danger" : "bg-success"} mb-3`}
                    style={{ padding: "0.4rem 1rem", fontSize: "0.85rem" }}
                  >
                    {state?.isOutOfStock ? "Out of Stock" : "In Stock"}
                  </span>
                </div>
              </div>

              <div className="row g-3">
                {[
                  {
                    label: "Price",
                    value: state?.price,
                    icon: "bi-cash",
                    iconColor: "#28a745",
                    bg: "#DCF6E8"
                  },
                  {
                    label: "Shipping",
                    value: state?.shippingCharges,
                    icon: "bi-truck",
                    iconColor: "#0d6efd",
                    bg: "#E9F0FB"
                  },
                  {
                    label: "Sold",
                    value: state?.sold,
                    icon: "bi-graph-up",
                    iconColor: "#ffc107",
                    bg: "#FFF7E6"
                  },
                  {
                    label: "Tag",
                    value: state?.seller?.businessTag,
                    icon: "bi-tag",
                    iconColor: "#dc3545",
                    bg: "#FDECEC"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="col-md-5">
                    <div
                      className="d-flex align-items-center gap-3 rounded-4 p-3 shadow-sm"
                      style={{ backgroundColor: item.bg, minHeight: "70px" }}
                    >
                      <div
                        className="d-flex justify-content-center align-items-center rounded-circle"
                        style={{
                          width: "40px",
                          height: "40px",
                          backgroundColor: "#fff",
                          border: `2px solid ${item.iconColor}`
                        }}
                      >
                        <i className={`bi ${item.icon}`} style={{ color: item.iconColor, fontSize: "1.2rem" }}></i>
                      </div>

                      <div>
                        <div className="fw-bold text-dark" style={{ fontSize: "14px" }}>{item.label}</div>
                        <div style={{ fontSize: "15px" }}>
                          <span className="text-dark">
                            {item.label === "Tag" || item.label === "Sold" ? item.value : `${defaultCurrency?.symbol}${item.value}`}
                          </span>

                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="my-4">
                <h6 className="fw-bold">Description</h6>
                <p className="text-secondary small" style={{ wordBreak: "break-all" }}>{state?.description}</p>
              </div>

              <div className="row">
                <h6 className="fw-bold">Attributes</h6>
                {state?.attributes?.map((attr, i) => {
                  const titleMap = {
                    colors: "Color",
                    size: "Select Size",
                    sleeves: "Select Sleeve",
                  };

                  return (
                    <div className="col-6 mb-4" key={attr._id}>
                      {/* Attribute name ke sath min/maxLength dikhana */}
                      <div className="d-flex align-items-center">
                        {/* <h6 >{i + 1 + ". "}</h6> */}
                        <h6 className="mb-2">
                          {titleMap[attr.name] || attr.name}
                          {/* Min/Max agar mile toh display karo */}
                          {/* {(attr.minLength || attr.maxLength) && (
                            <span style={{ fontWeight: "normal", marginLeft: 8, color: "#777", fontSize: "13px" }}>
                              {attr.minLength && (
                                <> Min: <b>{attr.minLength}</b> </>
                              )}
                              {attr.maxLength && (
                                <> Max: <b>{attr.maxLength}</b> </>
                              )}
                            </span>
                          )} */}
                        </h6>
                      </div>
                      {/* Agar values array ho toh buttons render karo */}
                      {Array.isArray(attr.values) && attr.values.length > 0 && (
                        <div className="d-flex flex-wrap gap-2">
                          {attr.values.map((val, i) => {
                            const isSelected =
                              attr.name === "colors"
                                ? selectedColor === val
                                : attr.name === "sleeves"
                                  ? selectedSleeve === val
                                  : selectedSize === val;

                            const handleClick = () => {
                              if (attr.name === "colors") setSelectedColor(val);
                              else if (attr.name === "sleeves") setSelectedSleeve(val);
                              else setSelectedSize(val);
                            };

                            const style =
                              attr.name === "colors" || attr.name === "Colors"
                                ? {
                                  width: "20px",
                                  height: "20px",
                                  borderRadius: "50%",
                                  border: isSelected ? "1px solid #000" : "1px solid #ccc",
                                  backgroundColor: val,
                                  cursor: "pointer",
                                  outline: "none",
                                }
                                : {
                                  padding: "6px 16px",
                                  border: isSelected ? "2px solid #000" : "1px solid #ccc",
                                  borderRadius: "6px",
                                  backgroundColor: isSelected ? "#000" : "#fff",
                                  color: isSelected ? "#fff" : "#000",
                                  fontWeight: "500",
                                  fontSize: "14px",
                                  cursor: "pointer",
                                  minWidth: "45px",
                                };

                            return (
                              <button key={i} style={style}>
                                {attr.name === "colors" || attr.name === "Colors" ? "" : val}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {isProductDetailPage && (
                < div className="mb-4">
                  <h6 className="fw-bold mb-3">Sale Information</h6>
                  <div className="row g-3">
                    <div className="col-md-4">
                      <div className="p-3 border rounded-3 h-100" style={{ backgroundColor: "#f8f9fa" }}>
                        <small className="text-muted d-block mb-1">Sale Type</small>
                        <div className="fw-semibold">
                          {state?.productSaleType === 1 ? "🛒 Buy Now" :
                            state?.productSaleType === 2 ? "🏷️ Auction" :
                              state?.productSaleType === 3 ? "🚫 Not for Sale" :
                                <span className="text-muted">Not specified</span>
                          }
                        </div>
                      </div>
                    </div>

                    {/* <div className="col-md-4">
                    <div className="p-3 border rounded-3 h-100" style={{ backgroundColor: "#f8f9fa" }}>
                      <small className="text-muted d-block mb-1">Allow Offer</small>
                      <div className="d-flex align-items-center gap-2">
                        <label className="switch">
                          <input
                            type="checkbox"
                            checked={!!state?.allowOffer}
                            disabled
                            readOnly
                          />
                          <span className="slider round"></span>
                        </label>
                        <span className="fw-semibold">{state?.allowOffer ? "On" : "Off"}</span>
                      </div>
                    </div>
                  </div> */}

                    <div className="col-md-4">
                      <div className="p-3 border rounded-3 h-100" style={{ backgroundColor: "#f8f9fa" }}>
                        <small className="text-muted d-block mb-1">Min. Offer Price ({defaultCurrency?.symbol}) : </small>
                        <div className="fw-semibold">
                          {state?.minimumOfferPrice ?? '-'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* -- AUCTION FIELDS if applicable -- */}
              {state?.productSaleType === 2 && (
                <div className="border rounded p-3 mt-4">
                  <h5 className="mb-3">Auction</h5>

                  {/* Enable Auction */}
                  {/* <div className="mb-3 d-flex align-items-center gap-2">
                    <span className="fw-bold">Auction : </span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={!!state?.enableAuction}
                        disabled
                        readOnly
                      />
                      <span className="slider round"></span>
                    </label>
                    <span className="ms-2">{state?.enableAuction ? "On" : "Off"}</span>
                  </div> */}

                  {/* Auction Starting Price */}
                  <div className="mb-3 d-flex align-items-center gap-2">
                    <span className="fw-bold">Auction Starting Price ({defaultCurrency?.symbol}) : </span>
                    <div>{state?.auctionStartingPrice ?? '-'}</div>
                  </div>

                  {/* Enable Reserve Price */}
                  {/* <div className="mb-3 d-flex align-items-center gap-2">
                    <span className="fw-bold">Reserve Price : </span>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={!!state?.enableReservePrice}
                        disabled
                        readOnly
                      />
                      <span className="slider round"></span>
                    </label>
                    <span className="ms-2">{state?.enableReservePrice ? "On" : "Off"}</span>
                  </div> */}

                  {/* Reserve Price */}
                  <div className="mb-3  d-flex align-items-center gap-2">
                    <span className="fw-bold">Reserve Price ({defaultCurrency?.symbol}) : </span>
                    <div>{state?.reservePrice ?? '-'}</div>
                  </div>

                  {/* Auction Duration */}
                  <div className="mb-3 d-flex align-items-center gap-2">
                    <span className="fw-bold">Auction Duration (days) : </span>
                    <div>{state?.auctionDuration ?? '-'}</div>
                  </div>

                  {/* Schedule Time */}
                  <div className="d-flex align-items-center gap-2">
                    <span className="fw-bold ">Auction Schedule Time : </span>
                    <div>
                      {state?.scheduleTime
                        ? new Date(state.scheduleTime).toLocaleString()
                        : '-'}
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className=" py-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                  <h5 className="mb-0 fw-bold">Customer Reviews</h5>
                  <span className="" style={{ fontSize: "14px", backgroundColor: "#b93160", color: "white", padding: "4px 10px", borderRadius: "5px" }}>{review?.length || 0} Reviews</span>
                </div>

                {review?.length > 0 ? (
                  <div className="row g-3">
                    {review.map((r, i) => (
                      <div className="col-12" key={i}>
                        <div className="card border-0 shadow-sm">
                          <div className="card-body p-3">
                            <div className="d-flex gap-3">
                              <img
                                src={formatImageUrl(r.userImage)}
                                alt="user"
                                onError={handleImageError}
                                style={{
                                  width: "48px",
                                  height: "48px",
                                  borderRadius: "50%",
                                  objectFit: "cover"
                                }}
                              />
                              <div className="flex-grow-1">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <div className="fw-semibold">{r.firstName} {r.lastName}</div>
                                    <small className="text-muted">{r.time}</small>
                                  </div>
                                  <Rating initialValue={r.rating} readonly allowFraction size={16} />
                                </div>
                                <p className="mb-0 small text-secondary">{r.review}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-5">
                    <div className="text-muted">
                      <i className="bi bi-chat-square-text" style={{ fontSize: "3rem" }}></i>
                      <p className="mt-2">No reviews yet</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      </div>
    </div >
  );
};

export default connect(null, {
  getProductDetail,
  outOfStock,
  getProductReview,
})(ProductDetail);
