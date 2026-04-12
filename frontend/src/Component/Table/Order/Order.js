import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import Table from "../../extra/Table";
import Button from "../../extra/Button";
import Title from "../../extra/Title";
import { connect, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getOrder } from "../../store/order/order.action";

import Pagination from "../../extra/Pagination";
import Searching from "../../extra/Searching";
import { OPEN_DIALOGUE } from "../../store/dialogue/dialogue.type";
import EditOrder from "./EditOrder";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import "react-loading-skeleton/dist/skeleton.css";
import EditInfo from "../../../assets/images/Edit.png";
import { ReactComponent as Cancel } from "../../../assets/images/cancel.svg"
import { ReactComponent as Delievered } from "../../../assets/images/deliever.svg";
import { ReactComponent as Edit } from "../../../assets/images/edit.svg";
import { getDefaultCurrency } from "../../store/currency/currency.action";
import Iconb from "../../extra/Iconb";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
// import CancelIcon from '@mui/icons-material/Cancel';
import GavelIcon from '@mui/icons-material/Gavel';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import formatImageUrl from "../../extra/functions";
import defaultImage from "../../../assets/images/default.jpg";
import { CancelOutlined } from "@mui/icons-material";
import { getSetting } from "../../store/setting/setting.action";
import { ReactComponent as PanddingIcon } from "../../../assets/images/pendingStatus.svg";
import { ReactComponent as ConfirmedIcon } from "../../../assets/images/confirmed.svg";
import { ReactComponent as CancelIcon } from "../../../assets/images/cancelIcon.svg";
import { ReactComponent as OutOfDeliverIcon } from "../../../assets/images/deliverIcon.svg";
import { ReactComponent as DeliveredIcon } from "../../../assets/images/deliverdProduct.svg";
import { ReactComponent as ManualAuctionPendingPayment } from "../../../assets/images/ManualAuctionPendingPayment.svg";
import { ReactComponent as ManualAuctionCancelled } from "../../../assets/images/ManualAuctionCancelled.svg";
import { ReactComponent as AuctionPendingPayment } from "../../../assets/images/AuctionPendingPayment.svg";
import { ReactComponent as AuctionCancelled } from "../../../assets/images/AuctionCancelled.svg";


