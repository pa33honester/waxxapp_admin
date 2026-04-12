import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import $ from "jquery";
import Button from "../../extra/Button";
import {
  getUpdateProductRequest,
  updateProductAction,
} from "../../store/product/product.action";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import "react-loading-skeleton/dist/skeleton.css";

const UpdateRequest = (props) => {
  const { updateRequest } = useSelector((state) => state.product);

  const dispatch = useDispatch();

  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [type, setType] = useState("Pending");

  useEffect(() => {
    dispatch(getUpdateProductRequest(type));
  }, [dispatch, type]);

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

  const handleApproved = (productId) => {
    props.updateProductAction(productId, "Approved");
  };
  const handleRejected = (productId) => {
    props.updateProductAction(productId, "Rejected");
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
        <div className="d-flex ">
          <div className="position-relative">
            {loading ? (
              <>
                <Skeleton
                  height={50}
                  width={50}
                  className="StripeElement "
                  baseColor={colors?.baseColor}
                  highlightColor={colors?.highlightColor}
                />
              </>
            ) : (
              <>
                <img
                  src={row?.images[0]}
                  height={50}
                  width={50}
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
        <span className="badge badge-primary p-2">{row?.updateStatus}</span>
      ),
    },

    {
      Header: "Accept",
      body: "",
      Cell: ({ row }) => (
        <>
          <Button
            newClass={`themeFont boxCenter userBtn fs-5`}
            
           
            btnIcon={`fa-solid fa-check`}
            style={{
              borderRadius: "5px",
              margin: "auto",
              width: "40px",
              backgroundColor: "#fff",
              color: "green",
              cursor: "pointer",
            }}
            onClick={() => handleApproved(row?._id)}
          />
        </>
      ),
    },

    {
      Header: "Reject",
      body: "",
      Cell: ({ row }) => (
        <>
          <Button
            newClass={`themeFont boxCenter userBtn fs-5`}
            
           
            btnIcon={`fa-sharp fa-solid fa-xmark`}
            style={{
              borderRadius: "5px",
              margin: "auto",
              width: "40px",
              backgroundColor: "#fff",
              color: "red",
              cursor: "pointer",
            }}
            onClick={() => handleRejected(row?._id)}
          />
        </>
      ),
    },

    // add more columns as needed
  ];
  // searching
  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

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
              {type == "Pending" && (
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

export default connect(null, { getUpdateProductRequest, updateProductAction })(
  UpdateRequest
);
