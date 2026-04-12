import { Link, Navigate, useNavigate } from "react-router-dom";
import Table from "../../extra/Table";
import Button from "../../extra/Button";
import Title from "../../extra/Title";
import { connect, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { getSeller, sellerIsBlock } from "../../store/seller/seller.action";
import ToggleSwitch from "../../extra/ToggleSwitch";
import dayjs from "dayjs";
import Pagination from "../../extra/Pagination";
import Searching from "../../extra/Searching";
import { OPEN_DIALOGUE } from "../../store/dialogue/dialogue.type";
import SellerNotification from "./SellerNotification";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import "react-loading-skeleton/dist/skeleton.css";
import EditInfo from "../../../assets/images/Edit.png";
import Info from "../../../assets/images/Info.svg"
import Iconb from "../../extra/Iconb";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded';
import defaultImage from "../../../assets/images/default.jpg";

import InfoOutlined from '@mui/icons-material/InfoOutlined';


const Seller = (props) => {
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const { seller, totalSeller } = useSelector((state) => state.seller);
  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state) => state.dialogue
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();



  useEffect(() => {
    dispatch(getSeller(currentPage, size));
  }, [dispatch, currentPage, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(seller);
  }, [seller]);

  // // pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event), 10);
    setSize(parseInt(event), 10);
    setCurrentPage(1);
  };

  const handleClick = (sellerDetails) => {
    props.sellerIsBlock(
      sellerDetails,
      sellerDetails.isBlock === true ? false : true
    );
  };
  const handleOpen = (id) => {
    // window.location.href = "/admin/userProfile"
    navigate("/admin/sellerProfile", {
      state: id,
    });
  };

  const handleEdit = (id) => {
    navigate("/admin/addSeller", {
      state: id,
    });
  };

  // searching

  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
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
                  height={42}
                  width={42}
                  className="StripeElement"
                  baseColor={colors?.baseColor}
                  highlightColor={colors?.highlightColor}
                />
              </>
            ) : (
              <>
                <img
                  src={row?.image ? row?.image : defaultImage}
                  style={{
                    borderRadius: "90px",
                    objectFit: "cover",
                    boxSizing: "border-box",
                  }}
                  height={45}
                  width={45}
                  alt=""
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage;
                  }}
                />
              </>
            )}
          </div>
          <span className="boxCenter text-start ms-3 fw-normal text-white">
            {row?.firstName + " " + row?.lastName}
          </span>
        </div>
      ),
      sorting: false,
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
      Header: "Total Product",
      body: "totalProduct",
      Cell: ({ row }) => (
        <span
          className="mb-0 text-dark"
          style={{
            backgroundColor: "#c6e7ff",
            color: "#000",
            padding: "10px 15px",
            borderRadius: "5px",
          }}
        >
          {row.totalProduct ? row.totalProduct : 0}
        </span>
      ),
    },
    {
      Header: "Total Order",
      body: "totalOrder",
      Cell: ({ row }) => (
        <span
          className="mb-0 text-dark"
          style={{
            backgroundColor: "#c6e7ff",
            color: "#000",
            padding: "10px 15px",
            borderRadius: "5px",
          }}
        >
          {row?.totalOrder ? row?.totalOrder : 0}
        </span>
      ),
    },

    {
      Header: "Block",
      body: "isBlock",
      Cell: ({ row }) => (
        <div
          className={``}
        >
          <ToggleSwitch value={row?.isBlock} onClick={() => handleClick(row)} disabled={row?.email === "erashoptest@gmail.com" && true} />
        </div>
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
      Header: "Notification",
      body: "",
      Cell: ({ row }) => (
        <Iconb
          newClass={`themeFont boxCenter infobtn userBtn fs-5`}
          btnIcon={<NotificationsNoneRoundedIcon sx={{ color: '#737272' }} />}
          style={{
            borderRadius: "50px",
            margin: "auto",
            height: "45px",
            width: "45px",
            color: "#160d98",

            padding: "0px"
          }}
          onClick={() => {
            dispatch({
              type: OPEN_DIALOGUE,
              payload: { data: row, type: "SellerNotification" },
            });
          }}
        />
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
  ];
  return (
    <>
      <div className="mainSellerTable">
        <div className="sellerTable">

          <div className="col-12 headname">Seller </div>

          <div className="sellerMain">
            <div className="tableMain mt-2">
              <div className="sellerHeader primeHeader">
                <div className="row">
                  <div className="col-2">


                    {dialogue && dialogueType === "SellerNotification" && (
                      <SellerNotification />
                    )}
                  </div>
                  <div className="col-10 text-end">
                    <Searching
                      type={`client`}
                      data={seller}
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
                count={totalSeller}
                type={"server"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={totalSeller}
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

export default connect(null, { getSeller, sellerIsBlock })(Seller);
// export default Seller;
