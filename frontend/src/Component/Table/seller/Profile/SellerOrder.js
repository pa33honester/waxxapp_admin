import React, { useEffect, useState } from "react";
import Table from "../../../extra/Table";
import Pagination from "../../../extra/Pagination";
import { connect, useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { colors } from "../../../../util/SkeletonColor";
import { getSellerOrder } from "../../../store/seller/seller.action";
import Skeleton from "react-loading-skeleton";
import Button from "../../../extra/Button";
import Info from "../../../../assets/images/Info.svg"
import { getDefaultCurrency } from "../../../store/currency/currency.action";
import defaultImage from "../../../../assets/images/default.jpg";

import Iconb from "../../../extra/Iconb";
import InfoOutlined from '@mui/icons-material/InfoOutlined';

const SellerOrder = (props) => {
  const { sellerOrder, total } = useSelector((state) => state.seller);
  console.log("sellerOrder", sellerOrder);

  const { state } = useLocation();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [status, setStatus] = useState("All");
  console.log("status", status);

  const [loading, setLoading] = useState(true);

  const { defaultCurrency } = useSelector((state) => state.currency)

  // useEffect(() => {
  //   dispatch(getSellerOrder(state, currentPage, size, status));
  //   dispatch(getDefaultCurrency())
  // }, [dispatch, state, currentPage, size, status]);

  useEffect(() => {
    dispatch(getSellerOrder(state, currentPage, rowsPerPage, status));
    dispatch(getDefaultCurrency());
  }, [dispatch, state, currentPage, rowsPerPage, status]);

  useEffect(() => {
    setData(sellerOrder);
  }, [sellerOrder]);

  // // pagination
  // const handleChangePage = (event, newPage) => {
  //   setPage(newPage);
  // };

  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(parseInt(event, 10));
  //   setPage(0);
  // };
  const handleChangeRowsPerPage = (event) => {
    // setRowsPerPage(parseInt(event.target.value, 10)); // event.target.value is typical for select input
    setRowsPerPage(parseInt(event), 10);
    setSize(parseInt(event), 10);
    setCurrentPage(1); // reset to first page on page size change
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

  // table Data
  let date;

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span className="fw-normal text-white">{index + 1}</span>,
    },

    {
      Header: "Order Id",
      body: "orderId",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 fw-normal text-white">{row.orderId}</p>
        </div>
      ),
    },
    {
      Header: "User",
      body: "userFirstName",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 fw-normal text-white">{row.userFirstName + " " + row.userLastName}</p>
        </div>
      ),
    },
    {
      Header: "Items",
      body: "items",
      Cell: ({ row }) => (
        <div>
          {row?.items?.map((data, index) => (
            <div
              key={index}
              className="py-2"
              style={{
                borderBottom: index < row.items.length - 1 ? "1px solid #606060" : "",
              }}
            >
              <div className="d-flex align-items-center">
                {/* Product Image */}
                <img
                  src={data.productId?.mainImage || "placeholder.png"} // Fallback for missing image
                  width={55}
                  height={55}
                  style={{
                    borderRadius: "10px",
                    margin: "5px",
                  }}
                  alt={data.productId?.productName || "Product"}
                />
                {/* Product Details */}
                <div className="ms-3 text-start">
                  <b className="fs-6 fw-normal text-white">
                    {data.productId?.productName || "Unknown Product"}
                  </b>
                  <br />
                  <span style={{ fontSize: "13px" }} className="text-white">
                    <b className="fw-normal">Quantity:</b> {data?.productQuantity}
                  </span>
                  <br />
                  <span style={{ fontSize: "13px" }} className="text-white">
                    <b className="fw-normal">Price:</b> ₹{data?.purchasedTimeProductPrice}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ),
    },

    {
      Header: "PaymentGateway",
      body: "paymentGateway",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 fw-normal text-white">{row.paymentGateway}</p>
        </div>
      ),
    },
    {
      Header: "Status",
      body: "status",
      Cell: ({ row }) =>
        row.items.map((data) => {
          return (
            <>
              <div className="py-4 boxCenter">
                {(data?.status === "Pending" && (
                  <span className="badge badge-primary p-2">Pending</span>
                )) ||
                  (data?.status === "Confirmed" && (
                    <span className="badge badge-success p-2">Confirmed</span>
                  )) ||
                  (data?.status === "Cancelled" && (
                    <span className="badge badge-danger p-2">Cancelled</span>
                  )) ||
                  (data?.status === "Out Of Delivery" && (
                    <span className="badge badge-warning p-2">
                      Out Of Delivery
                    </span>
                  )) ||
                  (data?.status === "Delivered" && (
                    <span className="badge badge-info p-2">Delivered</span>
                  )) ||
                  (data?.status === "Manual Auction Pending Payment" && (
                    <span className="badge badge-info p-2">Manual Auction Pending Payment</span>
                  )) ||
                  (data?.status === "Manual Auction Cancelled" && (
                    <span className="badge badge-info p-2">Manual Auction Cancelled</span>
                  )) ||
                  (data?.status === "Auction Pending Payment" && (
                    <span className="badge badge-info p-2">Auction Pending Payment</span>
                  )) ||
                  (data?.status === "Auction Cancelled" && (
                    <span className="badge badge-info p-2">Auction Cancelled</span>
                  ))}
              </div>
            </>
          );
        }),
    },
    {
      Header: "Info",
      body: "",
      Cell: ({ row }) => (
        <>
          <Button
            newClass={`themeFont boxCenter userBtn fs-5`}
            btnIcon={Info}
            style={{
              borderRadius: "8px",
              margin: "auto",
              height: "45px",
              width: "45px",
              color: "#160d98",
              background: "#C4F3FF",
              padding: "0px"
            }}
            isImage={true}
            isDeleted={true}
            onClick={() => handleOpen(row?._id)}

          />
        </>
      ),
    },

  ];



  return (
    <>
      <div className="row">
        <div className="col-12">
          <div className="btn-group p-3 ms-2">
            <button
              type="button"
              className="btn btnnewPrime dropdown-toggle"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ borderRadius: "5px", padding: "8px 40px", background: "#fff", marginLeft: "5px" }}
            >
              {status ? (
                <span className="caret text-black">{status}</span>
              ) : (
                <span className="caret text-capitalize">Status</span>
              )}
            </button>
            <ul className="dropdown-menu ">

              <li style={{ cursor: "pointer" }}>
                <a
                  className="dropdown-item"
                  href={() => false}
                  onClick={() => changeStatus("All")}
                  // onClick={() => setStatus("All")}
                >
                  All
                </a>
              </li>

              <li style={{ cursor: "pointer" }}>
                <a
                  className="dropdown-item"
                  href={() => false}
                  onClick={() => changeStatus("Pending")}

                >
                  Pending
                </a>
              </li>
              <li style={{ cursor: "pointer" }}>
                <a
                  className="dropdown-item"
                  href={() => false}
                  onClick={() => changeStatus("Confirmed")}

                >
                  Confirmed
                </a>
              </li>
              <li style={{ cursor: "pointer" }}>
                <a
                  className="dropdown-item"
                  href={() => false}
                  onClick={() => changeStatus("Out Of Delivery")}

                >
                  Out Of Delivery
                </a>
              </li>
              <li style={{ cursor: "pointer" }}>
                <a
                  className="dropdown-item"
                  href={() => false}
                  onClick={() => changeStatus("Delivered")}

                >
                  Delivered
                </a>
              </li>
              <li style={{ cursor: "pointer" }}>
                <a
                  className="dropdown-item"
                  href={() => false}
                  onClick={() => changeStatus("Cancelled")}

                >
                  Cancelled
                </a>
              </li>
              <li style={{ cursor: "pointer" }}>
                <a
                  className="dropdown-item"
                  href={() => false}
                  onClick={() => changeStatus("Manual Auction Pending Payment")}

                >
                  Manual Auction Pending Payment
                </a>
              </li>
              <li style={{ cursor: "pointer" }}>
                <a
                  className="dropdown-item"
                  href={() => false}
                  onClick={() => changeStatus("Manual Auction Cancelled")}

                >
                  Manual Auction Cancelled
                </a>
              </li>
              <li style={{ cursor: "pointer" }}>
                <a
                  className="dropdown-item"
                  href={() => false}
                  onClick={() => changeStatus("Auction Pending Payment")}

                >
                  Auction Pending Payment
                </a>
              </li>
              <li style={{ cursor: "pointer" }}>
                <a
                  className="dropdown-item"
                  href={() => false}
                  onClick={() => changeStatus("Auction Cancelled")}

                >
                  Auction Cancelled
                </a>
              </li>

            </ul>
          </div>
        </div>
      </div>
      <div className="userMain">
        {/* remove 1 div here */}
        <div className="card-body">

          <div className="tableMain">
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
                    <th className="fw-bold py-3" style={{}}>
                      No
                    </th>
                    <th className="fw-bold py-3" style={{ width: "330px" }}>
                      Order Id
                    </th>
                    <th className="fw-bold py-3" style={{ width: "330px" }}>
                      User
                    </th>
                    <th className="fw-bold py-3" style={{ width: "450px" }}>
                      Items
                    </th>
                    <th className="fw-bold py-3" style={{ width: "330px", textAlign: "center" }}>
                      PaymentGateway
                    </th>

                    <th className="fw-bold py-3" style={{ width: "350px", textAlign: "center" }}>
                      Payment Status
                    </th>

                    <th className="fw-bold py-3" style={{ width: "350px", textAlign: "center" }}>
                      Order Status
                    </th>

                    <th className="fw-bold py-3" style={{ width: "330px", textAlign: "center" }}>
                      Info
                    </th>
                  </tr>
                </thead>
                {/* <tbody>
                  {data?.length > 0 ? (
                    <>
                      {data?.map((mapData, index) => {
                        return (
                          <>
                            <tr>
                              <td>
                                <span className="text-white">{index + 1}</span>
                              </td>
                              <td width="160px" className="">
                                <span className="tableBoldFont orderId">
                                  <b
                                    className="fw-normal text-white orderIdText"
                                    onClick={() => handleOpen(mapData)}
                                    style={{
                                      cursor: "pointer",
                                    }}
                                  >
                                    {mapData?.orderId}
                                  </b>
                                </span>
                              </td>
                              <td style={{ width: "350px" }}>
                                {

                                  mapData.userFirstName + " " + mapData.userLastName
                                }
                              </td>
                              <td
                                colSpan={6}
                                style={{ width: "70%" }}
                                className="py-0"
                              >
                                {mapData?.items.map((data) => {

                                  console.log("data", data?.productId?.mainImage)

                                  return (
                                    <>
                                      <div className="">
                                        <table
                                          width="100%"
                                          border
                                          className=" text-center"
                                        >
                                          <tbody>
                                            <tr
                                              style={{
                                                borderLeft:
                                                  "1px solid rgb(110, 110, 110)",
                                              }}
                                            >
                                              <td
                                                className="my-2"
                                                style={{ width: "250px" }}
                                              >
                                                <div className="">
                                                  <div className="d-flex justify-content-start ">


                                                    <>
                                                      <img
                                                        src={
                                                          data.productId
                                                            ?.mainImage
                                                        }
                                                        width={55}
                                                        height={55}
                                                        style={{
                                                          borderRadius:
                                                            "10px",
                                                          margin: "5px",
                                                          objectFit:
                                                            "cover",
                                                        }}
                                                        alt=""
                                                        srcset=""
                                                      />
                                                    </>

                                                    <div className="ms-3 text-start">
                                                      <b className="fs-6 text-white text-center">
                                                        {
                                                          data.productId
                                                            ?.productName
                                                        }
                                                      </b>
                                                      <br />
                                                      <span
                                                        style={{
                                                          fontSize: "13px",
                                                          color: "#000",
                                                        }}
                                                      >
                                                        <b className="text-white text-center">
                                                          Quantity
                                                        </b>
                                                        :
                                                        {
                                                          data?.productQuantity
                                                        }
                                                      </span>
                                                      <br />
                                                      <span
                                                        style={{
                                                          fontSize: "13px",
                                                          color: "#000",
                                                        }}
                                                      >
                                                        <b className="text-white">
                                                          Price
                                                        </b>
                                                        :
                                                        {
                                                          data?.purchasedTimeProductPrice
                                                        }

                                                      </span>
                                                    </div>
                                                  </div>
                                                </div>
                                              </td>
                                              <td
                                                className="my-2"
                                                style={{ width: "180px", }}
                                              >
                                                <div className="">
                                                  <b className="fs-6 text-white text-align-center">
                                                    {mapData?.paymentGateway ? mapData?.paymentGateway : "-"}
                                                  </b>
                                                </div>
                                              </td>

                                              <td
                                                className="my-2"
                                                style={{ width: "200px" }}
                                              >
                                                <div className="boxCenter"

                                                >
                                                  
                                                  {(mapData?.paymentStatus ===
                                                    1 && (
                                                      <span className="badge p-2" style={{ 
                                                        
                                                        // color: "#20bba0",
                                                        color: "#000",
                                                        //  backgroundColor: "#cbffeb",
                                                          width: "200px" }}>
                                                        Cash On Delivery
                                                      </span>
                                                    )) ||
                                                    (mapData?.paymentStatus ===
                                                      2 && (
                                                        <span className="badge p-2" style={{ 
                                                          
                                                          // color: "#389d19",
                                                          color: "#000",
                                                          //  backgroundColor: "#b5ffb3",
                                                            width: "200px" }}>
                                                          Paid
                                                        </span>
                                                      )) ||
                                                    (mapData?.paymentStatus ===
                                                      null && (
                                                        <span className="badge p-2" style={{ 
                                                          
                                                          // color: "#389d19",
                                                          color: "#000",
                                                           width: "200px" }}>
                                                          -
                                                        </span>
                                                      ))}

                                                </div>
                                              </td>

                                              <td
                                                className=""
                                                style={{ width: "200px" , paddingLeft: "40px" }}
                                              >
                                               {data?.status ? data?.status : "-"}
                                                {/* <div className="">
                                                  {(data?.status === "Pending" && (
                                                    <span className="badge badge-primary p-2">Pending</span>
                                                  )) ||
                                                    (data?.status === "Confirmed" && (
                                                      <span className="badge badge-success p-2">Confirmed</span>
                                                    )) ||
                                                    (data?.status === "Cancelled" && (
                                                      <span className="badge badge-danger p-2">Cancelled</span>
                                                    )) ||
                                                    (data?.status === "Out Of Delivery" && (
                                                      <span className="badge badge-warning p-2">
                                                        Out Of Delivery
                                                      </span>
                                                    )) ||
                                                    (data?.status === "Delivered" && (
                                                      <span className="badge badge-info p-2">Delivered</span>
                                                    )) ||
                                                    (data?.status === '' && (
                                                      <span className="badge badge-secondary p-2"> - </span>
                                                    ))}
                                                </div> 
                                              </td>

                                              <td

                                              >
                                                <Iconb
                                                  newClass={`themeFont boxCenter infobtn userBtn fs-5`}
                                                  btnIcon={<InfoOutlined sx={{ color: '#737272' }} />}
                                                  style={{
                                                    borderRadius: "50px",
                                                    margin: "auto",
                                                    height: "45px",
                                                    width: "45px",
                                                    color: "#160d98",

                                                    padding: "0px"
                                                  }}
                                                  isImage={true}
                                                  isDeleted={true}
                                                  onClick={() => handleOpen(mapData?._id)}

                                                />
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </>
                                  );
                                })}
                              </td>
                            </tr>
                          </>
                        );
                      })}
                    </>
                  ) : (
                    <tr>
                      <td colSpan="25" className="text-center text-white">
                        No Data Found !
                      </td>
                    </tr>
                  )}
                </tbody> */}


                <tbody>
                  {data?.length > 0 ? (
                    <>
                      {data.map((mapData, index) =>
                        mapData.items.map((item, itemIndex) => (
                          <tr key={`${mapData.orderId}-${item?.productId?._id || itemIndex}`}>
                            {/* No (Serial) */}
                            <td>
                              {/* Serial number based on pagination */}
                              <span className="text-white">
                                {(currentPage - 1) * rowsPerPage + index + 1}
                              </span>
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
                              {mapData.userFirstName + " " + mapData.userLastName}
                            </td>
                            {/* Image + Product Name + Qty + Price */}
                            <td style={{ width: "300px" }}>
                              <div className="d-flex align-items-center">
                                <img
                                  src={item?.productId?.mainImage}
                                  width={55}
                                  height={55}
                                  style={{
                                    borderRadius: "10px",
                                    margin: "5px",
                                    objectFit: "cover",
                                  }}
                                  alt=""
                                  onError={e => { e.target.onerror = null; e.target.src = defaultImage; }}
                                />
                                <div className="ms-3 text-start">
                                  <b className="fs-6 text-white text-center">
                                    {item?.productId?.productName}
                                  </b>
                                  <br />
                                  <span style={{ fontSize: "13px", color: "#000" }}>
                                    <b className="text-white">Quantity</b>: {item?.productQuantity}
                                  </span>
                                  <br />
                                  <span style={{ fontSize: "13px", color: "#000" }}>
                                    <b className="text-white">Price</b>: {item?.purchasedTimeProductPrice}
                                  </span>
                                </div>
                              </div>
                            </td>
                            {/* Payment Gateway */}
                            <td style={{ width: "180px" }}>
                              <b className="fs-6 text-white text-align-center">
                                {mapData?.paymentGateway ? mapData?.paymentGateway : "-"}
                              </b>
                            </td>
                            {/* Payment Status */}
                            <td style={{ width: "200px" }}>
                              <div className="boxCenter">
                                {(mapData?.paymentStatus === 1 && (
                                  <span className="badge p-2" style={{ backgroundColor: "#E0F5FB", color: "#00A3D5", borderRadius: "10px", width: "200px" }}>
                                    Cash On Delivery
                                  </span>
                                )) ||
                                  (mapData?.paymentStatus === 2 && (
                                    <span className="badge p-2" style={{ color: "#000", width: "200px" }}>
                                      Paid
                                    </span>
                                  )) ||
                                  (mapData?.paymentStatus == null && (
                                    <span className="badge p-2" style={{ color: "#000", width: "200px" }}>
                                      -
                                    </span>
                                  ))}
                              </div>
                            </td>
                            {/* Status */}
                            <td style={{ width: "200px", paddingLeft: "40px" }}>
                              {/* {item?.status ? item?.status : "-"} */}
                              {/* Uncomment and use conditional badges if needed */}
                              <div>
                                {item?.status === "Pending" && (
                                  <span className="badge p-2" style={{ backgroundColor: "#E7EEFF", color: "#165CFF", borderRadius: "10px" }}>Pending</span>
                                )}
                                {item?.status === "Confirmed" && (
                                  <span className="badge p-2" style={{ backgroundColor: "#CEFAC6", color: "#00A208", borderRadius: "10px" }}>Confirmed</span>
                                )}
                                {item?.status === "Delivered" && (
                                  <span className="badge p-2" style={{ backgroundColor: "#FFF0DF", color: "#E77B00", borderRadius: "10px" }}>Delivered</span>
                                )}
                                {item?.status === "Out Of Delivery" && (
                                  <span className="badge p-2" style={{ backgroundColor: "#FFE1EC", color: "#E90957", borderRadius: "10px" }}>Delivered</span>
                                )}
                                {item?.status === "Cancelled" && (
                                  <span className="badge p-2" style={{ backgroundColor: "#FFE3E3", color: "#FF1010", borderRadius: "10px" }}>Cancelled</span>
                                )}
                                {item?.status === "Manual Auction Pending Payment" && (
                                  <span className="badge p-2" style={{ backgroundColor: "#E7EEFF", color: "#165CFF", borderRadius: "10px" }}>Cancelled</span>
                                )}
                                {item?.status === "Manual Auction Cancelled" && (
                                  <span className="badge p-2" style={{ backgroundColor: "#FFD2D2", color: "#FF1D1D", borderRadius: "10px" }}>Cancelled</span>
                                )}
                                {item?.status === "Auction Pending Payment" && (
                                  <span className="badge p-2" style={{ backgroundColor: "#E7EEFF", color: "#165CFF", borderRadius: "10px" }}>Cancelled</span>
                                )}
                                {item?.status === "Auction Cancelled" && (
                                  <span className="badge p-2" style={{ backgroundColor: "#FFD2D2", color: "#FF1D1D", borderRadius: "10px" }}>Cancelled</span>
                                )}

                              </div>
                            </td>
                            {/* Action Icon */}
                            <td>
                              <Iconb
                                newClass={`themeFont boxCenter infobtn userBtn fs-5`}
                                btnIcon={<InfoOutlined sx={{ color: '#737272' }} />}
                                style={{
                                  borderRadius: "50px",
                                  margin: "auto",
                                  height: "45px",
                                  width: "45px",
                                  color: "#160d98",
                                  padding: "0px"
                                }}
                                isImage={true}
                                isDeleted={true}
                                onClick={() => handleOpen(mapData?._id)}
                              />
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
              count={total}
              totalData={total}
              type={"server"}
              onPageChange={handleChangePage}
              serverPerPage={rowsPerPage}
              serverPage={currentPage}
              setCurrentPage={setCurrentPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* {dialogue && dialogueType === "order" && (
                <EditOrder statusData={sendStatus} />
              )} */}
          </div>
          {/* <div className="tableMain m-0">
                <Table
                  data={data}
                  mapData={mapData}
                  serverPerPage={rowsPerPage}
                  serverPage={page}
                  type={"server"}
                />
              </div> */}

        </div>

      </div>
    </>
  );
};

export default connect(null, { getSellerOrder })(SellerOrder);
