import React, { useEffect, useState } from 'react'
import Table from '../../extra/Table'
import Pagination from '../../extra/Pagination'
import Iconb from '../../extra/Iconb';
import { InfoOutlined } from '@mui/icons-material';
import Skeleton from 'react-loading-skeleton';
import "react-loading-skeleton/dist/skeleton.css";
import { colors } from "../../../util/SkeletonColor";
import dayjs from "dayjs";
import DeleteIcon from '@mui/icons-material/Delete';
import DateRangePicker1 from "react-bootstrap-daterangepicker";
import { acceptWithdrawalRequest, declineWithdrawalRequest, getWithdrawalRequest } from '../../store/redeem/redeem.action';
import { useDispatch, useSelector } from 'react-redux';
import { use } from 'react';
import Button from '../../extra/Button';
import defaultImage from "../../../assets/images/default.jpg";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import { warningAccept } from '../../../util/Alert';
import { acceptSellerRequest } from '../../store/sellerRequest/sellerRequest.action';
import { Box, Modal, Typography } from "@mui/material";
import Input from "../../extra/Input";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";


const AdminWithdrawal = (props) => {
    const dispatch = useDispatch();
    const [size, setSize] = useState(10);
    const [page, setPage] = useState(1);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sDate, setsDate] = useState("All");
    const [eDate, seteDate] = useState("All");
    const [status, setStatus] = useState("1");

    // State variables add करें
    const [reasonData, setReasonData] = useState("");
    const [openReason, setOpenReason] = useState(false);
    const [declinedId, setDeclinedId] = useState(null);
    const [error, setError] = useState({
        reason: "",
    });

    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 600,
        backgroundColor: "background.paper",
        borderRadius: "13px",
        border: "1px solid #C9C9C9",
        boxShadow: "24px",
        padding: "19px",
    };


    const { sellerWithdrawal, total } = useSelector((state) => state.redeem);
    console.log("sellerWithdrawal", sellerWithdrawal, total);


    useEffect(() => {
        dispatch(getWithdrawalRequest(currentPage, rowsPerPage, sDate, eDate, status));
    }, [currentPage, rowsPerPage, sDate, eDate, status])


    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500); // Adjust the delay time as needed

        return () => clearTimeout(timer);
    }, []);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event), 10);
        setSize(parseInt(event), 10);
        setCurrentPage(1);
    };

    const handleApply = (event, picker) => {
        picker.element.val(
            picker.startDate.format("YYYY-MM-DD") +
            " / " +
            picker.endDate.format("YYYY-MM-DD")
        );
        const dayStart = dayjs(picker.startDate).format("YYYY-MM-DD");

        const dayEnd = dayjs(picker.endDate).format("YYYY-MM-DD");

        setsDate(dayStart);
        seteDate(dayEnd);

        // dispatch(getUserChart(dayStart, dayEnd));
    };

    //Cancel button function for analytic
    const handleCancel = (event, picker) => {
        picker.element.val("");
        setsDate("All");
        seteDate("All");
        // dispatch(getUserChart("All", "All"));
    };

    useEffect(() => {
        setData(sellerWithdrawal);
    }, [sellerWithdrawal])

    const handleClick = (requestId, personId) => {

        const data = warningAccept();
        data
            .then((isDeleted) => {
                if (isDeleted) {
                    const payload = {
                        requestId,
                        personId
                    };
                    console.log("payload", payload);

                    dispatch(acceptWithdrawalRequest(payload));
                }
            })
            .catch((err) => console.log(err));
    };



    // Decline handler
    const handleDecline = (requestId, sellerId) => {
        setOpenReason(true);
        setDeclinedId({ requestId, sellerId });
    };

    // Modal handlers
    const handleCloseReason = () => {
        setOpenReason(false);
        setReasonData("");
        setError({ reason: "" });
    };

    const handleSubmit = () => {
        if (!reasonData) {
            setError({ reason: "Reason is required" });
            return;
        }

        const payload = {
            requestId: declinedId.requestId,
            personId: declinedId.sellerId,
            reason: reasonData,
        };

        dispatch(declineWithdrawalRequest(payload));
        handleCloseReason();
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
            Header: "Unique Id",
            body: "uniqueId",
            Cell: ({ row }) => (
                <span className="mb-0 text-white">{row?.uniqueId}</span>
            ),
        },

        // {
        //     Header: "Image",
        //     body: "image",
        //     Cell: ({ row }) => {
        //         // Debug ke liye
        //         console.log("Image URL:", row?.sellerId?.image);

        //         return (
        //             <>
        //                 {loading ? (
        //                     <Skeleton
        //                         height={40}
        //                         width={40}
        //                         style={{ borderRadius: "50px", cursor: "pointer" }}
        //                         className="StripeElement"
        //                         baseColor={colors?.baseColor}
        //                         highlightColor={colors?.highlightColor}
        //                     />
        //                 ) : (
        //                     <img
        //                         src={row?.sellerId?.image || defaultImage}
        //                         style={{ borderRadius: "50px", cursor: "pointer" }}
        //                         height={45}
        //                         width={45}
        //                         alt="seller"
        //                         onError={(e) => {
        //                             console.log("Image load error:", e.target.src);
        //                             e.target.onerror = null;
        //                             e.target.src = defaultImage;
        //                         }}
        //                         onLoad={() => console.log("Image loaded successfully")}
        //                     />
        //                 )}
        //             </>
        //         );
        //     },
        // },

        // {
        //     Header: "Seller Name",
        //     body: "seller",
        //     Cell: ({ row }) => (
        //         <span className="mb-0 text-white">{row?.sellerId?.firstName + " " + row?.sellerId?.lastName}</span>
        //     ),
        // },

        {
            Header: "Seller",
            body: "seller",
            Cell: ({ row }) => {
                const seller = row?.sellerId;
                const imageUrl = seller?.image || defaultImage;

                return (
                    <div style={{ display: "flex", alignItems: "center", gap: "20px", justifyContent: "center" }}>
                        {loading ? (
                            <Skeleton
                                height={40}
                                width={40}
                                style={{ borderRadius: "50%", cursor: "pointer" }}
                                className="StripeElement"
                                baseColor={colors?.baseColor}
                                highlightColor={colors?.highlightColor}
                            />
                        ) : (
                            <img
                                src={imageUrl}
                                height={45}
                                width={45}
                                alt="seller"
                                style={{ borderRadius: "50%", cursor: "pointer" }}
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = defaultImage;
                                }}
                                onLoad={() => console.log("Image loaded successfully")}
                            />
                        )}

                        {/* Seller Name */}
                        <span className="mb-0 text-white">
                            {seller?.firstName} {seller?.lastName}
                        </span>
                    </div>
                );
            },
        },




        {
            Header: "Amount",
            body: "amount",
            Cell: ({ row }) => (
                <span className="mb-0 text-white">{row?.amount}</span>
            ),
        },

        {
            Header: "Payment Gateway",
            body: "paymentGateway",
            Cell: ({ row }) => (
                <span className="mb-0 text-white">{row?.paymentGateway}</span>
            ),
        },

        {
            Header:
                status === "1"
                    ? "Created Date"
                    : status === "2"
                        ? "Accepted Date"
                        : status === "3"
                            ? "Declined Date"
                            : "Date",
            body: status === "1" ? "createdAt" : "updatedAt", // Optional, for sorting/filter
            Cell: ({ row }) => (
                <span className="text-white">
                    {status === "1"
                        ? dayjs(row.createdAt).format("DD MMM YYYY")
                        : status === "2"
                            ? dayjs(row.updatedAt).format("DD MMM YYYY")
                            : status === "3"
                                ? dayjs(row.updatedAt).format("DD MMM YYYY")
                                : dayjs(row.createdAt).format("DD MMM YYYY")}
                </span>
            ),
        },


        ...(status === "3" ? [{
            Header: "Reason",
            body: "reason",
            Cell: ({ row }) => (
                <span className="mb-0 text-white" title={row?.reason}>
                    {row?.reason ? (
                        row?.reason.length > 20 ?
                            row?.reason.substring(0, 20) + "..." :
                            row?.reason
                    ) : "N/A"}
                </span>
            ),
        }] : []),

        // Conditional Info Column - केवल status 1 (Pending) में show होगा
        // ...(status === "1" ? [{
        //     Header: "Info",
        //     body: "",
        //     Cell: ({ row }) => (
        //         <Iconb
        //             newClass={`themeFont boxCenter infobtn userBtn fs-5`}
        //             btnIcon={<InfoOutlined sx={{ color: '#737272' }} />}
        //             style={{
        //                 borderRadius: "50px",
        //                 margin: "auto",
        //                 height: "45px",
        //                 width: "45px",
        //                 color: "#160d98",
        //                 padding: "0px"
        //             }}
        //             isImage={true}
        //             isDeleted={true}
        //         // onClick={() => handleOpen(row?._id)}
        //         />
        //     ),
        // }] : []),

        // Conditional Action Column - केवल status 1 (Pending) में show होगा
        // mapData में Action column को update करें
        // ...(status === "1" ? [{
        //     Header: "Action",
        //     body: "",
        //     Cell: ({ row }) => (
        //         <div className="d-flex justify-content-center align-items-center gap-2">
        //             {/* Accept Button - Green theme */}
        //             <button
        //                 className="action-btn accept-btn"
        //                 onClick={() => handleClick(row?._id, row?.sellerId?._id)}
        //                 title="Accept Request"
        //             >
        //                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        //                     <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        //                     <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        //                 </svg>
        //             </button>

        //             {/* Decline Button - Red theme */}
        //             <button
        //                 className="action-btn decline-btn"
        //                 title="Decline Request"
        //                 onClick={() => {
        //                     handleDecline(row?._id, row?.sellerId?._id);
        //                 }}
        //             >
        //                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        //                     <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        //                 </svg>
        //             </button>
        //         </div>
        //     ),
        // }] : []),
        ...(status === "1" ? [{
            Header: "Action",
            body: "",
            Cell: ({ row }) => (
                <div className="d-flex justify-content-center align-items-center gap-2">
                    <Iconb
                        newClass="themeFont boxCenter acptbtn userBtn fs-5"
                        btnIcon={<CheckCircleIcon sx={{ color: "green" }} />}
                        style={{
                            borderRadius: "5px",
                            width: "40px",
                            cursor: "pointer",
                        }}
                        isImage={true}
                        onClick={() => handleClick(row?._id, row?.sellerId?._id)}
                        title="Accept Request"
                    />

                    <Iconb
                        newClass="themeFont boxCenter killbtn userBtn fs-5"
                        btnIcon={<CancelIcon sx={{ color: "red" }} />}
                        style={{
                            borderRadius: "5px",
                            width: "40px",
                            cursor: "pointer",
                        }}
                        isImage={true}
                        onClick={() => handleDecline(row?._id, row?.sellerId?._id)}
                        title="Decline Request"
                    />
                </div>
            ),
        }] : [])
    ];

    return (
        <div className="mainSellerTable">
            <div className="sellerTable">
                <div className="col-12 headname">Seller Withdrawal</div>
                <div className="sellerMain">
                    <div className="tableMain mt-2">
                        <div className="sellerHeader primeHeader">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className="col-6">
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
                                            btnName="Pending"
                                            style={{
                                                borderRadius: "5px 0px 0px 5px",
                                                backgroundColor: status === "Create" ? "#f7dada" : "transparent",
                                                color: status === "1" || status === "All" ? "#b93160" : "#2f2b3db3",
                                                cursor: "pointer",
                                                fontWeight: "500",
                                                opacity: 1,
                                                padding: "10px 20px",
                                                border: "0.5px solid #D8D7DC",
                                                transition: "all 0.2s ease",
                                            }}
                                            onClick={() => setStatus("1")}
                                        />
                                        <Button
                                            newClass="themeFont"
                                            btnName="Accepted"
                                            style={{
                                                borderRadius: "0px 5px 5px 0px",
                                                backgroundColor: status === "Update" ? "#f7dada" : "transparent",
                                                color: status === "2" ? "#b93160" : "#2f2b3db3",
                                                cursor: "pointer",
                                                fontWeight: "500",
                                                opacity: 1,
                                                padding: "10px 20px",
                                                border: "0.5px solid #D8D7DC",
                                                transition: "all 0.3s ease",
                                            }}
                                            onClick={() => setStatus("2")}
                                        />
                                        <Button
                                            newClass="themeFont"
                                            btnName="Declined"
                                            style={{
                                                borderRadius: "0px 5px 5px 0px",
                                                backgroundColor: status === "Update" ? "#f7dada" : "transparent",
                                                color: status === "3" ? "#b93160" : "#2f2b3db3",
                                                cursor: "pointer",
                                                fontWeight: "500",
                                                opacity: 1,
                                                padding: "10px 20px",
                                                border: "0.5px solid #D8D7DC",
                                                transition: "all 0.3s ease",
                                            }}
                                            onClick={() => setStatus("3")}
                                        />
                                    </div>
                                </div>
                                <div className="col-6 d-flex justify-content-end">
                                    {/* <DateRangePicker
                                        placeholder="Select Date Range"
                                        showOneCalendar={false} // optional
                                        onChange={(value) => {
                                            console.log("Selected range: ", value);
                                        }}
                                    /> */}
                                    <div className="px-3">
                                        <DateRangePicker1
                                            initialSettings={{
                                                applyButtonClasses: "btn-default",
                                                autoUpdateInput: false,
                                                locale: {
                                                    cancelLabel: "Clear",
                                                },

                                                maxDate: new Date(),
                                            }}
                                            onApply={handleApply}
                                            onCancel={handleCancel}
                                        >
                                            <input
                                                type="text"
                                                className="form-control text-center datedash my-1 white-placeholder"
                                                placeholder="Select Date"
                                                readonly="readonly"
                                                style={{
                                                    width: "13rem",
                                                    fontWeight: 500,

                                                    cursor: "pointer",
                                                    fontSize: "14px",
                                                    backgroundColor: "#fff"

                                                }}
                                            />
                                        </DateRangePicker1>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <Table
                            data={data}
                            mapData={mapData}
                            serverPerPage={rowsPerPage}
                            serverPage={page}
                            type={"server"}
                        />
                        <Pagination
                            component="div"
                            count={total}
                            type={"server"}
                            onPageChange={handleChangePage}
                            serverPerPage={rowsPerPage}
                            totalData={total}
                            serverPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </div>
                </div>
                <div className="sellerFooter primeFooter"></div>
            </div>

            <Modal
                open={openReason}
                onClose={handleCloseReason}
                aria-labelledby="decline-modal-title"
                aria-describedby="decline-modal-description"
            >
                <Box sx={style} className="decline-modal">
                    <div className="modal-header">
                        <Typography
                            id="decline-modal-title"
                            variant="h5"
                            component="h2"
                            sx={{
                                fontWeight: 600,
                                color: '#1f2937',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2
                            }}
                        >
                            {/* <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center cursor-pointer" onClick={handleCloseReason} >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M18 6L6 18M6 6l12 12" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div> */}
                            Decline Request
                        </Typography>
                    </div>

                    <div style={{ padding: "0px 15px" }}>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Please provide a reason for declining this request
                            </label>
                            <textarea
                                style={{ width: "100%" }}
                                className="reason-textarea w-full"
                                rows={4}
                                value={reasonData}
                                placeholder="Enter your reason for declining this withdrawal request..."
                                onChange={(e) => {
                                    setReasonData(e.target.value);
                                    if (!e.target.value) {
                                        setError({ ...error, reason: "Reason is required" });
                                    } else {
                                        setError({ ...error, reason: "" });
                                    }
                                }}
                            />
                            {error.reason && (
                                <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2" />
                                    </svg>
                                    {error.reason}
                                </p>
                            )}
                        </div>

                        <div className="modal-buttons d-flex justify-content-end">
                            <button
                                onClick={handleCloseReason}
                                className="close-btn"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="submit-btn"
                                style={{ backgroundColor: "#b93160" }}
                            >
                                Decline Request
                            </button>
                        </div>
                    </div>
                </Box>
            </Modal>

        </div>
    )
}

export default AdminWithdrawal