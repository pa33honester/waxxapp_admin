import { Link, Navigate, useNavigate } from "react-router-dom";
import Table from "../../extra/Table";
import Button from "../../extra/Button";
import Title from "../../extra/Title";
import { connect, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  getFakeSeller,
  deleteFakeSeller,
  sellerIsLive,
  setOfflineStatus,
} from "../../store/fake Seller/fakeSeller.action";
import ToggleSwitch from "../../extra/ToggleSwitch";
import dayjs from "dayjs";
import Pagination from "../../extra/Pagination";
import Searching from "../../extra/Searching";
import { OPEN_DIALOGUE } from "../../store/dialogue/dialogue.type";
// import SellerNotification from "./SellerNotification";
import { warning } from "../../../util/Alert";
import FakeSellerDialogue from "./FakeSellerDialogue";
import "react-loading-skeleton/dist/skeleton.css";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import EditInfo from "../../../assets/images/Edit.png";
import Delete from "../../../assets/images/Delete.svg"

import Iconb from "../../extra/Iconb";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tv } from "lucide-react";
import OnLiveDialogue from "./LiveSellerDialogue";
import LiveSellerDialogue from "./LiveSellerDialogue";
import LazyImage from "../../../common/ImageFallback";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import ShowVideo from "../../extra/ShowVideo";
import { MdOutlineLiveTv } from "react-icons/md";

