import {  useNavigate } from "react-router-dom";
import Table from "../../extra/Table";
import { connect, useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
  getSellerRequest,
  acceptSellerRequest,
} from "../../store/sellerRequest/sellerRequest.action";
import ToggleSwitch from "../../extra/ToggleSwitch";
import dayjs from "dayjs";
import Pagination from "../../extra/Pagination";
import Searching from "../../extra/Searching";
import { warningAccept } from "../../../util/Alert";
import defaultImage from "../../../assets/images/default.jpg";
import { colors } from "../../../util/SkeletonColor";
import Skeleton from "react-loading-skeleton";

const SellerRequest = (props) => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  console.log("data", data);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [rowsPerPage, setRowsPerPage] = useState(10);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { sellerRequest } = useSelector((state) => state.sellerRequest);
  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state) => state.dialogue
  );

  useEffect(() => {
    dispatch(getSellerRequest());
  }, [dispatch]);
  useEffect(() => {
    setData(sellerRequest);
  }, [sellerRequest]);

  // // pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const handleClick = (id) => {
    const data = warningAccept();
    data
      .then((isDeleted) => {
        if (isDeleted) {
          dispatch(acceptSellerRequest(id));
        }
      })
      .catch((err) => console.log(err));
  };

  // searching
  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };

  const handleEdit = (id) => {

    navigate("/admin/sellerRequestEdit", {
      state: id,
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
}, []);

const mapData = [
  {
    Header: "No",
    width: "20px",
    Cell: ({ index }) => <span className="text-white fw-normal">{page * rowsPerPage + parseInt(index) + 1}</span>,
  },
  // {
  //   Header: "User",
  //   body: "image",
  //   Cell: ({ row }) => (
  //     <div className="d-flex">
  //       <div className="position-relative">
  //         <img src={row.image ? row.image : defaultImage} height={45} width={45} style={{ borderRadius: "90px" }} alt="" onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} />
  //         {row?.isOnline && (
  //           <span
  //             style={{
  //               width: "20px",
  //               height: "20px",
  //               borderRadius: "50%",
  //               backgroundColor: "green",
  //               bottom: "-4px",
  //               right: "8px",
  //               border: "3px solid #ffff",
  //             }}
  //             className="d-block position-absolute"
  //           ></span>
  //         )}
  //       </div>
  //       <span className="ms-3 text-start boxCenter">
  //         <b className="fw-normal text-white">{row?.firstName + " " + row?.lastName}</b>
  //       </span>
  //     </div>
  //   ),
  // },
  {
    Header: "Image",
    body: "image",
    Cell: ({ row }) => (
      <>
        {loading ? (
          <>
            <Skeleton
              height={40}
              width={40}
              style={{ borderRadius: "50px", cursor: "pointer" }}
              className="StripeElement "
              baseColor={colors?.baseColor}
              highlightColor={colors?.highlightColor}
            />
          </>
        ) : (
          <>
            <img
              src={row.image || defaultImage}
              style={{ borderRadius: "50px", cursor: "pointer" }}
              height={45}
              width={45}
              alt="seller request"
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
    Header: "User",
    body: "name",
    Cell: ({ row }) => (
      <div className="">
        <p className="mb-0 text-capitalize text-white fw-normal">{row?.firstName + " " + row?.lastName}</p>
      </div>
    ),
  },

  {
    Header: "Business Name",
    body: "businessName",
    Cell: ({ row }) => (
      <span className="mb-0 text-white">
        {row?.businessName ? row?.businessName : "-"}
      </span>
    ),
  },
  {
    Header: "Logo",
    body: "logo",
    Cell: ({ row }) => (
      <>
        {loading ? (
          <Skeleton height={40} width={60} style={{ borderRadius: "6px" }} className="StripeElement " baseColor={colors?.baseColor} highlightColor={colors?.highlightColor} />
        ) : (
          <>
            {row?.logo ? (
              <a href={row.logo} target="_blank" rel="noreferrer">
                <img src={row.logo} height={45} width={60} style={{ objectFit: "cover", borderRadius: "6px" }} alt="logo" onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} />
              </a>
            ) : (
              <img src={defaultImage} height={45} width={60} style={{ objectFit: "cover", borderRadius: "6px" }} alt="no logo" />
            )}
          </>
        )}
      </>
    ),
  },
  {
    Header: "Gov ID",
    body: "govId",
    Cell: ({ row }) => (
      <>
        {loading ? (
          <Skeleton height={40} width={60} style={{ borderRadius: "6px" }} className="StripeElement " baseColor={colors?.baseColor} highlightColor={colors?.highlightColor} />
        ) : (
          <>
            {row?.govId ? (
              <a href={row.govId} target="_blank" rel="noreferrer">
                <img src={row.govId} height={45} width={60} style={{ objectFit: "cover", borderRadius: "6px" }} alt="govId" onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} />
              </a>
            ) : (
              <span className="text-white">-</span>
            )}
          </>
        )}
      </>
    ),
  },
  {
    Header: "Registration Cert",
    body: "registrationCert",
    Cell: ({ row }) => (
      <>
        {loading ? (
          <Skeleton height={40} width={60} style={{ borderRadius: "6px" }} className="StripeElement " baseColor={colors?.baseColor} highlightColor={colors?.highlightColor} />
        ) : (
          <>
            {row?.registrationCert ? (
              <a href={row.registrationCert} target="_blank" rel="noreferrer">
                <img src={row.registrationCert} height={45} width={60} style={{ objectFit: "cover", borderRadius: "6px" }} alt="registrationCert" onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} />
              </a>
            ) : (
              <span className="text-white">-</span>
            )}
          </>
        )}
      </>
    ),
  },
  {
    Header: "Address Proof",
    body: "addressProof",
    Cell: ({ row }) => (
      <>
        {loading ? (
          <Skeleton height={40} width={60} style={{ borderRadius: "6px" }} className="StripeElement " baseColor={colors?.baseColor} highlightColor={colors?.highlightColor} />
        ) : (
          <>
            {row?.addressProof ? (
              <a href={row.addressProof} target="_blank" rel="noreferrer">
                <img src={row.addressProof} height={45} width={60} style={{ objectFit: "cover", borderRadius: "6px" }} alt="addressProof" onError={(e) => { e.target.onerror = null; e.target.src = defaultImage; }} />
              </a>
            ) : (
              <span className="text-white">-</span>
            )}
          </>
        )}
      </>
    ),
  },
  {
    Header: "Gender",
    body: "gender",
    Cell: ({ row }) => (
      <span className="mb-0 text-white">{row?.gender ? row?.gender : "-"}</span>
    ),
  },
  {
    Header: "Country",
    body: "country",
    Cell: ({ row }) => <span className="text-white">{row?.address?.country}</span>,
  },

  {
    Header: "Accept",
    body: "isAccepted",
    Cell: ({ row }) => (
      <div className="">
        <ToggleSwitch
          value={row?.isAccepted}
          onClick={() => handleClick(row._id)}
        />
      </div>
    ),
  },
  {
    Header: "Created Date",
    body: "createdAt",
    Cell: ({ row }) => (
      <span className="text-white">{dayjs(row.createdAt).format("DD MMM YYYY")}</span>
    ),
  },
  // {
  //   Header: "Edit",
  //   body: "",
  //   Cell: ({ row }) => (
  //     <>
  //       <Button
  //         newClass={`themeFont boxCenter userBtn fs-5`}

  //         btnIcon={`far fa-edit`}
  //         style={{
  //           borderRadius: "5px",
  //           margin: "auto",
  //           width: "40px",
  //           backgroundColor: "#fff",
  //           color: "#160d98",
  //         }}
  //         onClick={() => handleEdit(row)}
  //       />

  //     </>
  //   ),
  // },

  // add more columns as needed
];
return (
  <>
    <div className="mainSellerTable">
      <div className="sellerTable">

        <div className="col-12 headname">Pending Seller </div>
        <div className="sellerMain">
          <div className="tableMain mt-2">
            <div className="sellerHeader primeHeader">
              <div className="row">
                <div className="col-2"></div>

                <div className="col-10">
                  <Searching
                    type={"client"}
                    data={sellerRequest}
                    setData={setData}
                    onFilterData={handleFilterData}
                    serverSearching={handleFilterData}
                  />
                </div>
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
              count={sellerRequest?.length}
              serverPage={page}
              type={"client"}
              onPageChange={handleChangePage}
              serverPerPage={rowsPerPage}
              totalData={sellerRequest?.length}
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

export default connect(null, { getSellerRequest, acceptSellerRequest })(
  SellerRequest
);
// export default Seller;
