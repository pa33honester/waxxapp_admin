// import React, { useEffect, useState } from "react";
// import { connect, useDispatch, useSelector } from "react-redux";
// import { useLocation, useNavigate } from "react-router-dom";
// import { reelInfo, reelLike } from "../../store/reels/reels.action";
// import dayjs from "dayjs";
// import Skeleton from "react-loading-skeleton";
// import "react-loading-skeleton/dist/skeleton.css";
// import { getDefaultCurrency } from "../../store/currency/currency.action";
// import Tick from "../../../assets/images/verified.png";

// const ReelsInfo = (props) => {
//   const { state } = useLocation();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const { reelInfo, reelLike } = useSelector((state) => state.reels);
//   const { defaultCurrency } = useSelector((state) => state.currency);

//   const [type, setType] = useState("Like");
//   const [reelData, setReelData] = useState([]);
//   const [likesToShow, setLikesToShow] = useState(5);  // Initial number of likes
//   const [loading, setLoading] = useState(false);
//   const [isExpanded, setIsExpanded] = useState(false);  // State to handle whether the likes are expanded or not

//   const now = dayjs();

//   // Function to load all likes
//   const loadAllLikes = () => {
//     setLoading(true);
//     setTimeout(() => {
//       setLikesToShow(reelData.length);  // Show all likes by setting likesToShow to the total number of likes
//       setLoading(false);
//       setIsExpanded(true);  // Mark the list as expanded
//     }, 1000); // Simulate network delay
//   };

//   // Function to load less likes
//   const loadLessLikes = () => {
//     setLikesToShow(5);  // Show only 5 likes initially
//     setIsExpanded(false);  // Mark the list as collapsed
//   };

//   useEffect(() => {
//     props.reelInfo(state);
//     props.reelLike(state);
//     dispatch(getDefaultCurrency());
//   }, [state]);

//   useEffect(() => {
//     setReelData(reelLike);
//   }, [reelLike]);

//   const formatTime = (date) => {
//     if (!date) return "-";
//     const diffMin = now.diff(date, "minute");
//     const diffHr = now.diff(date, "hour");
//     return diffMin <= 60 ? `${diffMin} minutes ago`
//       : diffHr < 24 ? `${diffHr} hours ago`
//         : dayjs(date).format("DD MMM, YYYY");
//   };

//   return (
//     <div className=" my-4" style={{ margin: "0px 30px" }}>

//       <div className="d-flex justify-content-between">
//         <div className=" headname " style={{ marginLeft: "0px" }}>Reel Info</div>
//         <div> <button
//           onClick={() => navigate(-1)}
//           className="btn  rounded-pill px-4 mb-4"
//           style={{ border: "1px solid #b93160", backgroundColor: "#b93160", color: "#fff" }}
//         >
//           ← Back
//         </button></div>
//       </div>

//       <div className="card p-4 shadow-md overflow-auto">
//         <div className="row">
//           <div className="col-lg-4">
//             <div className="d-flex align-items-center gap-3 mb-3">
//               <img
//                 src={reelInfo?.sellerId?.image || ''}
//                 onClick={() => navigate("/admin/sellerProfile", { state: reelInfo?.productId?.seller })}
//                 className="rounded-circle border border-danger"
//                 height={50}
//                 width={50}
//                 style={{ objectFit: "cover", cursor: "pointer" }}
//                 alt="Seller"
//               />
//               <div>
//                 <h5 className="mb-1">
//                   {reelInfo?.sellerId?.businessName}
//                   <img src={Tick} alt="Verified" className="ms-2" width={18} />
//                 </h5>
//                 <small className="text-muted">{formatTime(reelInfo?.createdAt)}</small>
//               </div>
//             </div>
//             <video
//               src={reelInfo?.video}
//               controls
//               className="video-player"
//             />
//           </div>

