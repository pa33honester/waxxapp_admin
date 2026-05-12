import { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import Searching from "../../extra/Searching";
import { warning, warningAccept } from "../../../util/Alert";
import {
  getAccountRequests,
  approveAccountRequest,
  rejectAccountRequest,
  deleteAccountRequest,
} from "../../store/accountRequest/accountRequest.action";

// Pending sign-up requests collected by the in-app sign-up assistant
// chatbot. Admins approve (creates the real account) or reject each one.
const AccountRequests = (props) => {
  const dispatch = useDispatch();
  const { accountRequests } = useSelector((state) => state.accountRequest);

  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(getAccountRequests());
  }, [dispatch]);

  useEffect(() => {
    setData(accountRequests);
  }, [accountRequests]);

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  const handleApprove = (id) => {
    warningAccept()
      .then((ok) => {
        if (ok) props.approveAccountRequest(id);
      })
      .catch((err) => console.log(err));
  };

  const handleReject = (id) => {
    // eslint-disable-next-line no-alert
    const reason = window.prompt("Reason for rejecting (optional):", "");
    if (reason === null) return; // cancelled
    props.rejectAccountRequest(id, reason.trim());
  };

  const handleDelete = (id) => {
    warning()
      .then((ok) => {
        if (ok) props.deleteAccountRequest(id);
      })
      .catch((err) => console.log(err));
  };

  const statusBadge = (status) => {
    const map = {
      pending: { bg: "#ffc107", color: "#000" },
      approved: { bg: "#178B21", color: "#fff" },
      rejected: { bg: "#dc3545", color: "#fff" },
    };
    const s = map[status] || { bg: "#6c757d", color: "#fff" };
    return (
      <span
        style={{
          background: s.bg,
          color: s.color,
          padding: "3px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          textTransform: "capitalize",
        }}
      >
        {status}
      </span>
    );
  };

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => (
        <span className="text-white fw-normal">{page * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Name",
      body: "name",
      Cell: ({ row }) => (
        <span className="text-white text-capitalize">
          {[row?.firstName, row?.lastName].filter(Boolean).join(" ") || "-"}
        </span>
      ),
    },
    {
      Header: "Email",
      body: "email",
      Cell: ({ row }) => <span className="text-white">{row?.email || "-"}</span>,
    },
    {
      Header: "Phone",
      body: "mobileNumber",
      Cell: ({ row }) => (
        <span className="text-white">
          {row?.mobileNumber ? `${row?.countryCode ? row.countryCode + " " : ""}${row.mobileNumber}` : "-"}
        </span>
      ),
    },
    {
      Header: "Status",
      body: "status",
      Cell: ({ row }) => statusBadge(row?.status),
    },
    {
      Header: "Submitted",
      body: "createdAt",
      Cell: ({ row }) => (
        <span className="text-white">{row?.createdAt ? dayjs(row.createdAt).format("DD MMM YYYY") : "-"}</span>
      ),
    },
    {
      Header: "Action",
      body: "action",
      Cell: ({ row }) => (
        <div className="d-flex justify-content-center gap-2">
          {row?.status === "pending" ? (
            <>
              <button
                className="btn btn-sm"
                style={{ background: "#178B21", color: "#fff" }}
                onClick={() => handleApprove(row._id)}
              >
                Approve
              </button>
              <button
                className="btn btn-sm"
                style={{ background: "#dc3545", color: "#fff" }}
                onClick={() => handleReject(row._id)}
              >
                Reject
              </button>
            </>
          ) : (
            <span className="text-secondary">—</span>
          )}
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => handleDelete(row._id)}
            title="Delete"
          >
            <i className="fa fa-trash" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="mainSellerTable">
      <div className="sellerTable">
        <div className="col-12 headname">Account Requests</div>
        <div className="sellerMain">
          <div className="tableMain mt-2">
            <div className="sellerHeader primeHeader">
              <div className="row">
                <div className="col-2"></div>
                <div className="col-10">
                  <Searching
                    type={"client"}
                    data={accountRequests}
                    setData={setData}
                    onFilterData={handleFilterData}
                    serverSearching={handleFilterData}
                  />
                </div>
              </div>
            </div>
            <Table data={data} mapData={mapData} PerPage={rowsPerPage} Page={page} type={"client"} />
            <Pagination
              component="div"
              count={accountRequests?.length}
              serverPage={page}
              type={"client"}
              onPageChange={handleChangePage}
              serverPerPage={rowsPerPage}
              totalData={accountRequests?.length}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </div>
        <div className="sellerFooter primeFooter"></div>
      </div>
    </div>
  );
};

export default connect(null, {
  getAccountRequests,
  approveAccountRequest,
  rejectAccountRequest,
  deleteAccountRequest,
})(AccountRequests);
