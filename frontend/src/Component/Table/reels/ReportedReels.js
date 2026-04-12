import React, { useEffect, useState } from "react";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import { connect, useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Searching from "../../extra/Searching";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import dayjs from "dayjs";
import { getReportedReel } from "../../store/reels/reels.action";

const ReportedReels = (props) => {

  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { reportedReels, totalReportOfReels } = useSelector(
    (state) => state.reels
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getReportedReel(currentPage, size));
  }, [dispatch, currentPage, size]);
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(reportedReels);
  }, []);

  // searching

  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  // // pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event), 10);
    setSize(parseInt(event), 10);
    setCurrentPage(1);
  };

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span>{index + 1}</span>,
    },
    {
      Header: "Video",
      body: "video",
      Cell: ({ row }) => (
        <div className="">
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
                <video
                  src={row?.reelId?.video}
                  style={{
                    borderRadius: "10px",
                    objectFit: "cover",
                    boxSizing: "border-box",
                  }}
                  controls
                  height={60}
                  width={60}
                  alt=""
                />
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      Header: "User",
      body: "userId",
      Cell: ({ row }) => (
        <span className="boxCenter">
          <b className="fw-bold text-dark">
            {row?.userId?.firstName + " " + row?.userId?.lastName}
          </b>
        </span>
      ),
    },
    {
      Header: "Description",
      body: "description",
      Cell: ({ row }) => (
        <span className="mb-0">
          {row?.description ? row?.description : "-"}
        </span>
      ),
    },
    {
      Header: "Report Date",
      body: "reportDate",
      Cell: ({ row }) => (
        <span className="mb-0">{row.reportDate ? row.reportDate : "-"}</span>
      ),
    },

    // add more columns as needed
  ];
  return (
    <>
      <div className="mainSellerTable">
        <div className="sellerTable">
          <div className="sellerHeader primeHeader">
            <div className="row">
              <div className="col-2"></div>
              <div className="col-10 text-end">
                <Searching
                  type={`client`}
                  data={reportedReels}
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
          <div className="sellerMain">
            <div className="tableMain mt-2">
              <Table
                data={data}
                mapData={mapData}
                serverPerPage={rowsPerPage}
                serverPage={page}
                type={"server"}
              />
              <Pagination
                component="div"
                count={totalReportOfReels}
                type={"server"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={totalReportOfReels}
                serverPage={currentPage}
                setCurrentPage={setCurrentPage}
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

export default connect(null, { getReportedReel })(ReportedReels);