//           <div className="col-lg-8">
//             <div className="d-flex justify-content-between">
//               <div>
//                 <h4 className="fw-bold mb-3" style={{ color: "#B93160" }}>Product Information</h4>
//                 <div className="d-flex align-items-start gap-4">
//                   <img
//                     src={reelInfo?.productId?.mainImage || ''}
//                     onClick={() => navigate("/admin/productDetail", { state: reelInfo?.productId?._id })}
//                     className="rounded shadow"
//                     height={200}
//                     width={200}
//                     style={{ objectFit: "cover", cursor: "pointer" }}
//                     alt="Product"
//                   />
//                   <ul className="list-unstyled">
//                     <li className=""><strong>Name :</strong> {reelInfo?.productId?.productName}</li>
//                     <li className="mt-3"><strong>Price :</strong> {reelInfo?.productId?.price || "-"} ({defaultCurrency?.symbol})</li>
//                     <li className="mt-3"><strong>Shipping :</strong> {reelInfo?.productId?.shippingCharges} ({defaultCurrency?.symbol})</li>
//                     <li className="mt-3"><strong>Code :</strong> {reelInfo?.productId?.productCode}</li>
//                     <li className="mt-3"><strong>Likes : </strong>{reelInfo?.like || 0}</li>
//                     <li className="mt-3"><strong>Description : </strong>{reelInfo?.description}</li>
//                   </ul>
//                 </div>
//               </div>

//               {/* <div className="">
//                 <h4 className="fw-bold mb-3" style={{ color: "#B93160" }}>Thumbnail</h4>
//                 <img
//                   src={reelInfo?.thumbnail || ''}
//                   className="rounded shadow"
//                   height={200}
//                   width={200}
//                   style={{ objectFit: "cover" }}
//                   alt="Thumbnail"
//                 />
//               </div> */}
//             </div>

//             {/* <div style={{ marginTop: "100px" }}>
//               <button
//                 className={`btn ${type === "Like" ? "btn" : "btn-outline-secondary"}  me-2`}
//                 onClick={() => setType("Like")}
//                 style={{ backgroundColor: type === "Like" ? "#B93160" : "#fff", color: type === "Like" ? "#fff" : "#000" }}
//               >
//                 Likes ( {reelInfo?.like || 0} )
//               </button>
//             </div> */}

//             {type === "Like" && (
//               <div className="mt-3">
//                 {reelData?.length > 0 ? reelData.slice(0, likesToShow).map((data, i) => (
//                   <div key={i} className="d-flex align-items-center justify-content-between py-2 border-bottom">
//                     <div className="d-flex align-items-center gap-3">
//                       <img
//                         src={data?.userId?.image || ''}
//                         onClick={() => navigate("/admin/UserProfile", { state: data?.userId?._id })}
//                         className="rounded-circle border border-danger"
//                         height={50}
//                         width={50}
//                         style={{ objectFit: "cover", cursor: "pointer" }}
//                         alt="User"
//                       />
//                       <div>
//                         <div className="fw-bold">{data?.userId?.firstName + ' ' + data?.userId?.lastName}</div>
//                         <small className="text-muted">{formatTime(data?.createdAt)}</small>
//                       </div>
//                     </div>
//                     <div className="text-danger">
//                       <i className="fa-solid fa-heart"></i>
//                     </div>
//                   </div>
//                 )) : (
//                   <p className="text-center mt-4">No likes yet.</p>
//                 )}

//                 {/* Show Load More or Load Less Button */}
//                 <div className="text-center mt-3">
//                   {/* Show Load More Button only if not all likes are loaded */}
//                   {likesToShow < reelData?.length && !loading && (
//                     <button onClick={loadAllLikes} className="myCustomButton" style={{ borderRadius: "5px", width: "100px", height: "40px" }}>
//                       Load More
//                     </button>
//                   )}

//                   {/* Show Load Less Button */}
//                   {likesToShow > 5 && isExpanded && (
//                     <button onClick={loadLessLikes} className="myCustomButton" style={{ borderRadius: "5px", width: "100px", height: "40px" }}>
//                       Load Less
//                     </button>
//                   )}

//                   {/* Loading Indicator */}
//                   {loading && (
//                     <div className="text-center mt-3">
//                       <p>Loading...</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>


//         <div>

//         </div>

//       </div>
//     </div>
//   );
// };

// export default connect(null, { reelInfo, reelLike })(ReelsInfo);




