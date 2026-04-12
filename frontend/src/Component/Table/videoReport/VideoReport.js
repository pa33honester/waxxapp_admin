import React, { useEffect, useState } from 'react'
import Skeleton from 'react-loading-skeleton';
import "react-loading-skeleton/dist/skeleton.css";
import { colors } from "../../../util/SkeletonColor";
import Table from '../../extra/Table';
import { deleteVideoReport, getVideoReport, resolveReport } from '../../store/videoReport/videoReport.action';
import { useDispatch, useSelector } from 'react-redux';
import Pagination from '../../extra/Pagination';
import {  warning, warningAccept } from '../../../util/Alert';
import Iconb from '../../extra/Iconb';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { IconPlayerPlayFilled } from '@tabler/icons-react';
import LazyImage from '../../../common/ImageFallback';
import ShowVideo from '../../extra/ShowVideo';
import defaultImage from "../../../assets/images/default.jpg";

const VideoReport = () => {

    const dispatch = useDispatch();
    const { videoReport, totalReportReels } = useSelector((state) => state.videoReport);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [type, setType] = useState("All");
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [show, setShow] = useState(false);
    const [url, setUrl] = useState();

    useEffect(() => {
        dispatch(getVideoReport(type, currentPage, rowsPerPage));
    }, [type, currentPage, rowsPerPage, type])

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setData(videoReport);
    }, [videoReport]);

    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        const newRowsPerPage = parseInt(event, 10);
        setRowsPerPage(newRowsPerPage);
        setCurrentPage(1);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [type]);


    const handleClick = (reportId) => {
        const data = warningAccept();
        data
            .then((isDeleted) => {
                if (isDeleted) {

                    dispatch(resolveReport(reportId));
                }
            })
            .catch((err) => console.log(err));
    };

    const handleDecline = (reportId, reelId) => {
        const data = warning();
        data
            .then((isDeleted) => {
                if (isDeleted) {

                    dispatch(deleteVideoReport(reportId, reelId));
                }
            })
            .catch((err) => console.log(err));
    };

    const handleClose = () => {
        setShow(false);
        setUrl("");
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

        // {
        //     Header: "Video",
        //     body: "video",
        //     Cell: ({ row }) => (
        //         <div className="">
        //             <div className="">
        //                 {loading ? (
        //                     <>
        //                         <Skeleton
        //                             height={54}
        //                             width={51}
        //                             className="StripeElement "
        //                             baseColor={colors?.baseColor}
        //                             highlightColor={colors?.highlightColor}
        //                         />
        //                     </>
        //                 ) : (
        //                     <>
        //                         <video
        //                             src={row?.reelId?.video}
        //                             style={{
        //                                 borderRadius: "10px",
        //                                 objectFit: "cover",
        //                                 boxSizing: "border-box",
        //                             }}
        //                             controls
        //                             height={50}
        //                             width={50}
        //                             alt=""
        //                         />
        //                     </>
        //                 )}
        //             </div>
        //         </div>
        //     ),
        // },

        {
            Header: "VIDEO",
            body: "video",
            Cell: ({ row, index }) => (
                <>
                    <div
                        className="d-flex justify-content-center"
                        onClick={() => {
                            setShow(true);
                            setUrl(row?.reelId?.video);
                        }}
                    >
                        {/* <HandleVideo thumbnail={row?.videoImage} videoUrl={row?.videoUrl} /> */}

                        <div
                            style={{
                                position: "relative",
                                width: "50px",
                                height: "50px",
                                cursor: "pointer",
                            }}
                        >
                            <IconPlayerPlayFilled
                                style={{
                                    position: "absolute",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)", // centers it
                                    zIndex: 1,
                                    fontSize: "20px", // adjust size as needed
                                    color: "white", // optional: make it visible
                                }}
                            />
                            <LazyImage
                                imageSrc={row?.reelId?.thumbnail}
                                width="50px"
                                height="50px"
                                style={{ filter: "brightness(0.5)" }}
                            />
                        </div>
                    </div>
                </>
            ),
        },
        // {
        //     Header: "Thumbnail",
        //     body: "thumbnail",
        //     Cell: ({ row }) => (
        //         <div className="">
        //             <div className="">
        //                 {loading ? (
        //                     <>
        //                         <Skeleton
        //                             height={54}
        //                             width={54}
        //                             className="StripeElement "
        //                             baseColor={colors?.baseColor}
        //                             highlightColor={colors?.highlightColor}
        //                         />
        //                     </>
        //                 ) : (
        //                     <>
        //                         <img
        //                             src={row?.reelId?.thumbnail}
        //                             style={{
        //                                 borderRadius: "10px",
        //                                 objectFit: "cover",
        //                                 boxSizing: "border-box",
        //                             }}
        //                             height={50}
        //                             width={50}
        //                             alt=""
        //                         />
        //                     </>
        //                 )}
        //             </div>
        //         </div>
        //     ),
        // },

        {
            Header: "User",
            body: "images",
            Cell: ({ row }) => (
                <div className="d-flex justify-content-start " style={{ paddingLeft: "10px" }}>
                    <div className="">
                        {loading ? (
                            <>
                                <Skeleton
                                    height={52}
                                    width={55}
                                    className="StripeElement "
                                    baseColor={colors?.baseColor}
                                    highlightColor={colors?.highlightColor}
                                />
                            </>
                        ) : (
                            <>
                                <img
                                    src={row?.userId?.image}
                                    height={55}
                                    width={55}
                                    style={{ borderRadius: "10px" }}
                                    alt=""
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = defaultImage;
                                    }}
                                />
                            </>
                        )}
                    </div>
                    <span className="fw-normal boxCenter text-start ms-2 text-white">
                        {row?.userId ? row?.userId?.firstName + " " + row?.userId?.lastName : ""}
                    </span>
                </div>
            ),
        },

        {
            Header: "Description",
            body: "description",
            Cell: ({ row }) => (
                <div className="">
                    <p className="mb-0 fw-normal text-white">
                        {row?.description
                        }
                    </p>
                </div>
            ),
        },

        {
            Header: "Status",
            body: "status",
            Cell: ({ row }) => (
                <div className="">
                    <p className="mb-0 fw-normal text-white">{row?.status === 1 ? "Pending" : "Solved"}</p>
                </div>
            ),
        },

        {
            Header: "Video reported",
            body: "videoReported",
            Cell: ({ row }) => (
                <div className="">
                    <p className="mb-0 fw-normal text-white">{row?.reportDate?.split(",")[0]}</p>
                </div>
            ),
        },

        // {
        //     Header: "Action",
        //     body: "",
        //     Cell: ({ row }) => (
        //         <div className="d-flex justify-content-center align-items-center gap-2">
        //             <button
        //                 className="action-btn accept-btn"
        //                 onClick={() => handleClick(row?._id)}
        //                 title="Accept Request"
        //             >
        //                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        //                     <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        //                     <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
        //                 </svg>
        //             </button>

        //             <button
        //                 className="action-btn decline-btn"
        //                 title="Decline Request"
        //                 onClick={() => {
        //                     handleDecline(row?._id, row?.reelId?._id);
        //                 }}
        //             >
        //                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        //                     <path
        //                         d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14z"
        //                         stroke="currentColor"
        //                         strokeWidth="2"
        //                         strokeLinecap="round"
        //                         strokeLinejoin="round"
        //                         fill="none"
        //                     />
        //                     <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        //                     <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        //                 </svg>

        //             </button>
        //         </div>
        //     ),
        // }

        ...(type !== "2" ? [
            {
                Header: "Action",
                body: "",
                Cell: ({ row }) => {
                    if (row?.status === 2) {
                        return (
                            <div
                                style={{
                                    color: "#2f2b3de6",
                                    fontWeight: "bold",
                                    textAlign: "center",
                                    width: "80px",
                                    margin: "auto",
                                    userSelect: "none",
                                }}
                            >
                                Solved
                            </div>
                        );
                    }
                    return (
                        <div style={{ display: "flex", justifyContent: "center", gap: "8px" }}>
                            <Iconb
                                newClass={`themeFont boxCenter acptbtn userBtn fs-5`}
                                btnIcon={<CheckCircleIcon sx={{ color: "green" }} />}
                                style={{
                                    borderRadius: "5px",
                                    width: "40px",
                                    color: "green",
                                    cursor: "pointer",
                                }}
                                onClick={() => handleClick(row?._id)}
                            />

                            <Iconb
                                newClass={`themeFont boxCenter killbtn userBtn fs-5`}
                                btnIcon={<CancelIcon sx={{ color: "red" }} />}
                                style={{
                                    borderRadius: "5px",
                                    width: "40px",
                                    color: "red",
                                    cursor: "pointer",
                                }}
                                onClick={() => {
                                    handleDecline(row?._id, row?.reelId?._id);
                                }}
                            />
                        </div>
                    );
                }
            }
        ] : []),



    ];
    return (
        <>
            <ShowVideo
                title={"Video"}
                show={show}
                url={url}
                handleClose={handleClose}
            />
            <div className="mainSellerTable">
                <div className="sellerTable">
                    <div className="col-12 headname">Reels Report</div>
                    <div className="sellerMain">
                        <div className="tableMain mt-2 categoryTable">
                            <div className="sellerHeader primeHeader">
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
                                                {type ? (
                                                    <span className="caret text-black">{type === "All"
                                                        ? "All"
                                                        : type === "1"
                                                            ? "Pending"
                                                            : type === "2"
                                                                ? "Solved"
                                                                : "Type"
                                                    }
                                                    </span>
                                                ) : (
                                                    <span className="caret text-capitalize">Type</span>
                                                )}
                                            </button>
                                            <ul className="dropdown-menu">
                                                <li style={{ cursor: "pointer" }}>
                                                    <a
                                                        className="dropdown-item"
                                                        href={() => false}
                                                        onClick={() => setType("All")}
                                                    >
                                                        All
                                                    </a>
                                                </li>
                                                <li style={{ cursor: "pointer" }}>
                                                    <a
                                                        className="dropdown-item"
                                                        href={() => false}
                                                        onClick={() => setType("1")}
                                                    >
                                                        Pending
                                                    </a>
                                                </li>
                                                <li style={{ cursor: "pointer" }}>
                                                    <a
                                                        className="dropdown-item"
                                                        href={() => false}
                                                        onClick={() => setType("2")}
                                                    >
                                                        Solved
                                                    </a>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>

                                </div>
                            </div>
                            <Table
                                data={data}
                                mapData={mapData}
                                serverPerPage={rowsPerPage}      // Direct use
                                serverPage={currentPage}        // Direct use
                                type={"server"}
                            />
                            <Pagination
                                component="div"
                                count={totalReportReels}
                                type={"server"}
                                onPageChange={handleChangePage}
                                serverPerPage={rowsPerPage}
                                totalData={totalReportReels}
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
    )
}

export default VideoReport