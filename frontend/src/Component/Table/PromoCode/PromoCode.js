import {  useNavigate } from "react-router-dom";
import Table from "../../extra/Table";
import Button from "../../extra/Button";
import Iconb from "../../extra/Iconb";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { connect, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { OPEN_DIALOGUE } from "../../store/dialogue/dialogue.type";
import {
  getPromoCode,
  deletePromoCode,
} from "../../store/PromoCode/promoCode.action";
import dayjs from "dayjs";
import PromoDialog from "./PromoDialog";
import {  warning } from "../../../util/Alert";

const PromoCode = (props) => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { promoCode } = useSelector((state) => state.promoCode);
  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state) => state.dialogue
  );

  useEffect(() => {
    dispatch(getPromoCode());
  }, [dispatch]);
  useEffect(() => {
    setData(promoCode);
  }, [promoCode]);

  // Delete PromoCode
  const handleDelete = (id) => {
    const data = warning();
    data
      .then((isDeleted) => {
        if (isDeleted) {
          props.deletePromoCode(id);
        }
      })
      .catch((err) => console.log(err));
  };

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span className="text-white fw-normal">{parseInt(index) + 1}</span>,
    },

    {
      Header: "Promo Code", body: "promoCode",

      Cell: ({ row }) => (
        <>
          <span className="text-white fw-normal">
            {row.promoCode} $
          </span>
        </>
      ),
    },
    {
      Header: "Discount",
      body: "discountAmount",
      Cell: ({ row }) => (
        <>
          {row.discountType === 0 && (
            <>
              <span className="text-white fw-normal">
                {row.discountAmount} $
              </span>
            </>
          )}
          {row.discountType === 1 && (
            <>
              <span className="text-white fw-normal">
                {row.discountAmount} %
              </span>
            </>
          )}
        </>
      ),
    },
    {
      Header: "Min. Order Value",
      body: "minOrderValue",
      Cell: ({ row }) => (
        <>
          <span className="text-white fw-normal">
            {row.minOrderValue} $
          </span>
        </>
      ),
    },
    {
      Header: "Conditions",
      body: "conditions",

      Cell: ({ row }) => {
        return (
          <>
            {row.conditions.map((condition, i) => (
              <>
                <div key={i} className=" text-start d-flex">
                  <div style={{ color: "#FF2929" }}>✔ </div>
                  <span className="ms-2 text-white fw-normal">{condition}</span>
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
        <span className="text-white fw-normal">{dayjs(row.createdAt).format("DD MMM YYYY")}</span>
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
                payload: { data: row, type: "promoCode" },
              })
            }

          />
          {/* <Button
            newClass={`themeFont boxCenter userBtn fs-5`}
            
            btnIcon={`far fa-edit`}
            style={{
              borderRadius: "5px",
              margin: "auto",
              width: "40px",
              backgroundColor: "#fff",
              color: "#160d98",
            }}
            onClick={() =>
              dispatch({
                type: OPEN_DIALOGUE,
                payload: { data: row, type: "promoCode" },
              })
            }
          /> */}

          {/* {dialogue && dialogueType === "promoCode" && <PromoDialog />}  */}
        
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
            onClick={() => handleDelete(row._id)}
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
          <div className="col-12 headname">PromoCode </div>
          <div className="sellerMain">
            <div className="tableMain mt-2">
              <div className="row">
               <div className="col-12" style={{ margin: "12px" }}>
                <Button
                  newClass={`whiteFont`}
                  btnColor={`btnBlackPrime`}
                  btnIcon={`fa-solid fa-plus`}
                  btnName={`Add`}
                  onClick={() => {
                    dispatch({
                      type: OPEN_DIALOGUE,
                      payload: { type: "promoCode" },
                    });
                  }}
                  style={{ borderRadius: "5px", padding: "8px 32px", background: "#b93160" }}
                />
                {dialogue && dialogueType === "promoCode" && <PromoDialog />}
              </div>
              <div className="col-2 text-end">

              </div>

            </div>
              <Table
                data={data}
                mapData={mapData}
                PerPage={rowsPerPage}
                Page={page}
                type={"client"}
              />
              
            </div>
          </div>
          <div className="sellerFooter primeFooter"></div>
        </div>
      </div>
    </>
  );
};

export default connect(null, { getPromoCode, deletePromoCode })(PromoCode);

