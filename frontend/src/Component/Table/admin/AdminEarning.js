import React, { useEffect, useState } from 'react'
import Table from '../../extra/Table'
import Pagination from '../../extra/Pagination'
import Iconb from '../../extra/Iconb';
import { InfoOutlined } from '@mui/icons-material';
// import Skeleton from 'react-loading-skeleton';
// import { colors } from "../../../util/SkeletonColor";
import dayjs from "dayjs";
import DeleteIcon from '@mui/icons-material/Delete';
import DateRangePicker1 from "react-bootstrap-daterangepicker";
import { getAdminEarning } from '../../store/redeem/redeem.action';
import { useDispatch, useSelector } from 'react-redux';
import { use } from 'react';
import { set } from 'date-fns';
import formatImageUrl from '../../extra/functions';
import Skeleton from 'react-loading-skeleton';
import "react-loading-skeleton/dist/skeleton.css";
import { colors } from "../../../util/SkeletonColor";
import defaultImage from "../../../assets/images/default.jpg";
import { get } from 'jquery';
import { getSetting } from '../../store/setting/setting.action';



const AdminEarning = (props) => {

    const dispatch = useDispatch();

    const [size, setSize] = useState(10);
    const [page, setPage] = useState(1);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sDate, setsDate] = useState("All");
    const [eDate, seteDate] = useState("All");

    const { adminEarning, adminTotalEarnings, total } = useSelector((state) => state.redeem);
    const { setting } = useSelector((state) => state.setting);

    useEffect(() => {
        dispatch(getSetting());
        dispatch(getAdminEarning(currentPage, rowsPerPage, sDate, eDate));
    }, [currentPage, rowsPerPage, sDate, eDate]);


    useEffect(() => {
        setData(adminEarning);
    }, [adminEarning])



    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500); // Adjust the delay time as needed

        return () => clearTimeout(timer);
    }, []);


    const handleChangePage = (event, newPage) => {
        setCurrentPage(newPage);
    };

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


    const mapData = [
        {
            Header: "No",
            width: "20px",
            Cell: ({ index }) =>
                <span className="text-white">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                </span>,
        },

        {
            Header: "Order Id",
            body: "orderid",
            Cell: ({ row }) => (
                <span className="boxCenter text-white">

                    {row?.orderId ? row?.orderId : "-"}

                </span>
            ),
        },

        {
            Header: "Product",
            accessor: "product", // accessor property जोड़ी गई है
            Cell: ({ row }) => {
                let imageUrl = formatImageUrl(row?.productImage); // row.original का उपयोग
                return (
                    <div className="d-flex" style={{ paddingLeft: "20px" }}>
                        <div className="position-relative">
                            {loading ? (
                                <Skeleton
                                    height={42}
                                    width={42}
                                    className="StripeElement"
                                    baseColor={colors?.baseColor}
                                    highlightColor={colors?.highlightColor}
                                />
                            ) : (
                                <img
                                    src={imageUrl}
                                    style={{
                                        borderRadius: "90px",
                                        objectFit: "cover",
                                        boxSizing: "border-box",
                                    }}
                                    height={45}
                                    width={45}
                                    alt={row?.productName || "-"}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = defaultImage;
                                    }}
                                />
                            )}
                        </div>
                        <span className="boxCenter text-start ms-3 fw-normal text-white" style={{ paddingLeft: "10px" }}>
                            {row?.productName ? row?.productName : "-"}
                        </span>
                    </div>
                );
            },
        },

        {
            Header: `Seller Name`,
            body: "sellerName",
            Cell: ({ row }) => (
                <span className="mb-0 text-white">{row?.sellerName + " " + row?.lastName}</span>
            ),
        },

        {
            Header: `Business Name`,
            body: "businessName",
            Cell: ({ row }) => (
                <span className="mb-0 text-white">{row?.businessName}</span>
            ),
        },

        {
            Header: `Business Tag`,
            body: "businessTag",
            Cell: ({ row }) => (
                <span className="mb-0 text-white">{row?.businessTag}</span>
            ),
        },

        {
            Header: `Seller Earning (${setting?.currency?.symbol})`,
            body: "sellerEarning",
            Cell: ({ row }) => (
                <span className="mb-0 text-white">{row?.amount}</span>
            ),
        },

        {
            Header: `Admin Earning (${setting?.currency?.symbol})`,
            body: "adminEarning",
            Cell: ({ row }) => (
                <span className="mb-0 text-white">{row?.commissionPerProductQuantity}</span>
            ),
        },

        {
            Header: "Date and Time",
            body: "createdAt",
            Cell: ({ row }) => (
                <span className="text-white">{row.date}</span>
            ),
        },
    ];



    return (
        <div className="mainSellerTable">
            <div className="sellerTable">
                <div className="col-12 headname">Admin Earning</div>
                <div className="sellerMain">
                    <div className="tableMain mt-2">
                        <div className="sellerHeader primeHeader">
                            <div className="d-flex justify-content-between align-items-center">
                                <div className='col-6' style={{ fontWeight: "bold" }} >
                                    Total Admin Earning : {adminTotalEarnings}
                                </div>
                                <div className="col-6 d-flex justify-content-end">
                                    {/* <DateRangePicker
                                        placeholder="Select Date Range"
                                        showOneCalendar={false} // optional
                                        onChange={(value) => {
                                        }}
                                    /> */}
                                    {/* <div className="px-3"> */}
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
                                    {/* </div> */}
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
        </div>
    )
}

export default AdminEarning