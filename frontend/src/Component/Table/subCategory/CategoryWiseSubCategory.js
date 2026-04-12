import React from "react";
import Button from "../../extra/Button";
import { useEffect } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  getCategoryWiseSubCategory,
  deleteSubCategory,
} from "../../store/subCategory/subCategory.action";

import { OPEN_DIALOGUE } from "../../store/dialogue/dialogue.type";
import SubCategoryDialoge from "./SubCategoryDialoge";
import {  warning } from "../../../util/Alert";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import EditInfo from "../../../assets/images/Edit.png";
import Delete from "../../../assets/images/Delete.svg"

import Iconb from "../../extra/Iconb";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import { getAllSubcategory } from "../../store/attribute/attribute.action";
import { CLEAN_DATA } from "../../store/attribute/attribute.type";
import { CLEAR_SUB_CATEGORY } from "../../store/subCategory/subCategory.type";
import { baseURL } from "../../../util/config";
import defaultImage from "../../../assets/images/default.jpg";

const CategoryWiseSubCategory = (props) => {

  const { state } = useLocation();


  const { categoryWiseSubCategory } = useSelector((state) => state.subCategory);
  const { subcategory } = useSelector((state) => state.attribute);
  const { dialogue, dialogueType } = useSelector((state) => state.dialogue);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(getCategoryWiseSubCategory(state?.id));
    dispatch(getAllSubcategory());
  }, [dispatch, state?.id]);

  useEffect(() => {
    if (state?.id) {
      setData(categoryWiseSubCategory);
    } else {
      setData(subcategory);
    }
  }, [categoryWiseSubCategory, subcategory, state?.id]);


  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);


  // Delete Category
  const handleDelete = (id) => {
    const data = warning();
    data
      .then((isDeleted) => {
        if (isDeleted) {
          dispatch(deleteSubCategory(id));
        }
      })
      .catch((err) => console.log(err));
  };

  // // pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  useEffect(() => {
    return () => {
      dispatch({ type: CLEAR_SUB_CATEGORY, payload: [] });
      dispatch({ type: CLEAN_DATA, payload: [] });
    }
  }, []);  // empty dependency - so runs only on unmount

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span className="text-white">{page * rowsPerPage + index + 1}</span>,
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
                src={row.image ? row?.image.includes("http") ? row?.image : baseURL + row?.image : defaultImage}
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
      Header: "Sub Category",
      body: "name",
      Cell: ({ row }) => (

        <div className="">
          <p className="mb-0 fw-normal text-white">{row?.name}</p>
          {/* {state?.id && (
            <>
              {row?.category?.name ? (
                <p className="text-white fw-normal text-center">
                  {"(" + row?.category?.name + ")"}
                </p>
              ) : (
                <p className="text-white fw-normal text-center">
                  {"(" + row?.category + ")"}
                </p>
              )}
            </>
          )} */}
        </div>

      ),
    },
    ...(state?.id ? [{
      Header: "Product",
      body: "name",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 fw-normal text-white">
            {row?.sameSubcategoryProductCount
              ? row?.sameSubcategoryProductCount
              : 0}
          </p>
        </div>
      ),
    }] : []),
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
              payload: { data: row, type: "subCategory" },
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
          onClick={() => handleDelete(row?.subCategoryId ? row?.subCategoryId : row?._id)}

        />

      ),
    },
  ];
  return (
    <>
      <div className="mainSellerTable">
        <div className="sellerTable">

          <div className="d-flex justify-content-between align-items-center px-4" style={{ marginTop: "25px" }}>
            <h5 className="fw-bold text-white" style={{ paddingLeft: "20px" }}>Sub Category</h5>
            <div className="d-flex justify-content-end ">
              <button
                onClick={() => navigate(-1)}
                className="btn  rounded-pill px-4"
                style={{ border: "1px solid #b93160", margin: "8px 28px", backgroundColor: "#b93160", color: "#fff" }}
              >
                ← Back
              </button>
            </div>
          </div>


          <div className="sellerMain">
            <div className="tableMain mt-2">
              <div className="sellerHeader primeHeader">
                <div className="row">
                  <div className="col-8">

                  </div>
                  <div className="col-12 ">
                    <div
                      className="d-flex justify-content-start"

                    >
                      <Button
                        newClass={`whiteFont mt-1`}
                        btnColor={`btnBlackPrime`}
                        btnIcon={`fa-solid fa-plus`}
                        btnName={`Add`}
                        onClick={() => {
                          dispatch({
                            type: OPEN_DIALOGUE,
                            payload: { type: "subCategory", extraData: state?.id },
                          });
                        }}
                        style={{ borderRadius: "5px", padding: "8px 32px", background: "#b93160" }}
                      />
                      {dialogue && dialogueType === "subCategory" && (
                        <SubCategoryDialoge />
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <Table
                data={data}
                mapData={mapData}
                PerPage={rowsPerPage}
                Page={page}
                type={"client"}
                loading={loading}
              />
              <Pagination
                type={"client"}
                component="div"
                count={categoryWiseSubCategory?.length}
                serverPage={page}
                serverPerPage={rowsPerPage}
                onPageChange={handleChangePage}
                totalData={categoryWiseSubCategory?.length}
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

export default connect(null, { getCategoryWiseSubCategory, deleteSubCategory })(
  CategoryWiseSubCategory
);
