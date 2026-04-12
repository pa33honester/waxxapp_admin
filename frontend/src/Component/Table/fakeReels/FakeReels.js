import React from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import { useState } from "react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  getFakeReel,
  deleteFakeReel,
} from "../../store/fakeReels/fakeReels.action";
import { useEffect } from "react";
import Searching from "../../extra/Searching";
import Button from "../../extra/Button";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import "react-loading-skeleton/dist/skeleton.css";
import dayjs from "dayjs";
import { OPEN_DIALOGUE } from "../../store/dialogue/dialogue.type";
import FakeReelDialogue from "./FakeReelDialogue";
import {  warning } from "../../../util/Alert";
import EditInfo from "../../../assets/images/Edit.png";
import Delete from "../../../assets/images/Delete.svg"
import Info from "../../../assets/images/Info.svg"

import Iconb from "../../extra/Iconb";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import LazyImage from "../../../common/ImageFallback";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import ShowVideo from "../../extra/ShowVideo";
import defaultImage from "../../../assets/images/default.jpg"


const FakeReels = (props) => {

  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state) => state.dialogue
  );

  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [show, setShow] = useState(false);
  const [url, setUrl] = useState();

  const { fakeReels, totalReels } = useSelector((state) => state.fakeReels);


  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getFakeReel(currentPage, rowsPerPage));
  }, [dispatch, currentPage, rowsPerPage]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(fakeReels);
  });

  // pagination
  const handleChangePage = (event, newPage) => {
    console.log("page changed via handleChangePage", newPage);
    setCurrentPage(newPage);
  };


  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event), 10);
    setSize(parseInt(event), 10);
    setCurrentPage(1);
    console.log("page changed via handleChangeRowsPerPage", event);
  };
  // searching

  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  // reels Info

  const handleOpen = (id) => {
    navigate("/admin/fake/reels/details", { state: id });
  };

  // Delete fake reels
  const handleDelete = (id) => {
    const data = warning();
    data
      .then((isDeleted) => {
        if (isDeleted) {
          props.deleteFakeReel(id);
        }
      })
      .catch((err) => console.log(err));
  };

  const handleClose = () => {
    setShow(false);
    setUrl("");
  };

  const mapData = useMemo(() => [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => (
        <span className="text-white fw-normal">
          {/* {console.log(currentPage)} */}
          {(currentPage - 1) * rowsPerPage + index + 1}
        </span>
      ),
    },


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
                imageSrc={row?.thumbnail}
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
      Header: "Seller",
      body: "firstName",
      Cell: ({ row }) => (
        <span className="boxCenter">
          <b className="fw-normal text-white">
            {row?.sellerId?.firstName + " " + row?.sellerId?.lastName}
          </b>
        </span>
      ),
    },

    {
      Header: "Business Name",
      body: "businessName",
      Cell: ({ row }) => (
        <span className="boxCenter text-white">

          {row?.sellerId?.businessName}

        </span>
      ),
    },
    {
      Header: "Business Tag",
      body: "businessTag",
      Cell: ({ row }) => (
        <span className="boxCenter text-white">

          {row?.sellerId?.businessTag}

        </span>
      ),
    },

    {
      Header: "Like",
      body: "like",
      Cell: ({ row }) => (
        <span className="mb-0 text-white fw-normal">{row?.like ? row?.like : "0"}</span>
      ),
    },
    // {
    //   Header: "Comment",
    //   body: "comment",
    //   Cell: ({ row }) => (
    //     <span className="mb-0 text-white fw-normal">{row?.comment ? row?.comment : "0"}</span>
    //   ),
    // },
    {
      Header: "Created Date",
      body: "createdAt",
      Cell: ({ row }) => (
        <span className="text-white">{dayjs(row?.createdAt).format("DD MMM YYYY")}</span>
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
              payload: { data: row, type: "Fake Reel" },
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
    {
      Header: "Info",
      body: "",
      Cell: ({ row }) => (
        <Iconb
          newClass={`themeFont boxCenter infobtn userBtn fs-5`}
          btnIcon={<InfoOutlined sx={{ color: '#737272' }} />}
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
          onClick={() => handleOpen(row?._id)}
        />
      ),
    },

    // add more columns as needed
  ], [fakeReels]);

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
          <div className="col-12 headname">Fake Reels </div>
          <div className="sellerMain">
            <div className="tableMain mt-2">
              <div className="sellerHeader primeHeader">
                <div className="row">
                  <div className="col-2">
                    <Button
                      newClass={`whiteFont`}
                      btnColor={`btnBlackPrime`}
                      btnIcon={`fa-solid fa-plus`}
                      btnName={`Add`}
                      onClick={() => {
                        dispatch({
                          type: OPEN_DIALOGUE,
                          payload: { type: "Fake Reel" },
                        });
                      }}
                      style={{ borderRadius: "5px", padding: "8px 32px", background: "#b93160" }}
                    />
                    {dialogue && dialogueType === "Fake Reel" && (
                      <FakeReelDialogue />
                    )}
                  </div>
                  <div className="col-10 text-end">
                    <Searching
                      type={`client`}
                      data={fakeReels}
                      setData={setData}
                      column={data}
                      onFilterData={handleFilterData}
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
                serverPage={currentPage}
                type={"server"}
                loading={loading}
              />
              <Pagination
                component="div"
                count={totalReels}
                type={"server"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={totalReels}
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

export default connect(null, { getFakeReel, deleteFakeReel })(FakeReels);
