import {
  getUserProfile,
  userIsBlock,
  getUserOrder,
  getUserProducts,
} from "../../store/user/user.action";
import { connect, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getDefaultCurrency } from "../../store/currency/currency.action";

const UserProfile = (props) => {
  const { userProfile, order, totalOrder, userProducts } = useSelector((state) => state.user);
  const { defaultCurrency } = useSelector((state) => state.currency);
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [size, setSize] = useState(10);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [status, setStatus] = useState("All");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");

  useEffect(() => {
    dispatch(getUserProfile(state));
    dispatch(getDefaultCurrency());
  }, [dispatch, state]);

  useEffect(() => {
    dispatch(getUserOrder(state, currentPage, size, status));
  }, [dispatch, state, currentPage, size, status]);

  useEffect(() => {
    if (userProfile?.isSeller && userProfile?.seller) {
      dispatch(getUserProducts(userProfile.seller));
    }
  }, [dispatch, userProfile?.isSeller, userProfile?.seller]);

  useEffect(() => {
    setData(order);
  }, [order]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = (id) => {
    navigate("/admin/order/orderDetail", {
      state: id,
    });
  };

  return (
    <div className="container-fluid px-4 mt-4">
      <div className="row justify-content-between align-items-center">
        {/* Back Button */}
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <p className="text-semibold" style={{ fontSize: "24px" }}>
              Customer ID #{userProfile?.uniqueId}
            </p>
            <p className="text-muted" style={{ marginTop: "-12px" }}>
              {userProfile?.date
                ? new Date(userProfile.date).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: true,
                })
                : "-"}
            </p>
          </div>
          <div className="col-auto">
            <button
              onClick={() => navigate(-1)}
              className="btn rounded-pill px-4 mb-4"
              style={{ border: "1px solid #b93160", marginLeft: "8px" , backgroundColor: "#b93160", color: "#fff"}}
            >
              ← Back
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        {/* User Profile Card */}
        <div className="col-xl-3 col-md-12 mb-4">
          <div
            className="card user-profile shadow-md"
            style={{
              borderRadius: "5px 5px 5px 5px",
              backgroundColor: "#fff",
            }}
          >
            <div className="card-body text-center">
              <div className="avatar-container">
                <div className="avatar">
                  <img
                    src={userProfile?.image || "/dummy.png"}
                    className="border-primary "
                    width={100}
                    height={100}
                    style={{ borderRadius: "20px" }}
                    alt=""
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/dummy.png";
                    }}
                  />

                </div>
                <h5 className="mt-3" style={{ color: "#333" }}>
                  {userProfile?.firstName} {userProfile?.lastName}
                </h5>
                <p className="text-muted">
                  Customer ID #{userProfile?.uniqueId}
                </p>
              </div>

              <div className="d-flex justify-content-center gap-5 mt-4">
                <div className="stat d-flex align-items-center gap-2">
                  <div
                    style={{
                      backgroundColor: "#FFE2E3",
                      width: "35px",
                      height: "35px",
                      borderRadius: "10px",
                    }}
                  >
                    <i
                      className="fa fa-users"
                      style={{ color: "#FF6266", marginTop: "10px" }}
                    ></i>
                  </div>
                  <div>
                    <p
                      className="fw-semibold"
                      style={{ color: "#000", marginBottom: "2px" }}
                    >
                      {userProfile?.followers}
                    </p>
                    <p
                      className="text-muted"
                      style={{ fontSize: "0.875rem" }}
                    >
                      Followers
                    </p>
                  </div>
                </div>
                <div className="stat d-flex align-items-center gap-2">
                  <div
                    style={{
                      backgroundColor: "#FFE2E3",
                      width: "35px",
                      height: "35px",
                      borderRadius: "10px",
                    }}
                  >
                    <i
                      className="fa fa-user-plus"
                      style={{ color: "#FF6266", marginTop: "10px" }}
                    ></i>
                  </div>
                  <div>
                    <p
                      className="fw-semibold"
                      style={{ color: "#000", marginBottom: "2px" }}
                    >
                      {userProfile?.following}
                    </p>
                    <p
                      className="text-muted"
                      style={{ fontSize: "0.875rem" }}
                    >
                      Following
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-start" style={{ color: "#333" }}>
                  Details
                </h4>
                <hr />
                <ul className="list-unstyled text-start" style={{ color: "#555" }}>
                  <li><strong>Username: </strong>@{userProfile?.firstName}</li>
                  <li><strong>Email: </strong>{userProfile?.email}</li>
                  <li><strong>DOB: </strong>{userProfile?.dob}</li>
                  <li><strong>Gender: </strong>{userProfile?.gender}</li>
                  <li><strong>Contact: </strong>{userProfile?.mobileNumber || "-"}</li>
                  <li><strong>Location: </strong>{userProfile?.location}</li>
                  <li><strong>Seller: </strong>{userProfile?.isSeller ? "Yes" : "No"}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Order / Products Table */}
        <div className="col-xl-9 col-md-12">
          <div className="card shadow-md" style={{ borderRadius: "5px" }}>
            <div className="card-header bg-white">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setActiveTab("orders")}
                    style={{
                      borderRadius: "5px",
                      padding: "6px 20px",
                      background: activeTab === "orders" ? "#b93160" : "transparent",
                      color: activeTab === "orders" ? "#fff" : "#333",
                      border: activeTab === "orders" ? "1px solid #b93160" : "1px solid #ddd",
                      fontWeight: 500,
                    }}
                  >
                    Orders
                  </button>
                  {userProfile?.isSeller && userProfile?.seller && (
                    <button
                      type="button"
                      className="btn"
                      onClick={() => setActiveTab("products")}
                      style={{
                        borderRadius: "5px",
                        padding: "6px 20px",
                        background: activeTab === "products" ? "#b93160" : "transparent",
                        color: activeTab === "products" ? "#fff" : "#333",
                        border: activeTab === "products" ? "1px solid #b93160" : "1px solid #ddd",
                        fontWeight: 500,
                      }}
                    >
                      Products ({userProducts?.length || 0})
                    </button>
                  )}
                </div>
                {activeTab === "orders" && (
                  <div className="col-auto position-relative">
                    <div className="dropdown">
                      <button
                        type="button"
                        className="btn btnnewPrime dropdown-toggle"
                        aria-expanded="false"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        style={{ borderRadius: "5px", padding: "8px 40px", background: "#fff", marginLeft: "15px" }}
                      >
                        <span className="text-dark">{status || "Status"}</span>
                      </button>
                      {dropdownOpen && (
                        <ul
                          className="dropdown-menu show"
                          style={{
                            display: "block",
                            position: "absolute",
                            top: "100%",
                            zIndex: 1000,
                          }}
                        >
                          {[
                            "Pending",
                            "Confirmed",
                            "Out Of Delivery",
                            "Delivered",
                            "Cancelled",
                            "All",
                          ].map((statusOption) => (
                            <li key={statusOption} style={{ cursor: "pointer", padding: "0px 5px" }}>
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  setStatus(statusOption);
                                  setDropdownOpen(false);
                                }}
                              >
                                {statusOption}
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div
              className="card-body p-0"
              style={{ overflowY: "auto", minHeight: "480px", display: activeTab === "orders" ? "block" : "none" }}
            >
              <table className="table table-hover table-striped">
                <thead className="sticky-top bg-light" style={{ zIndex: 1 }}>
                  <tr>
                    <th>No</th>
                    <th>Order Id</th>
                    <th>Items</th>
                    <th>Price ({defaultCurrency?.symbol})</th>
                    <th>Shipping Charge ({defaultCurrency?.symbol})</th>
                    <th className="" style={{ paddingLeft: "40px" }}>Payment Status</th>
                    <th>Order Status</th>
                  </tr>
                </thead>
                <tbody className="bg-light">
                  {data?.length > 0 ? (
                    data.map((mapData, orderIndex) => {
                      const itemCount = mapData.items.length;
                      return mapData.items.map((item, itemIndex) => (
                        <tr
                          key={`${mapData?.orderId}-${itemIndex}`}
                          onClick={() => handleOpen(mapData)}
                          style={{ cursor: "pointer" }}
                        >
                          {itemIndex === 0 && (
                            <>
                              <td rowSpan={itemCount}>{orderIndex + 1}</td>
                              <td rowSpan={itemCount}>{mapData?.orderId}</td>
                            </>
                          )}
                          <td className="align-middle d-flex align-items-center gap-2">
                            <img
                              src={item.productId?.mainImage}
                              width={45}
                              height={45}
                              alt="Item"
                              style={{ borderRadius: "8px" }}
                            />
                            <span>{item.productId?.productName}</span>
                          </td>
                          <td className="align-middle">₹{item.purchasedTimeProductPrice}</td>
                          <td className="align-middle">₹{item.purchasedTimeShippingCharges}</td>
                          <td
                            className="my-2 text-center"
                            style={{ maxWidth: "350px" }}
                          >
                            <div className=""

                            >
                              {(mapData?.paymentStatus ===
                                1 && (
                                  <span className="badge p-2" style={{ color: "#20bba0", backgroundColor: "#cbffeb", width: "200px" }}>
                                    Cash On Delivery
                                  </span>
                                )) ||
                                (mapData?.paymentStatus ===
                                  2 && (
                                    <span className="badge p-2" style={{ color: "#389d19", backgroundColor: "#b5ffb3", width: "200px" }}>
                                      Paid
                                    </span>
                                  )) ||
                                (mapData?.paymentStatus ===
                                  null && (
                                    <span className="badge p-2" style={{ color: "#389d19", width: "200px" }}>
                                      -
                                    </span>
                                  ))}

                            </div>
                          </td>
                          <td className="align-middle">
                            <span
                              className={`badge p-2 ${item.status === "Pending"
                                ? "badge-warning"
                                : item.status === "Confirmed"
                                  ? "badge-success"
                                  : item.status === "Cancelled"
                                    ? "badge-danger"
                                    : item.status === "Out Of Delivery"
                                      ? "badge-info"
                                      : "badge-secondary"
                                }`}
                            >
                              {item.status}
                            </span>
                          </td>
                        </tr>
                      ));
                    })
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center">
                        No Data Found!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              className="card-body p-0"
              style={{ overflowY: "auto", minHeight: "480px", display: activeTab === "products" ? "block" : "none" }}
            >
              <table className="table table-hover table-striped">
                <thead className="sticky-top bg-light" style={{ zIndex: 1 }}>
                  <tr>
                    <th>No</th>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price ({defaultCurrency?.symbol})</th>
                    <th>Stock</th>
                    <th>Sold</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody className="bg-light">
                  {userProducts?.length > 0 ? (
                    userProducts.map((product, index) => (
                      <tr key={product._id}>
                        <td className="align-middle">{index + 1}</td>
                        <td className="align-middle d-flex align-items-center gap-2">
                          <img
                            src={product.mainImage}
                            width={45}
                            height={45}
                            alt="Product"
                            style={{ borderRadius: "8px", objectFit: "cover" }}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "/dummy.png";
                            }}
                          />
                          <span>{product.productName}</span>
                        </td>
                        <td className="align-middle">{product.category?.name || "-"}</td>
                        <td className="align-middle">
                          {defaultCurrency?.symbol}{product.price ?? "-"}
                        </td>
                        <td className="align-middle">{product.stock ?? "-"}</td>
                        <td className="align-middle">{product.sold ?? 0}</td>
                        <td className="align-middle">
                          <span
                            className={`badge p-2 ${product.isOutOfStock
                              ? "badge-danger"
                              : product.isApprove
                                ? "badge-success"
                                : "badge-warning"
                              }`}
                          >
                            {product.isOutOfStock
                              ? "Out of stock"
                              : product.isApprove
                                ? "Active"
                                : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center">
                        This user has no products.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(null, { getUserProfile, userIsBlock, getUserOrder, getUserProducts })(UserProfile);
