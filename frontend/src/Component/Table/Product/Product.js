import React, { useEffect, useState } from "react";
import Table from "../../extra/Table";

import {
  getProduct,
  NewCollection,
  outOfStock,
  deleteProduct,
} from "../../store/product/product.action";
import { connect, useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import ToggleSwitch from "../../extra/ToggleSwitch";
import Pagination from "../../extra/Pagination";
import Searching from "../../extra/Searching";

import {  warning } from "../../../util/Alert";
import Skeleton from "react-loading-skeleton";
import { colors } from "../../../util/SkeletonColor";
import "react-loading-skeleton/dist/skeleton.css";

import { getDefaultCurrency } from "../../store/currency/currency.action";

import Iconb from "../../extra/Iconb";
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import defaultImage from "../../../assets/images/default.jpg";

const Product = (props) => {
  const [size, setSize] = useState(10);
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { product, totalProduct } = useSelector((state) => state.product);
  const { defaultCurrency } = useSelector((state) => state.currency);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getProduct(currentPage, size));
  }, [dispatch, currentPage, size]);

  useEffect(() => {
    dispatch(getDefaultCurrency())
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    setData(product);
  }, [product]);

  // // pagination
  const handleChangePage = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event), 10);
    setSize(parseInt(event), 10);
    setCurrentPage(1);
  };

  const handleClick = (product, data) => {
    props.NewCollection(product, data);
  };
  const outOfStockClick = (stock, data) => {
    props.outOfStock(stock, data);
  };

  // searching
  const handleFilterData = (filteredData) => {
    if (typeof filteredData === "string") {
      setSearch(filteredData);
    } else {
      setData(filteredData);
    }
  };
  // Opeen Detail Page
  const handleOpen = (data) => {
    navigate("/admin/productDetail", {
      state: data,
    });
  };

  const handleEdit = (id) => {
    console.log("id::::", id);

    navigate("/admin/addProduct", {
      state: {
        id: id,
        pathName: "/admin/addProduct" // you can pass anything you want
      },
    });
  };

  // Delete Product

  const handleDelete = (productId) => {
    const data = warning();
    data
      .then((isDeleted) => {
        if (isDeleted) {
          props.deleteProduct(productId);
        }
      })
      .catch((err) => console.log(err));
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
      Header: "Product",
      body: "images",
      Cell: ({ row }) => (
        <div className="d-flex">
          <div className="">
            {loading ? (
              <>
                <Skeleton
                  height={52}
                  width={55}
                  className="StripeElement "
                  baseColor={colors?.baseColor}
                  highlightColor={colors?.highlightColor}
                />
              </>
            ) : (
              <>
                <img
                  src={row?.mainImage}
                  height={55}
                  width={55}
                  style={{ borderRadius: "10px" }}
                  alt=""
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = defaultImage;
                  }}
                />
              </>
            )}
          </div>
          <span className="fw-normal boxCenter text-start ms-2 text-white">
            {row?.productName}
          </span>
        </div>
      ),
    },
    {
      Header: "Category",
      body: "category",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-capitalize text-white">
            {row?.category?.name}
          </p>
        </div>
      ),
    },
    {
      Header: "SubCategory",
      body: "subcategory",
      Cell: ({ row }) => (
        <div className="">
          <p className="mb-0 text-capitalize text-white">
            {row?.subCategory?.name}
          </p>
        </div>
      ),
    },
    {
      Header: "Product Code",
      Cell: ({ row }) => (
        <span className="tableBoldFont">
          <b className="fw-normal text-white">{row?.productCode}</b>
        </span>
      ),
    },
    {
      Header: "product Sale Type",
      Cell: ({ row }) => (
        <span className="tableBoldFont">
          <b className="fw-normal text-white">
            {row?.productSaleType === 1
              ? "Buy Now"
              : row?.productSaleType === 2
                ? "Auction"
                : row?.productSaleType === 3
                  ? "Not for Sale"
                  : "-"
            }</b>
        </span>
      ),
    },
    {
      Header: `Price (${defaultCurrency?.symbol || ''})`,
      Cell: ({ row }) => (
        <span className="tableBoldFont">
          <b className="fw-normal text-white">{row?.price}</b>
        </span>
      ),
    },
    {
      Header: `Shipping Charges (${defaultCurrency?.symbol || ''})`,
      Cell: ({ row }) => (
        <span className="tableBoldFont">
          <b className="fw-normal text-white">{row?.shippingCharges}</b>
        </span>
      ),
    },
    {
      Header: "Status",
      body: "createStatus",
      Cell: ({ row }) => (
        <div className="boxCenter">
          {row?.createStatus === "Approved" ? (
            <span className="badge badge-success">{row?.createStatus}</span>
          ) : (
            <span className="badge badge-danger">{row?.createStatus}</span>
          )}
        </div>
      ),
    },

    {
      Header: "New Collection",
      body: "isNewCollection",
      Cell: ({ row }) => (
        <div className="">
          <ToggleSwitch
            value={row?.isNewCollection}
            onClick={() => handleClick(row?._id, row)}
          />
        </div>
      ),
    },
    {
      Header: "Out Of Stock",
      body: "isOutOfStock",
      Cell: ({ row }) => (
        <div className="">
          <ToggleSwitch
            value={row?.isOutOfStock}
            onClick={() => outOfStockClick(row?._id, row)}
          />
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
            handleEdit(row);
          }}

        />
        // <Button
        //   newClass={`themeFont boxCenter userBtn fs-5`}


        //   btnIcon={`fa-solid fa-edit`}
        //   style={{
        //     borderRadius: "5px",
        //     margin: "auto",
        //     width: "40px",
        //     backgroundColor: "#fff",
        //     color: "#160d98",
        //   }}
        //   onClick={() => {
        //     handleEdit(row);
        //   }}
        // />
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
        // <Button
        //   newClass={`themeFont boxCenter userBtn fs-4`}
        //   btnColor={``}

        //   btnIcon={`bi bi-info-circle`}
        //   onClick={() => handleOpen(row?._id)}

        //   style={{
        //     borderRadius: "5px",
        //     margin: "auto",
        //     width: "40px",
        //     backgroundColor: "#fff",
        //   }}
        // />
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
        //     backgroundColor: "#fff",
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
  ];
  return (
    <>
      <>
        <div className="mainProductTable">
          <div className="ProductTable">

            <div className="col-12 headname">Product </div>
            <div className="sellerMain">
              <div className="tableMain mt-2">
                <div className="productHeader primeHeader">
                  <div className="row">
                    <div className="col-2">

                    </div>

                    <div className="col-10">
                      <Searching
                        type={`client`}
                        data={product}
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
                  count={totalProduct}
                  type={"server"}
                  onPageChange={handleChangePage}
                  serverPerPage={rowsPerPage}
                  totalData={totalProduct}
                  serverPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </div>
            </div>
            <div className="ProductFooter primeFooter"></div>
          </div>
        </div>
      </>
    </>
  );
};

export default connect(null, {
  getProduct,
  NewCollection,
  outOfStock,
  deleteProduct,
})(Product);
