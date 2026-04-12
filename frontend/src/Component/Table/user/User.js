import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Table from "../../extra/Table";
import Iconb from "../../extra/Iconb";
import { connect, useDispatch, useSelector } from "react-redux";
import { getUser, userIsBlock } from "../../store/user/user.action";
import ToggleSwitch from "../../extra/ToggleSwitch";
import dayjs from "dayjs";
import Pagination from "../../extra/Pagination";
import Searching from "../../extra/Searching";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import "react-loading-skeleton/dist/skeleton.css";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';


const User = (props) => {
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { user, totalUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getUser(currentPage, size))
  }, [dispatch, currentPage, size]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(user);
  }, [user]);

  // pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event), 10);
    setSize(parseInt(event), 10);
    setCurrentPage(1);
  };

  const handleOpen = (id) => {
    navigate("/admin/UserProfile", {
      state: id,
    });
  };

  const handleClick = (userDetails) => {
    props.userIsBlock(
      userDetails,
      userDetails?.isBlock === true ? false : true
    );
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
      Cell: ({ index }) => (
        <span className="text-white">
          {(currentPage - 1) * rowsPerPage + index + 1}
        </span>
      ),
    },
    {
      Header: "User",
      body: "firstName",
      Cell: ({ row }) => (
        <div
          className="d-flex"
          onClick={() => handleOpen(row._id)}
          style={{ cursor: "pointer" }}
        >
          <div className="position-relative">
            {loading ? (
              <>
                <Skeleton
                  height={42}
                  width={42}
                  style={{ borderRadius: "90px" }}
                  className="StripeElement "
                  baseColor={colors?.baseColor}
                  highlightColor={colors?.highlightColor}

                />
              </>
            ) : (
              <>
                <img
                  src={row?.image}
                  height={45}
                  width={45}
                  alt=""
                  style={{ borderRadius: "90px" }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/dummy.png";
                  }}
                />

              </>
            )}
          </div>
          <span className="fw-normal ms-3 boxCenter text-start ">
            <b className="fw-normal text-capitalize text-white">
              {row.firstName + " " + row.lastName}
            </b>
          </span>
        </div>
      ),
      sorting: false,    //you can on if sorting need
    },

    {
      Header: "Contact",
      body: "email",
      sorting: false,
      Cell: ({ row }) => (
        <div className="">
          <span className="text-white fw-normal">{row.email ? row.email : "Era@gmail.com"}</span>
          <p className="mb-0 text-white fw-normal">{row.mobileNumber ? row.mobileNumber : "-"}</p>
        </div>
      ),
    },

    {
      Header: "Unique Id", body: "uniqueId", sorting: false,

      Cell: ({ row }) => (
        <p className="mb-0 text-white">
          {row.uniqueId ? row.uniqueId : "-"}
        </p>
      ),
    },
    {
      Header: "Country",
      body: "location",
      Cell: ({ row }) => (
        <p className="mb-0 text-uppercase text-white">
          {row.location ? row.location : "-"}
        </p>
      ),
    },
    {
      Header: "Total Order",
      body: "orderCount",
      Cell: ({ row }) => (
        <span
          className="mb-0 text-dark"
          style={{
            backgroundColor: "#c6e7ff",
            color: "#008df2",
            padding: "10px 15px",
            borderRadius: "5px",
          }}
        >
          {row.orderCount ? row.orderCount : 0}
        </span>
      ),
    },
    {
      Header: "Register Date",
      body: "createdAt",
      Cell: ({ row }) => (
        <span className="text-white">{dayjs(row.date).format("DD MMM YYYY")}</span>
      ),
    },
    {
      Header: "Block",
      body: "isBlock",
      Cell: ({ row }) => (
        <div className="">

          <ToggleSwitch value={row.isBlock} onClick={() => handleClick(row)} disabled={row?.email === "erashoptest@gmail.com" && true} />
        </div>
      ),
    },

    {
      Header: "Info",
      body: "",
      Cell: ({ row }) => (
        <Iconb
          type="button"
          newClass={` boxCenter   infobtn userBtn  `}
          btnIcon={<InfoOutlinedIcon sx={{ color: '#737272' }} />}
          style={{
            borderRadius: "80px",
            margin: "auto",
            height: "38px",
            width: "38px",
            color: "#160d98",



          }}
          isImage={true}
          isDeleted={true}
          onClick={() => handleOpen(row._id)}
        />


      ),
    },

    // add more columns as needed
  ];
  return (
    <>
      <div className="mainUserTable">
        <div className="userTable">
          <div className="col-12 headname">User Management </div>

          <div className="userMain">
            <div className="tableMain mt-2">
              <div className="userHeader primeHeader">
                <div className="row">
                  <div className="col-2"></div>
                  <div className="col-10">
                    <Searching
                      type={`client`}
                      data={user}
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
                count={user?.length}
                type={"server"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={totalUser}
                serverPage={currentPage}
                setCurrentPage={setCurrentPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </div>
          </div>
          <div className="userFooter primeFooter"></div>
        </div>
      </div>
    </>
  );
};

export default connect(null, { getUser, userIsBlock })(User);