const FakeSeller = (props) => {
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  console.log("data**-fakeSeller", data);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);


  const [show, setShow] = useState(false);
  const [url, setUrl] = useState();

  const { fakeSeller, totalSellers } = useSelector((state) => state.fakeSeller);

  const { dialogue, dialogueType } = useSelector(
    (state) => state.dialogue
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();



  useEffect(() => {
    dispatch(getFakeSeller(currentPage, size));
  }, [dispatch, currentPage, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(fakeSeller);
  }, [fakeSeller]);

  // // pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event), 10);
    setSize(parseInt(event), 10);
    setCurrentPage(1);
  };

  const handleClick = (row) => {
    dispatch({
      type: OPEN_DIALOGUE,
      payload: { data: row, type: "isLiveSelller" },
    })
  };



  // searching

  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  const handleOfflineClick = (id) => {
    dispatch(setOfflineStatus(id));
  };


  // Edit Fake Seller

  const handleEdit = (id) => {
    navigate("/admin/addFakeSeller", {
      state: id,
    });
  };


  // Delete FakeSeller
  const handleDelete = (id) => {
    const data = warning();
    data
      .then((isDeleted) => {
        if (isDeleted) {
          props.deleteFakeSeller(id);
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
      Cell: ({ index }) =>
        <span className="text-white fw-normal">
          {(currentPage - 1) * rowsPerPage + index + 1}
        </span>,
    },
    {
      Header: "Seller",
      body: "firstName",
      Cell: ({ row }) => (
        <div className="d-flex">
          <div className="position-relative">
            {loading ? (
              <>
                <Skeleton
                  height={60}
                  width={60}
                  className="StripeElement "
                  baseColor={colors?.baseColor}
                  highlightColor={colors?.highlightColor}
                />
              </>
            ) : (
              <>
                <img
                  src={row?.image}
                  style={{
                    borderRadius: "10px",
                    objectFit: "cover",
                    boxSizing: "border-box",
                  }}
                  height={60}
                  width={60}
                  alt=""
                />
              </>
            )}
          </div>
          <span className="boxCenter text-start ms-3">
            <b className="fw-normal text-white">
              {row?.firstName + " " + row?.lastName}
            </b>
          </span>
        </div>
      ),
      sorting: false,
    },

    // {
    //   Header: "Video",
    //   body: "video",
    //   Cell: ({ row }) => (
    //     <div className="position-relative">
    //       <video
    //         src={row?.video}
    //         controls
    //         style={{
    //           borderRadius: "10px",
    //           objectFit: "cover",
    //           boxSizing: "border-box",
    //         }}
    //         height={60}
    //         width={60}
    //         alt=""
    //       />
    //     </div>
    //   ),
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
              setUrl(row?.video);
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
                imageSrc={row?.image}
                width="50px"
                height="50px"
                style={{ filter: "brightness(0.5)" }}
              />
            </div>
          </div>
        </>
      ),
    },

    {
      Header: "Contact",
      body: "email",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-white fw-normal">{row?.email ? row?.email : "xyz@gmail.com"}</p>
          <p className="mb-0 text-white fw-normal">{row?.mobileNumber ? row?.mobileNumber : "-"}</p>
        </div>
      ),
      sorting: false,
    },
    {
      Header: "Business Name",
      body: "businessName",
      Cell: ({ row }) => (
        <span className="mb-0 text-white fw-normal">
          {row?.businessName ? row?.businessName : "-"}
        </span>
      ),
    },
    {
      Header: "Business Tag",
      body: "businessTag",
      Cell: ({ row }) => (
        <span className="mb-0 text-white fw-normal">{row.businessTag ? row.businessTag : "-"}</span>
      ),
    },

    {
      Header: "Created Date",
      body: "createdAt",
      Cell: ({ row }) => (
        <span className="text-white fw-normal">{dayjs(row.createdAt).format("DD MMM YYYY")}</span>
      ),
    },
    {
      Header: "OnLive",
      body: "isLive",
      Cell: ({ row }) => (
        <div className="boxCenter">
          <svg
            onClick={() => handleClick(row)}
            width="26"
            height="29"
            viewBox="0 0 26 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M17 17C17 17.1725 16.9553 17.3421 16.8703 17.4923C16.7853 17.6425 16.6629 17.7681 16.515 17.857L11.515 20.857C11.3633 20.9485 11.1899 20.998 11.0128 21.0002C10.8356 21.0025 10.661 20.9576 10.507 20.87C10.3531 20.7827 10.2251 20.6563 10.136 20.5034C10.0469 20.3506 10 20.1769 10 20V14C10 13.823 10.047 13.6491 10.1362 13.4963C10.2254 13.3434 10.3536 13.2169 10.5076 13.1298C10.6617 13.0426 10.8361 12.9979 11.0131 13.0002C11.1901 13.0025 11.3633 13.0518 11.515 13.143L16.515 16.143C16.6629 16.2318 16.7853 16.3574 16.8703 16.5076C16.9553 16.6578 17 16.8274 17 17ZM26 14V20C26 24.962 21.962 29 17 29H9C4.038 29 0 24.962 0 20V14C0 9.28995 3.701 5.99995 9 5.99995H10.92L8.22 2.62495C8.13302 2.52309 8.06739 2.40478 8.027 2.27707C7.98662 2.14935 7.97231 2.01482 7.98491 1.88146C7.99752 1.74811 8.03679 1.61865 8.1004 1.50076C8.164 1.38287 8.25064 1.27897 8.35517 1.19521C8.4597 1.11145 8.58 1.04954 8.70891 1.01317C8.83783 0.976789 8.97274 0.966684 9.10564 0.98345C9.23853 1.00022 9.36671 1.04351 9.48255 1.11076C9.59839 1.17802 9.69954 1.26786 9.78 1.37495L13 5.39995L16.22 1.37495C16.3005 1.26786 16.4016 1.17802 16.5174 1.11076C16.6333 1.04351 16.7615 1.00022 16.8944 0.98345C17.0273 0.966684 17.1622 0.976789 17.2911 1.01317C17.42 1.04954 17.5403 1.11145 17.6448 1.19521C17.7494 1.27897 17.836 1.38287 17.8996 1.50076C17.9632 1.61865 18.0025 1.74811 18.0151 1.88146C18.0277 2.01482 18.0134 2.14935 17.973 2.27707C17.9326 2.40478 17.867 2.52309 17.78 2.62495L15.08 5.99995H17C22.299 5.99995 26 9.28995 26 14ZM24 14C24 9.85495 20.484 7.99995 17 7.99995H9C5.516 7.99995 2 9.85495 2 14V20C2 23.86 5.14 27 9 27H17C20.86 27 24 23.86 24 20V14Z"
              fill="black"
            />
          </svg>
        </div>
      ),
    },

    // {
    //   Header: "OffLive",
    //   body: "is offline",
    //   Cell: ({ row }) => (
    //     <button
    //       className="btn btn-danger"
    //       style={{
    //         padding: "5px 7px"
    //       }}
    //       onClick={() => handleOfflineClick(row?._id)}
    //       disabled={row?.isLive === false ? true : false}
    //     >
    //       OffLive
    //     </button>
    //   ),
    // },

    // {
    //   Header: "OffLive",
    //   body: "is offline",
    //   Cell: ({ row }) => (
    //     <button
    //       className="btn btn-danger"
    //       style={{
    //         padding: "8px 16px",
    //         borderRadius: "12px",
    //         fontWeight: "600",
    //         fontSize: "14px",
    //         boxShadow: "0 2px 6px rgba(0, 0, 0, 0.15)",
    //         transition: "background-color 0.3s ease, box-shadow 0.3s ease",
    //         opacity: row?.isLive === false ? 0.6 : 1,
    //         cursor: row?.isLive === false ? "not-allowed" : "pointer",
    //         userSelect: "none",
    //       }}
    //       onClick={() => handleOfflineClick(row?._id)}
    //       disabled={row?.isLive === false}
    //       onMouseEnter={e => {
    //         if (!row?.isLive === false) {
    //           e.currentTarget.style.backgroundColor = "#d6334f"; // darker red on hover
    //           e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
    //         }
    //       }}
    //       onMouseLeave={e => {
    //         e.currentTarget.style.backgroundColor = "";
    //         e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.15)";
    //       }}
    //     >
    //       OffLive
    //     </button>
    //   ),
    // },

    {
      Header: "OffLive",
      body: "is offline",
      Cell: ({ row }) => (
        <button
          className="btn btn-danger d-flex align-items-center justify-content-center"
          style={{
            borderRadius: "32px",
            fontWeight: "500",
            fontSize: "15px",
            padding: "8px 22px",
            gap: "8px",
            boxShadow: "0 2px 8px rgba(233, 51, 79, 0.10)",
            opacity: row?.isLive === false ? 0.6 : 1,
            cursor: row?.isLive === false ? "not-allowed" : "pointer",
            outline: "none",
            transition: "background .22s, box-shadow .22s"
          }}
          onClick={() => handleOfflineClick(row?._id)}
          disabled={row?.isLive === false}
          onMouseEnter={e => {
            if (row?.isLive !== false) {
              e.currentTarget.style.background = "#d62f48";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(233, 51, 79, 0.18)";
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = "#FF4C51";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(233, 51, 79, 0.10)";
          }}
        >
          <MdOutlineLiveTv size={20} style={{ marginRight: "6px" }} /> OffLive
        </button>
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
          onClick={() => handleEdit(row)}

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
        // <button
        //   className={`themeBtn text-center `}
        //   style={{
        //     borderRadius: "5px",
        //     margin: "auto",
        //     width: "40px",
        //     backgroundColor: "#FFF",
        //     color: "#cd2c2c",
        //   }}
        //   onClick={() => handleDelete(row?._id)}
        // >
        //   <svg
        //     width="25"
        //     height="25"
        //     viewBox="0 0 20 20"
        //     fill="none"
        //     xmlns="http://www.w3.org/2000/svg"
        //   >
        //     <path
        //       d="M4.04017 6L4.9258 16.6912C4.98927 17.4622 5.646 18.0667 6.41993 18.0667H14.5801C15.354 18.0667 16.0108 17.4622 16.0742 16.6912L16.9598 6H4.04017ZM7.99953 16.0667C7.7378 16.0667 7.5176 15.8631 7.501 15.5979L7.001 7.53123C6.9839 7.25537 7.19337 7.01807 7.46877 7.00097C7.7544 6.98093 7.98147 7.19287 7.99903 7.46873L8.49903 15.5354C8.51673 15.8211 8.2907 16.0667 7.99953 16.0667ZM11 15.5667C11 15.843 10.7764 16.0667 10.5 16.0667C10.2236 16.0667 10 15.843 10 15.5667V7.5C10 7.22363 10.2236 7 10.5 7C10.7764 7 11 7.22363 11 7.5V15.5667ZM13.999 7.53127L13.499 15.5979C13.4826 15.8604 13.2638 16.0791 12.9687 16.0657C12.6933 16.0486 12.4839 15.8113 12.501 15.5354L13.001 7.46877C13.0181 7.1929 13.2598 6.9922 13.5312 7.001C13.8066 7.0181 14.0161 7.2554 13.999 7.53127ZM17 3H14V2.5C14 1.67287 13.3271 1 12.5 1H8.5C7.67287 1 7 1.67287 7 2.5V3H4C3.4477 3 3 3.4477 3 4C3 4.55223 3.4477 5 4 5H17C17.5523 5 18 4.55223 18 4C18 3.4477 17.5523 3 17 3ZM13 3H8V2.5C8 2.22413 8.22413 2 8.5 2H12.5C12.7759 2 13 2.22413 13 2.5V3Z"
        //       fill="#CD2C2C"
        //     />
        //   </svg>
        // </button>


      ),
    },
    // add more columns as needed
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
          <div className="col-12 headname">Fake Seller </div>
          <div className="sellerMain">
            <div className="tableMain mt-2">
              <div className="sellerHeader primeHeader">
                <div className="row">
                  <div className="col-2">
                    <Button
                      newClass={`whiteFont`}
                      // btnColor={`btnnewPrime`}
                      btnIcon={`fa-solid fa-plus`}
                      btnName={`Add`}
                      onClick={() => {

                        navigate("/admin/addFakeSeller");
                      }}
                      style={{ borderRadius: "5px", padding: "8px 32px", background: "#b93160" }}
                    />
                    {dialogue && dialogueType === "isLiveSelller" && (
                      <LiveSellerDialogue />
                    )}

                  </div>
                  <div className="col-10 text-end">
                    <Searching
                      type={`client`}
                      data={fakeSeller}
                      setData={setData}
                      column={data}
                      onFilterData={handleFilterData}
                      serverSearching={handleFilterData}
                      button={true}
                      setSearchValue={setSearch}
                      searchValue={search}
                    />
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
                count={totalSellers}
                type={"server"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={totalSellers}
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
  );
};

export default connect(null, { getFakeSeller, deleteFakeSeller, sellerIsLive })(
  FakeSeller
);
// export default Seller;
