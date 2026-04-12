import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { deleteBank, getbank } from "../../store/bank/bank.action";
import { warning } from "../../../util/Alert";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import dayjs from "dayjs";
import Button from "../../extra/Button";
import { OPEN_DIALOGUE } from "../../store/dialogue/dialogue.type";
import BankDialog from "./BankDialog";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import EditInfo from "../../../assets/images/Edit.png";
import Delete from "../../../assets/images/Delete.svg"

import Iconb from "../../extra/Iconb";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteIcon from '@mui/icons-material/Delete';

const BankSetting = () => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const dispatch = useDispatch();

  const { bank } = useSelector((state) => state.bank);
  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state) => state.dialogue
  );
  console.log("dialogueData", dialogueData , "dialogueType", dialogueType , "dialogue", dialogue);
  

  useEffect(() => {
    dispatch(getbank());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(bank);
  }, [bank]);

  // // pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  // Delete bank
  const handleDelete = (id) => {
    const data = warning("Delete");
    data
      .then((isDeleted) => {
        if (isDeleted) {
          dispatch(deleteBank(id));
        }
      })
      .catch((err) => console.log(err));
  };

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span className="text-white fw-normal">{page * rowsPerPage + parseInt(index) + 1}</span>,
    },

    {
      Header: "Bank Name",
      body: "name",
      Cell: ({ row }) => <span className="text-white">{row?.name}</span>,
    },

    {
      Header: "Created Date",
      body: "createdAt",
      Cell: ({ row }) => (
        <span className="text-white">{dayjs(row.createdAt).format("DD MMM YYYY")}</span>
      ),
    },
    {
      Header: "Edit",
      body: "",
      Cell: ({ row }) => (
        <>
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
            onClick={() =>
              dispatch({
                type: OPEN_DIALOGUE,
                payload: { data: row, type: "bank" },
              })
            }

          />
          {dialogue && dialogueType === "bank" && <BankDialog />}
        </>
      ),
    },
    {
      Header: "Delete",
      body: "",
      Cell: ({ row }) => (
        <>
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
        </>
      ),
    },

    // add more columns as needed
  ];
  return (
    <>
      <div className="mainSellerTable">
        <div className="sellerTable">
      
 <div className="col-12 headname" >Bank Setting </div>
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
                          payload: { type: "bank" },
                        });
                      }}
                      style={{ borderRadius: "5px", padding: "8px 32px", background: "#b93160" }}
                    />
                    {dialogue && dialogueType === "bank" && <BankDialog />}
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
              <Pagination
                component="div"
                count={bank?.length}
                serverPage={page}
                type={"client"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={bank?.length}
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

export default BankSetting;
