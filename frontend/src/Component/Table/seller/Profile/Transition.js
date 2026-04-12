import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import Table from "../../../extra/Table";
import Pagination from "../../../extra/Pagination";
import { getSellerTransition } from "../../../store/seller/seller.action";
import Analytics from "../../../extra/Analytics";
import { getSetting } from "../../../store/setting/setting.action";

const Transition = (props) => {
  const { sellerTransition, totalTransitions , sellerTransitionTotal } = useSelector((state) => state.seller);
  console.log("sellerTransition-----", sellerTransition);

  const { defaultCurrency } = useSelector((state) => state.currency);
  const { setting } = useSelector((state) => state.setting);
  console.log("settings++", setting);

  const { state } = useLocation();
  const id = state;
  console.log("id+++++++++++++++++++", id);

  const dispatch = useDispatch();

  // Only 2 pagination states needed (removed redundancy)
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Filter states
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const [transactionType, setTransactionType] = useState("All");
  console.log("transactionType", transactionType);

  // API call with optimized parameters
  useEffect(() => {
    let transactionTypeValue;

    if (transactionType === "Earning") {
      transactionTypeValue = 1;
    } else if (transactionType === "Withdrawal") {
      transactionTypeValue = 2;
    } else {
      transactionTypeValue = "All";
    }
    dispatch(getSellerTransition(currentPage, rowsPerPage, startDate, endDate, id, transactionTypeValue));
    dispatch(getSetting());
  }, [dispatch, id, startDate, endDate, currentPage, rowsPerPage, transactionType]);

  useEffect(() => {
    setData(sellerTransition);
  }, [sellerTransition]);

  // Simplified pagination handlers
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);  // Only one state to update
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event, 10);
    setRowsPerPage(newRowsPerPage);  // Only one state to update
    setCurrentPage(1);               // Reset to page 1
  };

  const changeTransactionType = (value) => {
    setTransactionType(value);
    setStartDate("All");
    setEndDate("All");
  };

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => (
        <span className="text-white">
          {(currentPage - 1) * rowsPerPage + index + 1}
        </span>
      ),
    },

    {
      Header: "Order Id",
      body: "orderId",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 fw-normal text-white">{row.orderId ? row.orderId : "-"}</p>
        </div>
      ),
    },

    {
      Header: "Buyer Name",
      body: "buyerName",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 fw-normal text-white">{row.buyerName ? row.buyerName : "-"}</p>
        </div>
      ),
    },

    {
      Header: "Seller Name",
      body: "sellerName",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 fw-normal text-white">
            {row.sellerName + "  " + row.lastName}
          </p>
        </div>
      ),
    },

    {
      Header: "business Name",
      body: "businessName",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 fw-normal text-white">{row.businessName ? row.businessName : "-"}</p>
        </div>
      ),
    },

    {
      Header: "business Tag",
      body: "businessTag",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 fw-normal text-white">{row.businessTag ? row.businessTag : "-"}</p>
        </div>
      ),
    },



    {
      Header: "Transaction Type",
      body: "transactionType",
      Cell: ({ row }) => (
        <div className="d-flex justify-content-center">
          <span className={`badge p-2 ${row.transactionType === 1
            ? "badge-success"
            : "badge-warning"
            }`}>
            {row.transactionType === 1 ? "Earning" : "Withdrawal"}
          </span>
        </div>
      ),
    },
    // {
    //   Header: `Order Id`,
    //   body: "orderId",
    //   Cell: ({ row }) => (
    //     <div className="">
    //       <p className="mb-0 text-white font-normal">
    //         {row.orderId}
    //       </p>
    //     </div>
    //   ),
    // },
    {
      Header: `Seller Earning (${setting?.currency?.currencyCode || ''})`,
      body: "sellerEarning",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-white font-normal">
            {row.sellerEarning}
          </p>
        </div>
      ),
    },

    {
      Header: `Admin Earning (${setting?.currency?.currencyCode || ''})`,
      body: "adminAmount",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-white font-normal">{row.adminEarning}</p>
        </div>
      ),
    },

    {
      Header: `Order Amount (${setting?.currency?.currencyCode || ''})`,
      body: "orderAmount",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-white font-normal">{row.orderAmount ? row.orderAmount : "-"}</p>
        </div>
      ),
    },
    {
      Header: "Date and Time",
      body: "dateAndTime",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 fw-normal text-white">{row.date ? row.date : "-"}</p>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="card mt-4">
        <div className="card-body">
          <div className="userMain">

            {/* Header with Transaction Type Dropdown and Date Selector */}
            <div className="row mb-3" >
              {/* Left side - Transaction Type Dropdown */}
              <div className="col-6" style={{ display: "flex", alignItems: "center" }}>
                <div className="btn-group">
                  <button
                    type="button"
                    className="btn btnnewPrime dropdown-toggle"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{
                      borderRadius: "5px",
                      padding: "8px 40px",
                      background: "#fff",
                      marginLeft: "5px"
                    }}
                  >
                    {transactionType ? (
                      <span className="caret text-black">{transactionType}</span>
                    ) : (
                      <span className="caret text-capitalize">Transaction Type</span>
                    )}
                  </button>
                  <ul className="dropdown-menu">
                    <li style={{ cursor: "pointer" }}>
                      <a
                        className="dropdown-item"
                        href={() => false}
                        onClick={() => changeTransactionType("All")}
                      // onClick={() => setTransactionType("All")}
                      >
                        All
                      </a>
                    </li>
                    <li style={{ cursor: "pointer" }}>
                      <a
                        className="dropdown-item"
                        href={() => false}
                        // onClick={() => setTransactionType("Earning")}
                        onClick={() => changeTransactionType("Earning")}

                      >
                        Earning
                      </a>
                    </li>
                    <li style={{ cursor: "pointer" }}>
                      <a
                        className="dropdown-item"
                        href={() => false}
                        // onClick={() => setTransactionType("Withdrawal")}
                        onClick={() => changeTransactionType("Withdrawal")}

                      >
                        Withdrawal
                      </a>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right side - Date Analytics */}
              <div className="col-6" style={{ display: "flex", justifyContent: "flex-end" }}>
                <Analytics
                  analyticsStartDate={startDate}
                  analyticsStartEnd={endDate}
                  setAnalyticsStartDate={setStartDate}
                  setAnalyticsEndDate={setEndDate}
                  title={"Transaction"}
                />
              </div>
            </div>

            {/* Table */}
            <div className="tableMain mt-2" style={{ marginLeft: "7px", marginRight: "7px" }}>
              <Table
                data={data}
                mapData={mapData}
                serverPerPage={rowsPerPage}      // Direct use
                serverPage={currentPage}        // Direct use
                type={"server"}
              />

              {/* Pagination */}
              <Pagination
                component="div"
                count={sellerTransitionTotal}
                type={"server"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={sellerTransitionTotal}
                serverPage={currentPage}        // Direct use
                setCurrentPage={setCurrentPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(null, { getSellerTransition })(Transition);
