import { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import dayjs from "dayjs";

import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import Searching from "../../extra/Searching";
import Button from "../../extra/Button";
import { warningAccept } from "../../../util/Alert";
import defaultImage from "../../../assets/images/default.jpg";

import {
  getVerificationQueue,
  reviewVerification,
} from "../../store/verification/verification.action";

const STATUS_FILTERS = [
  { value: "pending_review", label: "Pending" },
  { value: "verified", label: "Verified" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const Verification = (props) => {
  const dispatch = useDispatch();
  const { queue, total } = useSelector((state) => state.verification);

  const [statusFilter, setStatusFilter] = useState("pending_review");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [openSelfie, setOpenSelfie] = useState(null); // { url, userName }
  const [rejectingFor, setRejectingFor] = useState(null); // verificationId
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    dispatch(getVerificationQueue(statusFilter, 1, 200));
  }, [dispatch, statusFilter]);

  useEffect(() => {
    setData(queue);
  }, [queue]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

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

  const handleApprove = (verificationId) => {
    const data = warningAccept();
    data
      .then((isAccepted) => {
        if (isAccepted) {
          dispatch(reviewVerification(verificationId, "verified", null));
        }
      })
      .catch((err) => console.log(err));
  };

  const submitRejection = () => {
    if (!rejectingFor) return;
    dispatch(reviewVerification(rejectingFor, "rejected", rejectionReason || null));
    setRejectingFor(null);
    setRejectionReason("");
  };

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span className="text-white fw-normal">{page * rowsPerPage + parseInt(index) + 1}</span>,
    },
    {
      Header: "User",
      Cell: ({ row }) => (
        <div className="d-flex align-items-center">
          <img
            src={row?.userId?.image || defaultImage}
            height={40}
            width={40}
            style={{ borderRadius: "50%" }}
            alt=""
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />
          <div className="ms-3 text-start">
            <div className="text-white fw-normal text-capitalize">
              {(row?.userId?.firstName || "") + " " + (row?.userId?.lastName || "")}
            </div>
            <div className="text-secondary" style={{ fontSize: "12px" }}>
              {row?.userId?.email || row?.userId?.mobileNumber || "-"}
            </div>
          </div>
        </div>
      ),
    },
    {
      Header: "Selfie",
      Cell: ({ row }) => (
        <>
          {row?.selfieFile ? (
            <img
              src={row.selfieFile}
              height={48}
              width={48}
              style={{ borderRadius: "8px", objectFit: "cover", cursor: "pointer" }}
              alt="selfie"
              onClick={() =>
                setOpenSelfie({
                  url: row.selfieFile,
                  userName: (row?.userId?.firstName || "") + " " + (row?.userId?.lastName || ""),
                })
              }
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = defaultImage;
              }}
            />
          ) : (
            <span className="text-white">-</span>
          )}
        </>
      ),
    },
    {
      Header: "Auto-check",
      Cell: ({ row }) => {
        const a = row?.autoCheckResult || {};
        return (
          <div className="text-white" style={{ fontSize: "11px", lineHeight: 1.3 }}>
            <div>faces: {a.faceCount ?? "-"}</div>
            <div>L eye: {a.leftEyeOpen != null ? Number(a.leftEyeOpen).toFixed(2) : "-"}</div>
            <div>R eye: {a.rightEyeOpen != null ? Number(a.rightEyeOpen).toFixed(2) : "-"}</div>
            <div>area: {a.faceAreaRatio != null ? Number(a.faceAreaRatio).toFixed(2) : "-"}</div>
          </div>
        );
      },
    },
    {
      Header: "Status",
      Cell: ({ row }) => {
        const color =
          row.status === "verified" ? "#1D9BF0" : row.status === "rejected" ? "#dc3545" : "#ffc107";
        return (
          <span
            className="px-2 py-1"
            style={{
              backgroundColor: color,
              color: "#000",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
            }}
          >
            {row.status?.replace("_", " ")}
          </span>
        );
      },
    },
    {
      Header: "Submitted",
      Cell: ({ row }) => (
        <span className="text-white">{dayjs(row.createdAt).format("DD MMM YYYY HH:mm")}</span>
      ),
    },
    {
      Header: "Reviewed",
      Cell: ({ row }) => (
        <span className="text-white">
          {row?.reviewedAt ? dayjs(row.reviewedAt).format("DD MMM YYYY HH:mm") : "-"}
        </span>
      ),
    },
    {
      Header: "Reason",
      Cell: ({ row }) => (
        <span className="text-white" style={{ fontSize: "12px" }}>
          {row?.rejectionReason || "-"}
        </span>
      ),
    },
    {
      Header: "Action",
      Cell: ({ row }) =>
        row.status === "pending_review" ? (
          <div className="d-flex" style={{ gap: "6px" }}>
            <Button
              newClass="text-white fw-normal"
              btnName="Approve"
              style={{
                borderRadius: "5px",
                backgroundColor: "#1D9BF0",
                padding: "4px 12px",
                fontSize: "12px",
              }}
              onClick={() => handleApprove(row._id)}
            />
            <Button
              newClass="text-white fw-normal"
              btnName="Reject"
              style={{
                borderRadius: "5px",
                backgroundColor: "#dc3545",
                padding: "4px 12px",
                fontSize: "12px",
              }}
              onClick={() => {
                setRejectingFor(row._id);
                setRejectionReason("");
              }}
            />
          </div>
        ) : (
          <span className="text-secondary" style={{ fontSize: "12px" }}>—</span>
        ),
    },
  ];

  return (
    <>
      <div className="mainSellerTable">
        <div className="sellerTable">
          <div className="col-12 headname">Selfie Verifications</div>
          <div className="sellerMain">
            <div className="tableMain mt-2">
              <div className="sellerHeader primeHeader">
                <div className="row align-items-center">
                  <div className="col-4 d-flex align-items-center" style={{ gap: "8px" }}>
                    <label className="text-white fw-normal mb-0">Filter:</label>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: "160px" }}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {STATUS_FILTERS.map((f) => (
                        <option key={f.value} value={f.value}>
                          {f.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-white" style={{ fontSize: "12px" }}>
                      Total: {total}
                    </span>
                  </div>
                  <div className="col-8">
                    <Searching
                      type={"client"}
                      data={queue}
                      setData={setData}
                      onFilterData={handleFilterData}
                      serverSearching={handleFilterData}
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
                count={data?.length || 0}
                serverPage={page}
                type={"client"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={data?.length || 0}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </div>
          <div className="sellerFooter primeFooter"></div>
        </div>
      </div>

      {/* Selfie preview modal */}
      {openSelfie && (
        <div
          onClick={() => setOpenSelfie(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
            <div className="text-white text-center mb-2">{openSelfie.userName}</div>
            <img
              src={openSelfie.url}
              style={{ maxWidth: "90vw", maxHeight: "80vh", borderRadius: "8px" }}
              alt="selfie"
            />
          </div>
        </div>
      )}

      {/* Rejection reason modal */}
      {rejectingFor && (
        <div
          onClick={() => setRejectingFor(null)}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#1a1a1a",
              padding: "24px",
              borderRadius: "12px",
              minWidth: "400px",
              maxWidth: "500px",
            }}
          >
            <h5 className="text-white">Reject this verification</h5>
            <p className="text-secondary" style={{ fontSize: "13px" }}>
              Provide a reason that will be shown to the user. They can retake the selfie and resubmit.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Photo doesn't show your full face"
              rows={4}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "6px",
                backgroundColor: "#0e0e0e",
                color: "#fff",
                border: "1px solid #333",
              }}
            />
            <div className="d-flex justify-content-end mt-3" style={{ gap: "8px" }}>
              <Button
                newClass="text-white fw-normal"
                btnName="Cancel"
                style={{
                  borderRadius: "5px",
                  backgroundColor: "#444",
                  padding: "6px 16px",
                }}
                onClick={() => setRejectingFor(null)}
              />
              <Button
                newClass="text-white fw-normal"
                btnName="Reject"
                style={{
                  borderRadius: "5px",
                  backgroundColor: "#dc3545",
                  padding: "6px 16px",
                }}
                onClick={submitRejection}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default connect(null, { getVerificationQueue, reviewVerification })(Verification);
