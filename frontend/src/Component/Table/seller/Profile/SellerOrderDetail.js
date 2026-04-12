import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { getSellerOrderDetail } from "../../../store/seller/seller.action";
import { useLocation } from "react-router-dom";
import Table from "../../../extra/Table";

const SellerOrderDetail = (props) => {
  const { sellerOrderDetail } = useSelector((state) => state.seller);

  console.log("sellerOrderDetail::::::", sellerOrderDetail);

  const { state } = useLocation();
  const dispatch = useDispatch();

  const [data, setData] = useState([]);
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  let orderId = state?._id;
  let sellerId = state?.items[0]?.sellerId;
  console.log("sellerId", sellerId);

  useEffect(() => {
    dispatch(getSellerOrderDetail(sellerId, orderId));
  }, [dispatch, sellerId, orderId]);

  useEffect(() => {
    setData(sellerOrderDetail);
  }, [sellerOrderDetail]);

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
    },

    {
      Header: "Iteam Detail",
      body: "",
      Cell: ({ row }) => (
        <>
          <div className="">
            <div className="d-flex">
              <img
                src={row.productId?.mainImage}
                width={55}
                height={55}
                style={{
                  borderRadius: "10px",
                  margin: "5px",
                }}
                alt=""
                srcset=""
              />
              <div className="ms-3 text-start">
                <b className="fs-6 text-muted">{row.productId?.productName}</b>
                <br />
                <span style={{ fontSize: "13px" }}>
                  <b className="text-dark">Quantity</b> :{row?.productQuantity}
                </span>
                <br />
                <span style={{ fontSize: "13px" }}>
                  <b className="text-dark">Price</b> :
                  {row?.purchasedTimeProductPrice}$
                </span>
              </div>
            </div>
          </div>
        </>
      ),
    },



    {
      Header: "CreatedDate",
      body: "createdAt",
      Cell: ({ row }) => {
        const date = row.date.split(",");
        return (
          <>
            <div className="my-5">
              <span>{date[0]}</span>
              <br />
              <span>{date[1]}</span>
            </div>
          </>
        );
      },
    },
    {
      Header: "Price",
      body: "price",
      Cell: ({ row }) => {
        return (
          <>
            <b className="fs-6">
              {row?.purchasedTimeProductPrice * row?.productQuantity}$
            </b>
          </>
        );
      },
    },
    {
      Header: "Shipping Charge",
      body: "purchasedTimeShippingCharges",
      Cell: ({ row }) => {
        return (
          <>
            <b className="fs-6">{row?.purchasedTimeShippingCharges}$</b>
          </>
        );
      },
    },
    {
      Header: "Status",
      body: "status",
      Cell: ({ row }) => {
        return (
          <>
            {(row?.status === "Pending" && (
              <span className="badge badge-primary p-2">Pending</span>
            )) ||
              (row?.status === "Confirmed" && (
                <span className="badge badge-success p-2">Confirmed</span>
              )) ||
              (row?.status === "Cancelled" && (
                <span className="badge badge-danger p-2">Cancelled</span>
              )) ||
              (row?.status === "Out Of Delivery" && (
                <span className="badge badge-warning p-2">Out Of Delivery</span>
              )) ||
              (row?.status === "Delivered" && (
                <span className="badge badge-secondary p-2">Delivered</span>
              ))}
          </>
        );
      },
    },
    

    // add more columns as needed
  ];

  return (
    <>
      <div className="row" style={{ margin: "10px 18px" }}>
        <div className="col-xl-9 col-md-12 col-12">
          <div
            className="card"
            style={{ maxHeight: "100%", minHeight: "100%", overflow: "auto" }}
          >
            <div className="card-body">
              <div className="card">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 col-12">
                      <p className="fs-5 fw-bolder">
                        OrderID : {sellerOrderDetail?.orderId}
                      </p>
                    
                    </div>
                    <div className="col-md-6 col-12"></div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 col-12"></div>
                    <div className="col-md-6 col-12 d-flex justify-content-end">
                    
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <div className="primeMain">
                  <div className="tableMain">
                    <Table
                      data={data?.items}
                      mapData={mapData}
                      PerPage={rowsPerPage}
                      Page={page}
                      type={"client"}
                    />
                  </div>
                 
                </div>
              </div>
              <div className="row">
                <div className="col-md-6"></div>
                <div className="col-md-6 d-flex justify-content-end">
                  <div>
                    <table className="w-100">
                      <tbody>
                        <tr className="text-start ">
                          <td width="180px" className="py-3 text-profile ">
                            Total Items
                          </td>
                          <td width="30px">:</td>
                          <td className="text-capitalize text-start">
                            {sellerOrderDetail?.totalItems}
                          </td>
                        </tr>
                        <tr className="text-start ">
                          <td width="180px" className="py-3 text-profile ">
                            Total Quantity
                          </td>
                          <td width="30px">:</td>
                          <td className="text-capitalize text-start">
                            {sellerOrderDetail?.totalQuantity}
                          </td>
                        </tr>
                        <tr className="text-start ">
                          <td width="180px" className="py-3 text-profile ">
                            <b>Amount</b>
                          </td>
                          <td width="30px">:</td>
                          <td className="text-capitalize text-start">
                            <b>{sellerOrderDetail?.subTotal}$</b>
                          </td>
                        </tr>
                        <tr className="text-start ">
                          <td width="180px" className="py-3 text-profile ">
                            <b>Shipping Charge</b>
                          </td>
                          <td width="30px">:</td>
                          <td className="text-capitalize text-start">
                            <b>
                              {"+" + sellerOrderDetail?.totalShippingCharges}$
                            </b>
                          </td>
                        </tr>
                        <tr>
                          <td width="180px" className="py-3"></td>
                          <td width="30px"></td>
                          <td className="text-capitalize text-start">
                            <hr width="60px" />
                          </td>
                        </tr>
                        <tr className="text-start ">
                          <td width="180px" className=" text-profile ">
                            <b>Total Amount</b>
                          </td>
                          <td width="30px">:</td>
                          <td className="text-capitalize text-start">
                            <b>{sellerOrderDetail?.total}$</b>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-xl-3 col-md-12 col-12">
          <div
            className="card"
            style={{ maxHeight: "100%", minHeight: "100%", overflow: "auto" }}
          >
            <div className="heading2 d-flex pb-2 px-3">
              <img
                src={require("../../../../assets/images/fast.png")}
                width={30}
                alt=""
                srcset=""
              />
              <h5 className="fw-bold fs-6 boxCenter ms-2 mt-2">
                Shipping Address
              </h5>
            </div>
            <div className="card-body">
              <div className="text-start">
                <div>
                  <table
                    className="w-100 infoTable"
                    style={{ fontSize: "15px" }}
                  >
                    <tbody>
                      <tr>
                        <td
                          className="text-profile"
                          style={{
                            fontSize: "15px",
                            width: "100px",
                            padding: "26px 0px",
                          }}
                        >
                          Name
                        </td>
                        <td className="text-dark fw-bold">:</td>
                        <td>{sellerOrderDetail?.shippingAddress?.name}</td>
                      </tr>
                      <tr>
                        <td
                          className="text-profile"
                          style={{
                            fontSize: "15px",
                            width: "100px",
                            padding: "26px 0px",
                          }}
                        >
                          Address
                        </td>
                        <td className="text-dark fw-bold">:</td>
                        <td>{sellerOrderDetail?.shippingAddress?.address}</td>
                      </tr>
                      <tr>
                        <td
                          className="text-profile"
                          style={{
                            fontSize: "15px",
                            width: "100px",
                            padding: "26px 0px",
                          }}
                        >
                          City
                        </td>
                        <td className="text-dark fw-bold">:</td>
                        <td>{sellerOrderDetail?.shippingAddress?.city}</td>
                      </tr>

                      <tr>
                        <td
                          className="text-profile"
                          style={{
                            fontSize: "15px",
                            width: "100px",
                            padding: "26px 0px",
                          }}
                        >
                          State
                        </td>
                        <td className="text-dark fw-bold">:</td>
                        <td>{sellerOrderDetail?.shippingAddress?.state}</td>
                      </tr>
                      <tr>
                        <td
                          className="text-profile"
                          style={{
                            fontSize: "15px",
                            width: "100px",
                            padding: "26px 0px",
                          }}
                        >
                          Country
                        </td>
                        <td className="text-dark fw-bold">:</td>
                        <td>{sellerOrderDetail?.shippingAddress?.country}</td>
                      </tr>
                      <tr>
                        <td
                          className="text-profile"
                          style={{
                            fontSize: "15px",
                            width: "100px",
                            padding: "26px 0px",
                          }}
                        >
                          ZipCode
                        </td>
                        <td className="text-dark fw-bold">:</td>
                        <td>{sellerOrderDetail?.shippingAddress?.zipCode}</td>
                      </tr>
                      {sellerOrderDetail?.deliveredServiceName === null ||
                      sellerOrderDetail?.trackingId === null ||
                      sellerOrderDetail?.trackingLink === null ? (
                        <></>
                      ) : (
                        <>
                          <tr>
                            <td
                              className="text-profile"
                              style={{
                                fontSize: "15px",
                                width: "100px",
                                padding: "26px 0px",
                              }}
                            >
                              Delivered Service
                            </td>
                            <td className="text-dark fw-bold">:</td>
                            <td>{sellerOrderDetail?.deliveredServiceName}</td>
                          </tr>
                          <tr>
                            <td
                              className="text-profile"
                              style={{
                                fontSize: "15px",
                                width: "100px",
                                padding: "26px 0px",
                              }}
                            >
                              Tracking Id
                            </td>
                            <td className="text-dark fw-bold">:</td>
                            <td>{sellerOrderDetail?.trackingId}</td>
                          </tr>
                          <tr>
                            <td
                              className="text-profile"
                              style={{
                                fontSize: "15px",
                                width: "100px",
                                padding: "26px 0px",
                              }}
                            >
                              Tracking Link
                            </td>
                            <td className="text-dark fw-bold">:</td>
                            <td>{sellerOrderDetail?.trackingLink}</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default connect(null, { getSellerOrderDetail })(SellerOrderDetail);

{
  /* <div className="card">
<div className="card-body">
  
</div>
</div> */
}
