import React from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import Pagination from "../../../extra/Pagination";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useState } from "react";
import { getSellerProduct } from "../../../store/seller/seller.action";
import {
  NewCollection,
  outOfStock,
} from "../../../store/product/product.action";
import ToggleSwitch from "../../../extra/ToggleSwitch";
import Table from "../../../extra/Table";
import Button from "../../../extra/Button";
import Info from "../../../../assets/images/Info.svg"
import { getDefaultCurrency } from "../../../store/currency/currency.action";
import Iconb from "../../../extra/Iconb";
import InfoOutlined from '@mui/icons-material/InfoOutlined';

const SellerProduct = (props) => {
  const { product } = useSelector((state) => state.seller);
  const { defaultCurrency } = useSelector((state) => state.currency);
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();



  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    dispatch(getSellerProduct(state));
    dispatch(getDefaultCurrency())
  }, [dispatch, state]);

  useEffect(() => {
    setData(product);
  }, [product]);

  // // pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  // toggle switch

  const handleClick = (product, data) => {
    props.NewCollection(product, data);
  };

  const handleOpen = (id) => {
    console.log("id****", id);
    
    navigate("/admin/productDetail", {
      state: id,
    });
  };

  // table Data

  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span className="text-white fw-normal">{page * rowsPerPage + parseInt(index) + 1}</span>,
    },
    {
      Header: "Product",
      body: "image",
      Cell: ({ row }) => (
        <div className="d-flex">
          <div className="">
            <img
              src={row.mainImage}
              style={{ borderRadius: "10px" }}
              height={50}
              width={50}
              alt=""
            />
          </div>
          <span className="ms-2">
            <span className=""

            >{row.productName}</span> <br />
            <p className="text-white font-normal text-start">
              {"review (" + row.review + ")"}
            </p>
          </span>
        </div>
      ),
    },


    {
      Header: "Product Code",
      body: "productCode",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 fw-normal text-white">{row.productCode}</p>
        </div>
      ),
    },
    {
      Header: "Category",
      body: "category",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-white font-normal">
            {/* {row.subCategory.name + "(" + row.category.name + ")"} */}
            {row.category.name}
          </p>
        </div>
      ),
    },

    {
      Header: "Subcategory",
      body: "Subcategory",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-white font-normal">
            {row.subCategory.name}
          </p>
        </div>
      ),
    },

    {
      Header: "Seller",
      body: "seller",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-white font-normal">
            {row.seller.firstName + " " + row.seller.lastName}
          </p>
        </div>
      ),
    },

    {
      Header: `Shipping Charge (${defaultCurrency?.symbol})`,
      body: "shippingCharges",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-white font-normal">{row.shippingCharges}</p>
        </div>
      ),
    },
    {
      Header: `Selling Price (${defaultCurrency?.symbol})`,
      body: "price",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-white font-normal">{row.price} </p>
        </div>
      ),
    },
    {
      Header: `Created`,
      body: "date",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-white font-normal">{row.createdAt.split("T")[0]} </p>
        </div>
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
          onClick={() => handleOpen(row)}

        />
      ),
    },

    // add more columns as needed
  ];
  return (
    <>
      <div className="userMain ">

        <div className="tableMain mt-4">
          <div className="row">
            <Table
              data={data}
              mapData={mapData}
              PerPage={rowsPerPage}
              Page={page}
              type={"client"}
            />
            <Pagination
              component="div"
              count={product?.length}
              serverPage={page}
              type={"client"}
              onPageChange={handleChangePage}
              serverPerPage={rowsPerPage}
              totalData={product?.length}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default connect(null, { getSellerProduct, NewCollection, outOfStock })(
  SellerProduct
);
