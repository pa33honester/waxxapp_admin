import Table from "../../extra/Table";
import Button from "../../extra/Button";
import { connect, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { OPEN_DIALOGUE } from "../../store/dialogue/dialogue.type";
import {
  getWithdraw,
  enabledDisabled,
} from "../../store/withdraw/withdraw.action";
import ToggleSwitch from "../../extra/ToggleSwitch";
import dayjs from "dayjs";
import WithdrawDialog from "./WithdrawDialog";
import Pagination from "../../extra/Pagination";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import "react-loading-skeleton/dist/skeleton.css";
import defaultImage from "../../../assets/images/default.jpg";

import Iconb from "../../extra/Iconb";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import { baseURL } from "../../../util/config";


const Withdraw = (props) => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const dispatch = useDispatch();

  const { withdraw } = useSelector((state) => state.withdraw);
  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state) => state.dialogue
  );

  useEffect(() => {
    dispatch(getWithdraw());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(withdraw);
  }, [withdraw]);

  // // pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const handleClick = (withdrawDetail) => {
    props.enabledDisabled(
      withdrawDetail,
      withdrawDetail?.isEnabled === true ? false : true
    );
  };

  // Delete Withdraw

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span className="text-white fw-normal">{page * rowsPerPage + parseInt(index) + 1}</span>,
    },

    {
      Header: "Image",
      body: "withdraw",
      Cell: ({ row }) => (
        <>
          {loading ? (
            <>
              <Skeleton
                height={100}
                width={100}
                className="StripeElement "
                baseColor={colors?.baseColor}
                highlightColor={colors?.highlightColor}
              />
            </>
          ) : (
            <>
              <img src={row.image ? row?.image.includes("http") ? row?.image : baseURL + row?.image : defaultImage}
               width={100} height={100}
                alt="" 
                srcset="" 
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultImage;
                }}
                />
            </>
          )}
        </>
      ),
    },
    {
      Header: "Name",
      body: "name",
      Cell: ({ row }) => (
        <span className="text-white">{row?.name}</span>
      ),
    },

    {
      Header: "Details",
      body: "details",
      Cell: ({ row }) => {
        return (
          <>
            {row.details.map((condition, i) => (
              <>
                <div key={i} className="d-flex justify-content-start ">
                  <i
                    style={{ color: "#b93160", fontSize: "15px" }}
                    className="bi bi-circle-fill mb-1 text-era"
                  ></i>
                  <span className="ms-2 text-white"
                    style={{
                      fontWeight: "normal"
                    }}
                  >{condition}</span>
                </div>
              </>
            ))}
          </>
        );
      },
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
                payload: { data: row, type: "withdraw" },
              })
            }

          />
          {dialogue && dialogueType === "withdraw" && <WithdrawDialog />}
        </>
      ),
    },
    {
      Header: "is Active",
      body: "",
      Cell: ({ row }) => (
        <>
          <div className="boxCenter">
            <ToggleSwitch
              value={row.isEnabled}
              onClick={() => handleClick(row)}
            />
          </div>
        </>
      ),
    },

    // add more columns as needed
  ];
  return (
    <>
      <div className="mainSellerTable">
        <div className="sellerTable">
 <div className="col-12 headname" >Withdraw Setting </div>
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
                          payload: { type: "withdraw" },
                        });
                      }}
                      style={{ borderRadius: "5px", padding: "8px 32px", background: "#b93160" }}
                    />
                    {dialogue && dialogueType === "withdraw" && <WithdrawDialog />}
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
                count={withdraw?.length}
                serverPage={page}
                type={"client"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={withdraw?.length}
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

export default connect(null, { getWithdraw, enabledDisabled })(Withdraw);
