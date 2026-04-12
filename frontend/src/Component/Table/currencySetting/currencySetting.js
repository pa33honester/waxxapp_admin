import Table from "../../extra/Table";
import Button from "../../extra/Button";
import { connect, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { OPEN_DIALOGUE } from "../../store/dialogue/dialogue.type";
import ToggleSwitch from "../../extra/ToggleSwitch";
import dayjs from "dayjs";
import Pagination from "../../extra/Pagination";
import { warning } from "../../../util/Alert";
import EditInfo from "../../../assets/images/Edit.png";
import "react-loading-skeleton/dist/skeleton.css";
import CurrencySettingDialog from "./currencySettingDialog";
import Delete from "../../../assets/images/Delete.svg"
import { deleteCurrency, enabledDisabled, getCurrency, getDefaultCurrency } from "../../store/currency/currency.action";

import Iconb from "../../extra/Iconb";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteIcon from '@mui/icons-material/Delete';

const CurrencySetting = (props) => {
    const [page, setPage] = useState(0);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const dispatch = useDispatch();

    const { currency } = useSelector((state) => state.currency);

    console.log("currency", currency)

    const { dialogue, dialogueType, dialogueData } = useSelector(
        (state) => state.dialogue
    );

    useEffect(() => {
        dispatch(getCurrency());
    }, [dispatch]);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1500); // Adjust the delay time as needed

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        setData(currency);
    }, [currency]);

    // // pagination
    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event, 10));
        setPage(0);
    };

    const handleClick = (currencyDetail) => {
        dispatch(enabledDisabled(currencyDetail));
    };

    // Delete fake reels
    const handleDelete = (id) => {
        const data = warning();
        data
            .then((isDeleted) => {
                if (isDeleted) {
                    dispatch(deleteCurrency(id));
                }
            })
            .catch((err) => console.log(err));
    };

    // Delete CurrencySetting

    const mapData = [
        {
            Header: "No",
            width: "20px",
            Cell: ({ index }) => <span className="text-white">{parseInt(index) + 1}</span>,
        },

        {
            Header: "Name",
            body: "name",
            Cell: ({ row }) => (
                <span className="text-white">{row?.name}</span>
            ),
        },

        {
            Header: "Symbol",
            body: "symbol",
            Cell: ({ row }) => (
                <span className="text-white">{row?.symbol ? row?.symbol : "-"}</span>
            ),
        },

        {
            Header: "Currency Code",
            body: "currency code",
            Cell: ({ row }) => (
                <span className="text-white">{row?.currencyCode ? row?.currencyCode : "-"}</span>
            ),
        },

        {
            Header: "Country Code",
            body: "country code",
            Cell: ({ row }) => (
                <span className="text-white">{row?.countryCode ? row?.countryCode : "-"}</span>
            ),
        },


        {
            Header: "Is Default",
            body: "is default",
            Cell: ({ row }) => (
                <>
                    <div className="boxCenter">
                        {/* <ToggleSwitch
                            value={row?.isDefault}
                            onClick={() => handleClick(row)}
                        /> */}
                        <ToggleSwitch
                            value={row?.isDefault}
                            onClick={() => {
                                // Only allow click if NOT single data, isDefault
                                if (!(data.length === 1 && row.isDefault)) {
                                    handleClick(row);
                                }
                            }}
                            disabled={data.length === 1 && row.isDefault}
                        />

                    </div>
                </>
            ),
        },

        {
            Header: "Created Date",
            body: "createdAt",
            Cell: ({ row }) => (
                <span className="text-white">{dayjs(row?.createdAt).format("DD MMM YYYY")}</span>
            ),
        },
        {
            Header: "Action",
            body: "",
            Cell: ({ row }) => (
                <div className="d-flex ">
                    <Iconb
                        newClass={`themeFont boxCenter infobtn userBtn fs-5`}
                        btnIcon={<CreateOutlinedIcon sx={{ color: '#737272' }} />}
                        style={{
                            borderRadius: "50px",
                            margin: "auto",
                            height: "40px",
                            width: "40px",
                            color: "#160d98",


                        }}
                        isImage={true}
                        onClick={() =>
                            dispatch({
                                type: OPEN_DIALOGUE,
                                payload: { data: row, type: "currency" },
                            })
                        }

                    />

                    <Iconb
                        newClass={`themeFont boxCenter killbtn userBtn fs-5`}
                        btnIcon={<DeleteIcon sx={{ color: '#FF4C51' }} />}
                        style={{
                            borderRadius: "50px",
                            margin: "auto",
                            height: "40px",
                            width: "40px",
                            color: "#160d98",

                            padding: "0px"

                        }}
                        isImage={true}
                        isDeleted={true}
                        onClick={() => handleDelete(row?._id)}

                    />
                    {dialogue && dialogueType === "currency" && <CurrencySettingDialog />}
                </div>
            ),
        },


        // add more columns as needed
    ];
    return (
        <>
            <div className="mainSellerTable">
                <div className="sellerTable">

                    <div className="col-12 headname" >Currency Setting </div>
                    <div className="sellerMain">
                        <div className="tableMain mt-2">
                            <div className="sellerHeader primeHeader">
                                <div className="row">
                                    <div className="col-10">
                                        <Button
                                            newClass={`whiteFont`}
                                            btnColor={`btnBlackPrime`}
                                            btnIcon={`fa-solid fa-plus`}
                                            btnName={`Add`}
                                            onClick={() => {
                                                dispatch({
                                                    type: OPEN_DIALOGUE,
                                                    payload: { type: "currency" },
                                                });
                                            }}
                                            style={{ borderRadius: "5px", padding: "8px 32px", background: "#b93160" }}
                                        />
                                        {dialogue && dialogueType === "currency" && <CurrencySettingDialog />}
                                    </div>
                                    <div className="col-2 text-end"></div>
                                </div>
                            </div>
                            <Table
                                data={data}
                                mapData={mapData}
                                PerPage={rowsPerPage}
                                Page={page}
                                type={"client"}
                            />
                            {/* <Pagination
                                component="div"
                                count={currency?.length}
                                serverPage={page}
                                type={"client"}
                                onPageChange={handleChangePage}
                                serverPerPage={rowsPerPage}
                                totalData={currency?.length}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                            /> */}
                        </div>
                    </div>
                    <div className="sellerFooter primeFooter"></div>
                </div>
            </div>
        </>
    );
};

export default connect(null, { getCurrency, enabledDisabled })(CurrencySetting);
