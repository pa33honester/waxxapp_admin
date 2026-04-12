import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import Button from "../../extra/Button";
import Searching from "../../extra/Searching";
import {
  getProductRequest,
  productAction,
  getUpdateProductRequest,
  updateProductAction,
} from "../../store/product/product.action";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import "react-loading-skeleton/dist/skeleton.css";
import { getDefaultCurrency } from "../../store/currency/currency.action";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import Iconb from "../../extra/Iconb";

const PendingProduct = (props) => {
  const dispatch = useDispatch();

  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [updateData, setupdateData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [type, setType] = useState("Pending");
  const [status, setStatus] = useState("Create");

  const { productRequest, updateProductRequest } = useSelector(
    (state) => state.product
  );

  const { defaultCurrency } = useSelector((state) => state.currency)

  useEffect(() => {
    if (status === "Create") {
      dispatch(getProductRequest(type));
      setData([]);
    } else {
      dispatch(getUpdateProductRequest(type));
      setData([]);
    }
  }, [dispatch, type, status]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (status === "Create") {
      setData(productRequest);
    } else {
      setupdateData(updateProductRequest);
    }
  }, [productRequest, updateProductRequest]);

  useEffect(() => {
    dispatch(getDefaultCurrency())
  }, [dispatch])

  // pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  // create
  const handleApproved = (productId) => {
    if (status === "Create") {
      props.productAction(productId, "Approved");
    } else {
      props.updateProductAction(productId, "Approved");
    }
  };
  const handleRejected = (productId) => {
    if (status === "Create") {
      props.productAction(productId, "Rejected");
    } else {
      props.updateProductAction(productId, "Rejected");
    }
  };




  // table Data

  // create request

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span className="text-white fw-normal">{page * rowsPerPage + parseInt(index) + 1}</span>,
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
                  height={47}
                  width={50}
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
          <span className="ms-2 boxCenter text-white fw-normal">{row.productName}</span>
        </div>
      ),
    },

    {
      Header: `Product Code`, body: "productCode",
      Cell: ({ row }) => (
        <>
          <span className="text-white fw-normal">
            {row.productCode}
          </span>
        </>
      ),
    },

    {
      Header: `Price (${defaultCurrency?.symbol || ''})`,
      body: "price",
      Cell: ({ row }) => (
        <span className="fw-normal text-white">{row.price}</span>
      ),
    },
    {
      Header: `Shipping Charges (${defaultCurrency?.symbol || ''})`,
      body: "shippingCharges",
      Cell: ({ row }) => <span className="text-white fw-normal">{row.shippingCharges}</span>,
    },

    {
      Header: "Created Date",
      body: "createdAt",
      Cell: ({ row }) => (
        <span className="text-white fw-normal">{dayjs(row.createdAt).format("DD MMM YYYY")}</span>
      ),
    },
    {
      Header: "Create Status",
      body: "status",
      Cell: ({ row }) => (
        <div className="boxCenter">
          <span className="badge badge-danger p-2">
            {status === "Create" ? (
              <>{row.createStatus}</>
            ) : (
              <>{row.updateStatus}</>
            )}
          </span>
        </div>
      ),
    },

   

    // {
    //   Header: "Accept",
    //   body: "",
    //   Cell: ({ row }) => (
    //     <>
    //       <Button
    //         newClass={`themeFont boxCenter acptbtn  userBtn fs-5`}

    //         btnIcon={`fa-solid fa-check`

    //         }
    //         style={{
    //           borderRadius: "5px",
    //           margin: "auto",
    //           width: "40px",

    //           color: "green",
    //           cursor: "pointer",
    //         }}
    //         onClick={() => handleApproved(row?._id)}
    //       />
    //     </>
    //   ),
    // },

    // {
    //   Header: "Reject",
    //   body: "",
    //   Cell: ({ row }) => (
    //     <>
    //       <Button
    //         newClass={`themeFont boxCenter killbtn userBtn fs-5`}

    //         btnIcon={`fa-sharp fa-solid fa-xmark`}
    //         style={{
    //           borderRadius: "5px",
    //           margin: "auto",
    //           width: "40px",

    //           color: "red",
    //           cursor: "pointer",
    //         }}
    //         onClick={() => handleRejected(row?._id)}
    //       />
    //     </>
    //   ),
    // },

    {
      Header: "Accept",
      body: "",
      Cell: ({ row }) => (
        <>
          <Iconb
            newClass={`themeFont boxCenter acptbtn userBtn fs-5`}
            btnIcon={<CheckCircleIcon sx={{ color: "green" }} />}
            style={{
              borderRadius: "5px",
              margin: "auto",
              width: "40px",
              cursor: "pointer",
            }}
            isImage={true}
            onClick={() => handleApproved(row?._id)}
          />
        </>
      ),
    },

    // ❌ Reject Button
    {
      Header: "Reject",
      body: "",
      Cell: ({ row }) => (
        <>
          <Iconb
            newClass={`themeFont boxCenter killbtn userBtn fs-5`}
            btnIcon={<CancelIcon sx={{ color: "red" }} />}
            style={{
              borderRadius: "5px",
              margin: "auto",
              width: "40px",
              cursor: "pointer",
            }}
            isImage={true}
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

  return (
    <>
      <div className="mainSellerTable">
        <div className="sellerTable">
          <div className="sellerHeader primeHeader">
            <div className="row">
              <div className="col-12 col-md-6 col-sm-3">
                <div
                  className="themediv"
                  style={{
                    display: "flex",
                    borderRadius: "5px ",

                    backgroundColor: "#fff",
                    padding: "0px",
                    width: "fit-content",
                    margin: "10px 0px 0px 0px"
                  }}
                >
                  <Button
                    newClass="themeFont"
                    btnName="New Items"
                    style={{
                      borderRadius: "5px 0px 0px 5px",
                      backgroundColor: status === "Create" ? "#f7dada" : "transparent",
                      color: status === "Update" ? "#2f2b3db3" : "#b93160",
                      cursor: "pointer",
                      fontWeight: "500",
                      opacity: 1,
                      padding: "10px 20px",
                      border: "0.5px solid #D8D7DC",
                      transition: "all 0.2s ease",
                    }}
                    onClick={() => setStatus("Create")}
                  />
                  <Button
                    newClass="themeFont"
                    btnName="Updated Items"
                    style={{
                      borderRadius: "0px 5px 5px 0px",
                      backgroundColor: status === "Update" ? "#f7dada" : "transparent",
                      color: status === "Update" ? "#b93160" : "#2f2b3db3",
                      cursor: "pointer",
                      fontWeight: "500",
                      opacity: 1,
                      padding: "10px 20px",
                      border: "0.5px solid #D8D7DC",
                      transition: "all 0.3s ease",
                    }}
                    onClick={() => setStatus("Update")}
                  />
                </div>
              </div>

            </div>
          </div>
          <div className="sellerMain">
            <div className="tableMain " style={{ marginTop: "15px" }}>
              <div className="row">
                <div className="col-12 d-flex justify-content-end " style={{ padding: "10px 20px 10px 0px" }}>
                  <Searching
                    type={`client`}
                    data={productRequest}
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
              {type == "Pending" && (
                <>
                  <Table
                    data={status === "Create" ? data : updateData}
                    mapData={mapData}
                    PerPage={rowsPerPage}
                    Page={page}
                    type={"client"}
                  />
                </>
              )}
              <Pagination
                component="div"
                count={status === "Create" ? data?.length : updateData?.length}
                serverPage={page}
                type={"client"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={status === "Create" ? data?.length : updateData?.length}
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

export default connect(null, {
  getProductRequest,
  productAction,
  getUpdateProductRequest,
  updateProductAction,
})(PendingProduct);