import React, { useEffect, useState } from 'react'
import Table from '../../extra/Table';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { reelInfo } from '../../store/reels/reels.action';
import ShowVideo from '../../extra/ShowVideo';
import LazyImage from '../../../common/ImageFallback';
import { IconPlayerPlayFilled } from '@tabler/icons-react';
import { colors } from '../../../util/SkeletonColor';
import Skeleton from 'react-loading-skeleton';
import { InfoOutlined } from '@mui/icons-material';
import Iconb from '../../extra/Iconb';
import { OPEN_DIALOGUE } from '../../store/dialogue/dialogue.type';
import ReelInfoDialogue from './ReelInfoDialogue';
import { getSetting } from '../../store/setting/setting.action';
import { CLEAR_REELS } from '../../store/reels/reels.type';
import defaultImage from "../../../assets/images/default.jpg";

const ReelsInfo = () => {
  const { state } = useLocation();

  const dispatch = useDispatch();
  const { reelInfoDetails } = useSelector((state) => state.reels);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
  const { setting } = useSelector((state) => state.setting);
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);
  const [url, setUrl] = useState();

  useEffect(() => {
    dispatch(getSetting());
  }, [dispatch]);

  useEffect(() => {
    dispatch(reelInfo(state));
  }, [dispatch, state]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(reelInfoDetails?.productId);
  }, [reelInfoDetails])


  const handleClose = () => {
    setShow(false);
    setUrl("");
  };

  useEffect(() => {
    return () => {
      dispatch({ type: CLEAR_REELS, payload: null });
    }
  }, [])

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => (
        <span className="text-white fw-normal">
          {index + 1}
        </span>
      ),
    },

    // {
    //   Header: "Product",
    //   body: "product",
    //   Cell: ({ row }) => (
    //     <div
    //       className="d-flex align-items-center justify-content-center"
    //       // onClick={() => handleOpen(row._id)}
    //       style={{ cursor: "pointer" }}
    //     >
    //       <div className="position-relative">
    //         {loading ? (
    //           <>
    //             <Skeleton
    //               height={42}
    //               width={42}
    //               style={{ borderRadius: "90px" }}
    //               className="StripeElement "
    //               baseColor={colors?.baseColor}
    //               highlightColor={colors?.highlightColor}
    //             />
    //           </>
    //         ) : (
    //           <>
    //             <img
    //               src={row?.mainImage}
    //               height={45}
    //               width={45}
    //               alt=""
    //               style={{ borderRadius: "90px" }}
    //               onError={(e) => {
    //                 e.target.onerror = null;
    //                 e.target.src = defaultImage;
    //               }}
    //             />
    //           </>
    //         )}
    //       </div>
    //       <span className="fw-normal ms-3 boxCenter text-start ">
    //         <b className="fw-normal text-capitalize text-white">
    //           {row?.productName}
    //         </b>
    //       </span>
    //     </div>
    //   ),
    //   sorting: false,
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
                src={row?.mainImage}
                style={{ borderRadius: "50px", cursor: "pointer" }}
                height={45}
                width={45}
                alt="category"
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
      Header: "Product",
      body: "product",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-capitalize text-white fw-normal">{row?.productName}</p>
        </div>
      ),
    },


    {
      Header: "product Code",
      body: "productCode",
      Cell: ({ row }) => (
        <span className="boxCenter text-white">
          {row?.productCode}
        </span>
      ),
    },
    {
      Header: "Price",
      body: "price",
      Cell: ({ row }) => (
        <span className="boxCenter text-white">
          {row?.price}({setting?.currency?.symbol})
        </span>
      ),
    },
    {
      Header: "Shipping Charges",
      body: "shippingCharges",
      Cell: ({ row }) => (
        <span className="boxCenter text-white">
          {row?.shippingCharges}({setting?.currency?.symbol})
        </span>
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
          onClick={() => {
            dispatch({
              type: OPEN_DIALOGUE,
              payload: { data: row, type: "reelInfo" },
            });
          }}
        />
      ),
    },

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
          <div className="col-12 headname">Reels</div>
          <div className="sellerMain">
            <div className="tableMain mt-2">
              {dialogue && dialogueType === "reelInfo" && (
                <ReelInfoDialogue id={state} />
              )}
              <Table
                data={data}
                mapData={mapData}
                // serverPerPage={rowsPerPage}
                // serverPage={page}
                type={"server"}
                loading={loading}
              />
            </div>
          </div>
          <div className="sellerFooter primeFooter"></div>
        </div>
      </div>
    </>

  )
}

export default ReelsInfo




