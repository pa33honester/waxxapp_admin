import React from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import Searching from "../../extra/Searching";
import { useState } from "react";
import { useEffect } from "react";
import { getRedeem, action } from "../../store/redeem/redeem.action";
import $ from "jquery";
import Button from "../../extra/Button";
import { OPEN_DIALOGUE } from "../../store/dialogue/dialogue.type";
import RedeemDialog from "./RedeemDialog";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import "react-loading-skeleton/dist/skeleton.css";
import Male from "../../../assets/images/defaultUser.png"
import { getDefaultCurrency } from "../../store/currency/currency.action";

const Redeem = (props) => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filteredData, setFilteredData] = useState([]);
  const { defaultCurrency } = useSelector((state) => state.currency)
  // console.log('defaultCurrency: ', defaultCurrency);

  const { redeem, total } = useSelector((state) => state.redeem);

  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state) => state.dialogue
  );


  // console.log("redeem", redeem)

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getDefaultCurrency())
  }, [dispatch])

  useEffect(() => {
    dispatch(getRedeem());
    dispatch(getDefaultCurrency());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(redeem);
  }, [redeem]);

  // pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  // searching
  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setFilteredData(filteredData);
    }
  };

  // table Data

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span className="text-white">{parseInt(index) + 1}</span>,
    },
    {
      Header: "Seller",
      body: "image",
      Cell: ({ row }) => (
        <div className="d-flex">
          <div className="">
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
                  src={row?.sellerId?.image ? row?.sellerId?.image : Male}
                  height={60}
                  width={60}
                  style={{ borderRadius: "13px" }}
                  alt=""
                />
              </>
            )}
          </div>
          <span className="ms-2 boxCenter text-white">
            {row?.sellerId?.firstName ? row?.sellerId?.firstName : "-"}  {row?.sellerId?.lastName ? row?.sellerId?.lastName : "Seller"}
          </span>
        </div>
      ),
    },

    {
      Header: "Business Name",
      body: "businessName",
      Cell: ({ row }) => <span className="text-white">{row?.sellerId?.businessName ? row?.sellerId?.businessName : "-"}</span>,
    },
    // { Header: "Payment Gateway", body: "paymentGateway" },
    // {
    //   Header: "Received Amount",
    //   body: "receivedAmount",
    //   Cell: ({ row }) => (
    //     <span className="ms-2 boxCenter">
    //       <b className="fw-bold">${row.sellerId.receivedAmount}</b>
    //     </span>
    //   ),
    // },
    {
      Header: `Withdrawal Amount (${defaultCurrency?.symbol|| ''})`,
      body: "withdrawalAmount",
      Cell: ({ row }) => <span className="text-white">{row?.amount}</span>,
    },

    {
      Header: "Created Date",
      body: "createdAt",
      Cell: ({ row }) => {
        const date = row.date.split(",");
        return (
          <>
            <span className="text-white">{date[0]}</span>
            <br />
            <span className="text-white">{date[1]}</span>
          </>
        );
      },
    },

    {
      Header: "Pay",
      body: "",
      Cell: ({ row }) => (
        <>
          <Button
            newClass={`themeFont boxCenter userBtn px-4`}
            btnName={`Pay`}
            style={{
              borderRadius: "5px",
              margin: "auto",
              padding: "10px",
              width: "40px",
              backgroundColor: "#DCF6E8",
              color: " #28c76f",
              cursor: "pointer",
            }}
            onClick={() => {
              dispatch({
                type: OPEN_DIALOGUE,
                payload: {
                  data: row,
                  type: "Redeem",
                },
              });
            }}
          />

          {dialogue && dialogueType === "Redeem" && <RedeemDialog />}
        </>
      ),
    },

    // add more columns as needed
  ];

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
          <div className="col-12 headname"> Seller Withdraw </div>
          <div className="sellerMain">
            <div className="tableMain">
              <div className="sellerHeader primeHeader">
                <div className="row">
                  <div className="col-10"></div>
                  <div className="col-2 text-end">

                  </div>
                  <div className="col-4"></div>
                </div>
                <div className="row">
                  <div className="col-2 " id="manageRedeem">
                    <h5
                      className="py-2  fw-bolder text-secondary text-start "
                      style={{
                        borderRadius: "5px",
                        
                      }}
                    >
                      {`Total Amount : ${total ?? 0} ${defaultCurrency?.symbol || ''}`}
                    </h5>

                  </div>
                  <div className="col-10">
                    <Searching
                      type={`client`}
                      data={redeem}
                      setData={setData}
                      column={data}
                      onFilterData={handleFilterData}
                      // serverSearching={handleFilterData}
                      button={true}
                      setSearchValue={setSearch}
                      searchValue={search}
                    />
                  </div>
                </div>
              </div>
              <Table
                data={data}
                mapData={mapData}
                PerPage={rowsPerPage}
                Page={page}
                type={"client"}
              />

              <Pagination
                component="div"
                count={redeem?.length}
                serverPage={page}
                type={"client"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={redeem?.length}
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

export default connect(null, { getRedeem, action })(Redeem);