const Order = (props) => {
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const [sendStatus, setSendStatus] = useState("");
  const { defaultCurrency } = useSelector((state) => state.currency);
  const { order, totalOrder } = useSelector((state) => state.order);
  console.log("order", order);
  
  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state) => state.dialogue
  );

  const { setting } = useSelector((state) => state.setting);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { state } = useLocation();

  useEffect(() => {
    dispatch(getSetting());
  }, [dispatch]);

  useEffect(() => {
    dispatch(getOrder(currentPage, size, status));
    dispatch(getDefaultCurrency())
  }, [dispatch, currentPage, size, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(order);
  }, [order]);

  //  pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event), 10);
    setSize(parseInt(event), 10);
    setCurrentPage(1);
  };

  const changeStatus = (value) => {
    console.log("value******", value);

    setStatus(value);
    setCurrentPage(1);
  };

  const handleOpen = (id) => {
    navigate("/admin/order/orderDetail", {
      state: id,
    });
  };
  // searching
  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  const disabledIconProps = {
    style: { opacity: 0.5, cursor: 'default' },
    onClick: undefined,
  };

  let date;

  const editOpenDialog = (data, mapData) => {
    setSendStatus(data?.status);
    dispatch({
      type: OPEN_DIALOGUE,
      payload: {
        data: {
          data,
          mapData,
        },
        type: "order",
      },
    });
  };
  return (
    <>
      <div className="mainSellerTable">
        <div className="sellerTable">

          <div className="col-12 headname">Order </div>
          <div className="sellerMain">
            <div className="tableMain">
              <div className="sellerHeader primeHeader">
                <div className="row">
                  <div className="col-2 ">
                    <div className="btn-group ms-2">
                      <button
                        type="button"
                        className="btn btnnewPrime dropdown-toggle"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                        style={{ borderRadius: "5px", padding: "8px 40px", background: "#fff", marginLeft: "-15px" }}
                      >
                        {status ? (
                          <span className="caret text-dark " >{status}</span>
                        ) : (
                          <span className="caret text-capitalize">Status</span>
                        )}
                      </button>
                      <ul className="dropdown-menu text-light">
                        <li style={{ cursor: "pointer", padding: "0px 5px" }}>
                          <a
                            className="dropdown-item"
                            href={() => false}
                            onClick={() => changeStatus('All')}

                          // onClick={() => setStatus("All")}
                          >
                            All
                          </a>
                        </li>

                        <li style={{ cursor: "pointer", padding: "0px 5px" }}>
                          <a
                            className="dropdown-item"
                            href={() => false}
                            onClick={() => changeStatus('Pending')}
                          // onClick={() => setStatus("Pending")}
                          >
                            Pending
                          </a>
                        </li>
                        <li style={{ cursor: "pointer", padding: "0px 5px" }}>
                          <a
                            className="dropdown-item"
                            href={() => false}
                            onClick={() => changeStatus('Confirmed')}

                          // onClick={() => setStatus("Confirmed")}
                          >
                            Confirmed
                          </a>
                        </li>
                        <li style={{ cursor: "pointer", padding: "0px 5px" }}>
                          <a
                            className="dropdown-item"
                            href={() => false}
                            onClick={() => changeStatus('Out Of Delivery')}

                          // onClick={() => setStatus("Out Of Delivery")}
                          >
                            Out Of Delivery
                          </a>
                        </li>
                        <li style={{ cursor: "pointer", padding: "0px 5px" }}>
                          <a
                            className="dropdown-item"
                            href={() => false}
                            onClick={() => changeStatus('Delivered')}

                          // onClick={() => setStatus("Delivered")}
                          >
                            Delivered
                          </a>
                        </li>
                        <li style={{ cursor: "pointer", padding: "0px 5px" }}>
                          <a
                            className="dropdown-item"
                            href={() => false}
                            onClick={() => changeStatus('Cancelled')}

                          // onClick={() => setStatus("Cancelled")}
                          >
                            Cancelled
                          </a>
                        </li>
                        <li style={{ cursor: "pointer", padding: "0px 5px" }}>
                          <a
                            className="dropdown-item"
                            href={() => false}
                            onClick={() => changeStatus('Manual Auction Pending Payment')}

                          // onClick={() => setStatus("Manual Auction Pending Payment")}
                          >
                            Manual Auction Pending Payment
                          </a>
                        </li>
                        <li style={{ cursor: "pointer", padding: "0px 5px" }}>
                          <a
                            className="dropdown-item"
                            href={() => false}
                            onClick={() => changeStatus('Manual Auction Cancelled')}

                          // onClick={() => setStatus(" Manual Auction Cancelled")}
                          >
                            Manual Auction Cancelled
                          </a>
                        </li>
                        <li style={{ cursor: "pointer", padding: "0px 5px" }}>
                          <a
                            className="dropdown-item"
                            href={() => false}
                            onClick={() => changeStatus('Auction Pending Payment')}

                          // onClick={() => setStatus("Auction Pending Payment")}
                          >
                            Auction Pending Payment
                          </a>
                        </li>
                        <li style={{ cursor: "pointer", padding: "0px 5px" }}>
                          <a
                            className="dropdown-item"
                            href={() => false}
                            onClick={() => changeStatus('Auction Cancelled')}

                          // onClick={() => setStatus("Auction Cancelled")}
                          >
                            Auction Cancelled
                          </a>
                        </li>

                      </ul>
                    </div>
                  </div>

                  <div className="col-10 ">
                    <Searching
                      type={`client`}
                      data={order}
                      setData={setData}
                      column={data}
                      onFilterData={handleFilterData}
                      serverSearching={handleFilterData}
                      button={true}
                      setSearchValue={setSearch}
                      searchValue={search}
                    />
                  </div>
                </div>
              </div>
              <div className="primeMain">
                <table
                  width="100%"
                  border
                  className="primeTable text-center"
                  style={{ maxHeight: "680px" }}
                >
                  <thead
                    className="sticky-top"
                    style={{ top: "-1px", zIndex: "1" }}
                  >
                    <tr>
                      <th className="fw-bold py-3">No</th>
                      <th className="fw-bold py-3" style={{ width: "330px" }}>Order Id</th>
                      <th className="fw-bold py-3" style={{ width: "330px" }}>User Info</th>
                      <th className="fw-bold py-3" style={{ width: "520px" }}>Items</th>
                      <th className="fw-bold py-3" style={{ width: "380px" }}>{`Price (${setting?.currency?.symbol || ' '})`}</th>
                      <th className="fw-bold py-3" style={{ width: "330px" }}>{`Shipping Charge (${setting?.currency?.symbol || ' '})`}</th>
                      <th className="fw-bold py-3" style={{ width: "330px" }}>{`Admin Commission (${setting?.currency?.symbol || ' '})`}</th>
                      <th className="fw-bold py-3" style={{ width: "330px" }}>Payment Status</th>
                      <th className="fw-bold py-3" style={{ width: "360px" }}>Order Status</th>
                      <th className="fw-bold py-3" style={{ width: "330px" }}>Edit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data?.length > 0 ? (
                      <>
                        {data.map((mapData, index) =>
                          mapData.items.map((item, itemIdx) => (
                            <tr key={`${mapData.orderId}-${item.productId?._id || itemIdx}`}>
                              {/* No */}
                              <td>
                                <span className="text-white">{(currentPage - 1) * rowsPerPage + index + 1}</span>
                              </td>
                              {/* Order Id */}
                              <td width="160px">
                                <span className="tableBoldFont orderId">
                                  <b
                                    className="fw-normal text-white orderIdText"
                                    onClick={() => handleOpen(mapData)}
                                    style={{ cursor: "pointer" }}
                                  >
                                    {mapData?.orderId}
                                  </b>
                                </span>
                              </td>
                              {/* User Info */}
                              <td style={{ width: "350px" }}>
                                <div>
                                  <span className="tableBoldFont">
                                    <b className="fw-normal text-white">
                                      {mapData?.userId?.firstName
                                        ? mapData.userId.firstName + " "
                                        : "EraShop "}
                                      {mapData?.userId?.lastName
                                        ? mapData.userId.lastName
                                        : "User"}
                                    </b>
                                  </span>
                                  <br />
                                  <span className="text-white fw-normal" style={{ whiteSpace: "nowrap" }}>
                                    uniqueId : ({mapData?.userId?.uniqueId ? mapData.userId.uniqueId : "-"})
                                  </span>
                                </div>
                              </td>
                              {/* Item/Image */}
                              <td style={{ width: "360px", minWidth: "200px" }}>
                                <div className="d-flex justify-content-center align-items-center">
                                  <img
                                    src={formatImageUrl(item.productId?.mainImage)}
                                    width={55}
                                    height={55}
                                    style={{
                                      borderRadius: "10px",
                                      margin: "5px",
                                      objectFit: "cover",
                                    }}
                                    alt="Product"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = defaultImage;
                                    }}
                                  />
                                  <div className="ms-3 text-start">
                                    <b className="fs-7 text-white">{item.productId?.productName}</b>
                                    <br />
                                    <span style={{ fontSize: "13px", color: "#000" }}>
                                      <b className="text-white">Quantity</b>: {item.productQuantity}
                                    </span>
                                    <br />
                                    <span style={{ fontSize: "13px", color: "#000" }}>
                                      <b className="text-white">Price</b>: {item.purchasedTimeProductPrice}
                                    </span>
                                  </div>
                                </div>
                              </td>
                              {/* Price ($) */}
                              <td style={{ width: "120px", textAlign: "center" }}>
                                <b className="fs-7 text-white">
                                  {item.purchasedTimeProductPrice * item.productQuantity}
                                </b>
                              </td>
                              {/* Shipping Charge ($) */}
                              <td style={{ width: "120px", textAlign: "center" }}>
                                <b className="fs-7 text-white">
                                  {item.purchasedTimeShippingCharges}
                                </b>
                              </td>
                              {/* Admin Commission ($) */}
                              <td style={{ width: "120px", textAlign: "center" }}>
                                <b className="fs-7 text-white">
                                  {item.commissionPerProductQuantity ? item.commissionPerProductQuantity : 0}
                                </b>
                              </td>
                              {/* Payment Status */}
                              <td style={{ width: "142px", textAlign: "center" }}>
                                <div className="boxCenter">
                                  {mapData.paymentStatus === 1 ? (
                                    <span className="p-2" style={{ color: "#138F00", background: "#CEFAC6", borderRadius: "9px", whiteSpace: "nowrap" }}>
                                      Cash On Delivery
                                    </span>
                                  ) : mapData.paymentStatus === 2 ? (
                                    <span className="p-2" style={{ color: "#00A3D5", background: "#E0F5FB", borderRadius: "9px" }}>


                                      Paid
                                    </span>
                                  ) : null}
                                </div>
                              </td>
                              {/* Order Status */}
                              <td style={{ width: "160px", textAlign: "center" }}>
                                <div className="boxCenter">
                                  {item.status === "Pending" && (
                                    <span className=" p-2" style={{ backgroundColor: "#e7eeff", color: "#165CFF", borderRadius: "10px", whiteSpace: "nowrap" }}>Pending</span>
                                  )}
                                  {item.status === "Confirmed" && (
                                    <span className="p-2" style={{ backgroundColor: "#CEFAC6", color: "#00A208", borderRadius: "10px", whiteSpace: "nowrap" }}>Confirmed</span>
                                  )}
                                  {item.status === "Cancelled" && (
                                    <span className="p-2" style={{ backgroundColor: "#FFE3E3", color: "#FF1010", borderRadius: "10px", whiteSpace: "nowrap" }}>Cancelled</span>
                                  )}
                                  {item.status === "Out Of Delivery" && (
                                    <span className="p-2" style={{ backgroundColor: "#FFE1EC", color: "#E90957", borderRadius: "10px", whiteSpace: "nowrap" }}>Out Of Delivery</span>
                                  )}
                                  {item.status === "Delivered" && (
                                    <span className="p-2" style={{ backgroundColor: "#FFF0DF", color: "#E77B00", borderRadius: "10px", whiteSpace: "nowrap" }}>Delivered</span>
                                  )}
                                  {item.status === "Manual Auction Pending Payment" && (
                                    <span className="p-2" style={{ backgroundColor: "#E7EEFF", color: "#165CFF", borderRadius: "10px", whiteSpace: "nowrap" }}>
                                      Manual Auction Pending Payment
                                    </span>
                                  )}
                                  {item.status === "Manual Auction Cancelled" && (
                                    <span className="p-2" style={{ backgroundColor: "#FFD2D2", color: "#FF1D1D", borderRadius: "10px", whiteSpace: "nowrap" }}>
                                      Manual Auction Cancelled
                                    </span>
                                  )}
                                  {item.status === "Auction Pending Payment" && (
                                    <span className="p-2" style={{ backgroundColor: "#E7EEFF", color: "#165CFF", borderRadius: "10px", whiteSpace: "nowrap" }}>
                                      Auction Pending Payment
                                    </span>
                                  )}
                                  {item.status === "Auction Cancelled" && (
                                    <span className="p-2" style={{ backgroundColor: "#FFD2D2", color: "#FF1D1D", borderRadius: "10px", whiteSpace: "nowrap" }}>Auction Cancelled</span>
                                  )}
                                </div>
                              </td>
                              {/* Edit/Actions */}
                              <td style={{ width: "140px", textAlign: "center" }}>
                                <span className="d-flex justify-content-center">
                                  {item.status === "Cancelled" ? (
                                    <Iconb
                                      newClass={`themeFont boxCenter userBtn fs-5`}
                                      btnIcon={<CancelIcon sx={{ color: '#737272' }} />}
                                      {...disabledIconProps}
                                    />
                                  ) : item.status === "Confirmed" ? (
                                    <Iconb
                                      newClass={`themeFont boxCenter userBtn fs-5`}
                                      btnIcon={<ConfirmedIcon sx={{ color: '#737272' }} />}
                                      isImage={true}
                                      onClick={() => editOpenDialog(item, mapData)}
                                    />
                                  ) : item.status === "Delivered" ? (
                                    <Iconb
                                      newClass={`themeFont boxCenter userBtn fs-5`}
                                      btnIcon={<DeliveredIcon sx={{ color: '#737272' }} />}
                                      {...disabledIconProps}
                                    />

                                  ) : item.status === "Manual Auction Pending Payment" ? (
                                    <Iconb
                                      newClass={`themeFont boxCenter userBtn fs-5`}
                                      btnIcon={<ManualAuctionPendingPayment sx={{ color: '#737272' }} />}
                                      {...disabledIconProps}
                                    />

                                  ) : item.status === "Manual Auction Cancelled" ? (
                                    <Iconb
                                      newClass={`themeFont boxCenter userBtn fs-5`}
                                      btnIcon={<ManualAuctionCancelled sx={{ color: '#737272' }} />}
                                      {...disabledIconProps}
                                    />

                                  ) : item.status === "Auction Pending Payment" ? (
                                    <Iconb
                                      newClass={`themeFont boxCenter userBtn fs-5`}
                                      btnIcon={<AuctionPendingPayment sx={{ color: '#737272' }} />}
                                      {...disabledIconProps}
                                    />

                                  ) : item.status === "Auction Cancelled" ? (
                                    <Iconb
                                      newClass={`themeFont boxCenter userBtn fs-5`}
                                      btnIcon={<AuctionCancelled sx={{ color: '#737272' }} />}
                                      {...disabledIconProps}
                                    />

                                  ) : item.status === "Out Of Delivery" ? (
                                    <Iconb
                                      newClass={`themeFont boxCenter userBtn fs-5`}
                                      btnIcon={<OutOfDeliverIcon sx={{ color: '#737272' }} />}
                                      onClick={() => editOpenDialog(item, mapData)}
                                    />

                                  ) : (
                                    <Iconb
                                      type="button"
                                      newClass={`themeFont boxCenter infobtn userBtn`}
                                      btnIcon={<PanddingIcon sx={{ color: '#737272' }} />}
                                      isImage={true}
                                      onClick={() => editOpenDialog(item, mapData)}  // action only here
                                    />
                                  )}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </>
                    ) : (
                      <tr>
                        <td colSpan="25" className="text-center text-white">
                          No Data Found !
                        </td>
                      </tr>
                    )}
                  </tbody>


                </table>
              </div>
              <Pagination
                component="div"
                count={totalOrder}
                totalData={totalOrder}
                type={"server"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                serverPage={currentPage}
                setCurrentPage={setCurrentPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
              {dialogue && dialogueType === "order" && (
                <EditOrder statusData={sendStatus} />
              )}
            </div>
          </div>
          <div className="sellerFooter primeFooter"></div>
        </div>
      </div>
    </>
  );
};

export default connect(null, { getOrder })(Order);
// export default Seller;
