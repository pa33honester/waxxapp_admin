import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import $ from "jquery";

import {
  getUpdateProductRequest,
} from "../../store/product/product.action";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import "react-loading-skeleton/dist/skeleton.css";

const UpdateProductRejected = (props) => {

  const dispatch = useDispatch()

  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [type, setType] = useState("Rejected");

  const { updateRequest } = useSelector((state) => state.product);

  useEffect(() => {
    dispatch(getUpdateProductRequest(type));
  }, [dispatch,type]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(updateRequest);
  }, [updateRequest]);

  // pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  // table Data

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span>{parseInt(index) + 1}</span>,
    },
    {
      Header: "Product",
      body: "image",
      Cell: ({ row }) => (
        <div className="d-flex">
          <div className="position-relative">
            {loading ? (
              <>
                <Skeleton
                  height={60}
                  width={60}
                  className="StripeElement "
                  baseColor={colors?.baseColor}
                  highlightColor={colors?.highlightColor}
                />
              </>
            ) : (
              <>
                <img
                  src={row?.mainImage}
                  height={60}
                  width={60}
                  style={{ borderRadius: "10px" }}
                  alt=""
                />
              </>
            )}
          </div>
          <span className="ms-2 boxCenter">{row.productName}</span>
        </div>
      ),
    },

    { Header: "Product Code", body: "productCode" },

    {
      Header: "Price",
      body: "price",
      Cell: ({ row }) => (
        <span className="fw-bold text-dark">${row.price}</span>
      ),
    },
    {
      Header: "Shipping Charges",
      body: "shippingCharges",
      Cell: ({ row }) => <span>${row.shippingCharges}</span>,
    },

    {
      Header: "CreatedDate",
      body: "createdAt",
      Cell: ({ row }) => (
        <span>{dayjs(row.createdAt).format("DD MMM YYYY")}</span>
      ),
    },
    {
      Header: "Update Status",
      body: "updateStatus",
      Cell: ({ row }) => (
        <span className="badge badge-danger p-2">{row?.updateStatus}</span>
      ),
    },

   

    // add more columns as needed
  ];
  // searching

  $(document).ready(() => {
    $("#manageRedeem").on("click", "a", function () {
      // remove className 'active' from all li who already has className 'active'
      $("#manageRedeem a.active-history").removeClass("active-history");
      // adding className 'active' to current click li
      $(this).addClass("active-history");
    });
  });

  return (
    <>
      <div className="mainSellerTable">
        <div className="sellerTable">
          <div className="sellerHeader primeHeader">
            <div className="row">
              <div className="col-10"></div>
              <div className="col-2 text-end">
                
              </div>
              <div className="col-6"></div>
            </div>
          </div>
          <div className="sellerMain">
            <div className="tableMain">
              {type == "Rejected" && (
                <>
                  <Table
                    data={data}
                    mapData={mapData}
                    PerPage={rowsPerPage}
                    Page={page}
                    type={"client"}
                  />
                </>
              )}
              <Pagination
                component="div"
                count={updateRequest?.length}
                serverPage={page}
                type={"client"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={updateRequest?.length}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </div>
          <div className="sellerFooter primeFooter"></div>
        </div>
      </div>
    </>
  );
};

export default connect(null, { getUpdateProductRequest })(
  UpdateProductRejected
);
