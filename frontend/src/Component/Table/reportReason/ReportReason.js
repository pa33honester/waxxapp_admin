import React, { useEffect, useState } from 'react'
import Iconb from '../../extra/Iconb';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '../../extra/Button';
import Table from '../../extra/Table';
import { use } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteReportReason, getReportReason } from '../../store/reportReason/reportReason.action';
import ReportReasonDialog from './ReportReasonDialog';
import { OPEN_DIALOGUE } from '../../store/dialogue/dialogue.type';
import { warning } from '../../../util/Alert';

const ReportReason = () => {

    const dispatch = useDispatch();
    const { reportReason } = useSelector((state) => state.reportReason);
    const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
    const [data, setData] = useState([]);



    useEffect(() => {
        dispatch(getReportReason());
    }, []);

    useEffect(() => {
        setData(reportReason)
    }, [reportReason])


    const handleDelete = (id) => {
        const data = warning();
        data
            .then((isDeleted) => {
                if (isDeleted) {
                    dispatch(deleteReportReason(id));
                }
            })
            .catch((err) => console.log(err));
    };

    const mapData = [
        {
            Header: "No",
            width: "20px",
            Cell: ({ index }) => <span className="text-white fw-normal">{index + 1}</span>,
        },

        {
            Header: "Title",
            body: "title",
            Cell: ({ row }) => (
                <div className="">
                    <p className="mb-0 text-capitalize text-white fw-normal">{row.title}</p>
                </div>
            ),
        },

        {
            Header: "Edit",
            body: "",
            Cell: ({ row }) => (
                <Iconb
                    newClass={`themeFont boxCenter infobtn userBtn fs-5`}
                    btnIcon={<CreateOutlinedIcon sx={{ color: '#737272' }} />}
                    style={{
                        borderRadius: "50px",
                        margin: "auto",
                        height: "45px",
                        width: "45px",
                        color: "#160d98",
                    }}
                    isImage={true}
                    onClick={() => {
                        dispatch({
                            type: OPEN_DIALOGUE,
                            payload: { data: row, type: "reportReason" },
                        });
                    }}

                />

            ),
        },
        {
            Header: "Delete",
            body: "",
            Cell: ({ row }) => (

                <Iconb
                    newClass={`themeFont boxCenter killbtn userBtn fs-5`}
                    btnIcon={<DeleteIcon sx={{ color: '#FF4C51' }} />}
                    style={{
                        borderRadius: "50px",
                        margin: "auto",
                        height: "45px",
                        width: "45px",
                        color: "#160d98",

                        padding: "0px"

                    }}
                    isImage={true}
                    isDeleted={true}
                    onClick={() => handleDelete(row?._id)}
                />

            ),
        },

    ];


    return (
        <>
            <div className="mainSellerTable">
                <div className="sellerTable">
                    <div className="col-12 headname">Report Reason</div>
                    <div className="sellerMain">
                        <div className="tableMain mt-2 categoryTable">
                            <div className="sellerHeader primeHeader">
                                <div className="row">
                                    <div className="col-12"  >
                                        <Button
                                            newClass={`whiteFont`}
                                            btnColor={`btnBlackPrime `}
                                            btnIcon={`fa-solid fa-plus `}
                                            btnName={`Add`}
                                            onClick={() => {
                                                dispatch({
                                                    type: OPEN_DIALOGUE,
                                                    payload: { type: "reportReason" },
                                                });
                                            }}
                                            style={{ borderRadius: "5px", padding: "8px 32px", background: "#b93160" }}
                                        />
                                        {dialogue && dialogueType === "reportReason" && <ReportReasonDialog />}
                                    </div>

                                </div>
                            </div>
                            <Table
                                data={data}
                                mapData={mapData}
                                // PerPage={rowsPerPage}
                                // Page={page}
                                type={"client"}
                            />
                        </div>
                    </div>
                    <div className="sellerFooter primeFooter"></div>
                </div>
            </div>
        </>
    )
}

export default ReportReason