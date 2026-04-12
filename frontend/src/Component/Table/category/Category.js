import React from "react";
import Button from "../../extra/Button";
import { useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import Table from "../../extra/Table";
import {
  getCategory,
  deleteCategory,
} from "../../store/category/category.action";
import { OPEN_DIALOGUE } from "../../store/dialogue/dialogue.type";
import CategoryDialog from "./CategoryDialog";
import { warning } from "../../../util/Alert";
import { useNavigate } from "react-router-dom";
import Pagination from "../../extra/Pagination";

import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { colors } from "../../../util/SkeletonColor";
import { useState } from "react";
import EditInfo from "../../../assets/images/Edit.png";
import Delete from "../../../assets/images/Delete.svg"
import Info from "../../../assets/images/Info.svg"
import Iconb from "../../extra/Iconb";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import defaultImage from "../../../assets/images/default.jpg";



const Category = (props) => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const { category } = useSelector((state) => state.category);
  const { dialogue, dialogueType } = useSelector(
    (state) => state.dialogue
  );

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getCategory());
  }, [dispatch]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(category);
  }, [category]);

  // // pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  // Delete Category
  const handleDelete = (id) => {
    const data = warning();
    data
      .then((isDeleted) => {
        if (isDeleted) {
          dispatch(deleteCategory(id));
        }
      })
      .catch((err) => console.log(err));
  };
  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span className="text-white fw-normal">{page * rowsPerPage + index + 1}</span>,
    },
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
                src={row.image}
                style={{ borderRadius: "50px", cursor: "pointer" }}
                height={45}
                width={45}
                alt="category"
                onClick={() =>
                  navigate("/admin/category/subCategory", {
                    state: { id: row?._id },
                  })
                }
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
      Header: "Category",
      body: "name",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-capitalize text-white fw-normal">{row.name}</p>
        </div>
      ),
    },
    {
      Header: "Product",
      body: "name",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-white">
            {row.categoryProduct ? row.categoryProduct : 0}
          </p>

        </div>
      ),
    },

    {
      Header: "Sub Category",
      body: "name",
      Cell: ({ row }) => (
        <div>
          <p className="mb-0 text-white fw-normal">
            {row?.totalSubcategory ? row?.totalSubcategory : 0}
          </p>
        </div>
      ),
    },


    {
      Header: "Add SubCategory",
      body: "name",
      Cell: ({ row }) => (
        <div
          className=""
          style={{ cursor: "pointer" }}
          onClick={() =>
            navigate("/admin/category/subCategory", {
              state: {
                id: row?._id,
              },
            })
          }
        >
          {/* <p className="mb-0 text-white fw-normal">
            {row?.totalSubcategory ? row?.totalSubcategory : 0}
          </p> */}
          <svg width="24" height="24" fill="none" stroke="#5a5a5aff" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
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
              payload: { data: row, type: "Category" },
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
          onClick={() =>
            navigate("/admin/category/subCategory", {
              state: {
                id: row?._id,
              },
            })
          }

        />
      ),
    },
  ];



  return (
    <>
      <div className="mainSellerTable">
        <div className="sellerTable">
          <div className="col-12 headname">Category </div>
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
                          payload: { type: "Category" },
                        });
                      }}
                      style={{ borderRadius: "5px", padding: "8px 32px", background: "#b93160" }}
                    />
                    {dialogue && dialogueType === "Category" && <CategoryDialog />}
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
              <Pagination       //pagination if need
                component="div"
                count={category?.length}
                serverPage={page}
                type={"client"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={category?.length}
                onRowsPerPageChange={handleChangeRowsPerPage}
                style={{display : "flex", justifyContent : "start"}}
              />
            </div>
          </div>
          <div className="sellerFooter primeFooter"></div>
        </div>
      </div>
    </>
  );
};

export default connect(null, {
  getCategory,
  deleteCategory,
})(Category);
