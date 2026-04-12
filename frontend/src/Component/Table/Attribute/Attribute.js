import React, { useEffect, useState } from "react";
import Table from "../../extra/Table";
import Pagination from "../../extra/Pagination";
import { connect, useDispatch, useSelector } from "react-redux";
import AttributeDialog from "./AttributeDialog";
import { warning } from "../../../util/Alert";
import dayjs from "dayjs";
import Button from "../../extra/Button";
import Iconb from "../../extra/Iconb";
import { OPEN_DIALOGUE } from "../../store/dialogue/dialogue.type";
import {
  getAttribute,
  deleteAttribute,
  getAllSubcategory,
} from "../../store/attribute/attribute.action";
import EditInfo from "../../../assets/images/Edit.png";
import Delete from "../../../assets/images/Delete.svg"
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import DeleteIcon from '@mui/icons-material/Delete';
import Select from 'react-select';
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { colors } from "../../../util/SkeletonColor";
import { baseURL } from "../../../util/config";
// import customStyles from "../../../Component/extra/DropDownStyle";

const customStyles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#ffccde' : 'white',  
    color: state.isSelected ? 'white' : 'black',             
    background: state.isSelected ? '#b93160' : undefined,  
    cursor: 'pointer',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,          
  }),
};

const Attribute = (props) => {
  const [page, setPage] = useState(0);
  const [data, setData] = useState([]);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedOptions, setSelectedOptions] = useState("All");
  const [loading, setLoading] = useState(true);

  const dispatch = useDispatch();

  const fieldTypeOptions = [
    { value: "All", label: "All" }, // Default option
    { value: "5", label: "Dropdown" },
    { value: "6", label: "Checkboxes" },
  ];
  const [fieldType, setFieldType] = useState("All");

  const [selectedFieldType, setSelectedFieldType] = useState(fieldTypeOptions[0]); // Default selected "All"


  const { attribute } = useSelector((state) => state.attribute);

  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state) => state.dialogue
  );
  const { subcategory } = useSelector((state) => state.attribute);
  useEffect(() => {
    dispatch(getAttribute({
      subCategoryId: selectedOptions.value || "All",
      fieldType: fieldType.value || "All"
    }));
  }, [dispatch, selectedOptions, fieldType]);

  useEffect(() => {
    setData(attribute);
  }, [attribute]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  // Delete PromoCode
  const handleDelete = (id) => {

    const data = warning();
    data
      .then((isDeleted) => {
        if (isDeleted) {
          dispatch(deleteAttribute(id));
        }
      })
      .catch((err) => console.log(err));
  };



  const options = [
    { value: "All", label: "All" },  // manual "All" entry
    ...subcategory.map((item) => ({
      value: item._id,
      label: item.name
    }))
  ];




  const handleChange = (selected) => {
    setSelectedOptions(selected);  // selected item ko state me daal do

    if (selected?.value === "All") {
      // agar "All" selected hai, toh pura data dikhao
      setData(attribute);
    } else {
      // specific subcategory filter kar ke dikhao
      const filtered = attribute.filter((attr) =>
        attr?.subcategories?.includes(selected.value)
      );
      setData(filtered);
    }
  };


  useEffect(() => {
    dispatch(getAllSubcategory());
  }, [])

  const handleFieldTypeChange = (e) => {
    const value = e.target.value;
    setFieldType(value);

    if (value === "All") {
      setData(attribute);
    } else {
      const filtered = attribute.filter((attr) => attr?.fieldType === value);
      setData(filtered);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // Adjust the delay time as needed

    return () => clearTimeout(timer);
  }, []);



  const mapData = [
    {
      Header: "No",
      width: "20px",
      Cell: ({ index }) => <span className="text-white">{page * rowsPerPage + parseInt(index) + 1}</span>,
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
                src={row.attributes ? row.attributes[0]?.image.includes("http") ? row.attributes[0]?.image : baseURL + row.attributes[0]?.image : "/dummy.png"}
                style={{ borderRadius: "50px", cursor: "pointer" }}
                height={45}
                width={45}
                alt="category"
                // onClick={() =>
                //   navigate("/admin/category/subCategory", {
                //     state: { id: row?._id },
                //   })
                // }
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/dummy.png";
                }}
              />

            </>
          )}
        </>
      ),
    },

    {
      Header: "Name",
      body: "subcategory",
      Cell: ({ row }) => {
        // Check if row?.attributes exists and has at least one element
        const attribute = row?.attributes && row?.attributes.length > 0 ? row.attributes[0] : null;
        return <span className="fw-normal fs-6 text-white">{attribute ? attribute.name : "-"}</span>;
      },
    },

    {
      Header: "Subcategory",
      body: "name",
      Cell: ({ row }) => <span className="fw-normal fs-6 text-white">{row?.subCategory?.name ? row?.subCategory?.name : "-"}</span>,
    },

    {
      Header: "Type",
      body: "type",
      Cell: ({ row }) => {
        const typeMap = {
          1: "Text Input",
          2: "Number Input",
          3: "File Input",
          4: "Radio",
          5: "Dropdown",
          6: "Checkboxes",
        };

        const fieldType = row?.attributes?.[0]?.fieldType;
        return <span className="fw-normal fs-6 text-white">{typeMap[fieldType] || "Unknown"}</span>;
      },
    },


    // {
    //   Header: "Details",
    //   body: "details",
    //   Cell: ({ row }) => (
    //     <span
    //       className="fw-normal fs-6 text-white"
    //       style={{
    //         display: "inline-block",
    //         maxWidth: "350px",       // Fixed width
    //         whiteSpace: "normal",    // Allow line breaks
    //         wordWrap: "break-word",  // Break long words if needed
    //         overflowWrap: "break-word"
    //       }}
    //     >
    //       {Array.isArray(row?.value) ? row.value.join(", ") : "-"}
    //     </span>
    //   )


    //   // Cell: ({ row }) => {
    //   //   const [isExpanded, setIsExpanded] = useState(false);
    //   //   const detailsText = row?.value?.map((condition) => (
    //   //     <span className="ms-1 text-capitalize text-white fw-normal">{condition + ","}</span>
    //   //   ));

    //   //   return (
    //   //     <div>
    //   //       {isExpanded ? detailsText : detailsText?.slice(0, 5)}
    //   //       {row?.value?.length > 2 && !isExpanded}
    //   //       <span
    //   //         onClick={() => setIsExpanded(!isExpanded)}
    //   //         className="pointer text-white fw-normal"
    //   //         style={{ display: "inline-block", marginLeft: "5px" }}
    //   //       >
    //   //         {isExpanded ? "Read Less..." : "Read More"}
    //   //       </span>
    //   //     </div>
    //   //   );
    //   // },
    // },
    {
      Header: "Created Date",
      body: "createdAt",
      Cell: ({ row }) => (
        <span className="text-white fw-normal">{dayjs(row?.createdAt).format("DD MMM YYYY")}</span>
      ),
    },
    {
      Header: "Edit",
      body: "",
      Cell: ({ row }) => (
        <>
          {/* <img
          src={EditInfo}
          height={25}
          width={25}
          alt="Edit"
          onClick={() =>
            dispatch({
              type: OPEN_DIALOGUE,
              payload: { data: row, type: "attribute" },
            })
          }
        /> */}
          <Iconb
            type="button"
            newClass={`themeFont boxCenter infobtn userBtn   `}
            btnIcon={<CreateOutlinedIcon sx={{ color: '#737272' }} />}
            style={{
              borderRadius: "50px",
              margin: "auto",
              height: "40px",
              width: "40px",
              color: "#160d98",
              padding: "0px"

            }}
            isImage={true}

            onClick={() =>
              dispatch({
                type: OPEN_DIALOGUE,
                payload: { data: row, type: "attribute" },
              })
            }

          />
        </>
      ),
    },
    {
      Header: "Delete",
      body: "",
      Cell: ({ row }) => (
        <>
          <Iconb
            newClass={`themeFont boxCenter killbtn userBtn `}
            btnIcon={<DeleteIcon sx={{ color: '#FF4C51' }} />}
            style={{
              borderRadius: "50px",
              margin: "auto",
              height: "40px",
              width: "40px",
              color: "#160d98",
              padding: "0px"

            }}
            isImage={true}
            isDeleted={true}
            onClick={() => handleDelete(row?._id)}

          />
          {/* <button
            className={`themeBtn text-center `}
            style={{
              borderRadius: "5px",
              margin: "auto",
              width: "40px",
              backgroundColor: "#fff",
              color: "#cd2c2c",
            }}
            onClick={() => handleDelete(row?._id)}
          >
            <svg
              width="25"
              height="25"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.04017 6L4.9258 16.6912C4.98927 17.4622 5.646 18.0667 6.41993 18.0667H14.5801C15.354 18.0667 16.0108 17.4622 16.0742 16.6912L16.9598 6H4.04017ZM7.99953 16.0667C7.7378 16.0667 7.5176 15.8631 7.501 15.5979L7.001 7.53123C6.9839 7.25537 7.19337 7.01807 7.46877 7.00097C7.7544 6.98093 7.98147 7.19287 7.99903 7.46873L8.49903 15.5354C8.51673 15.8211 8.2907 16.0667 7.99953 16.0667ZM11 15.5667C11 15.843 10.7764 16.0667 10.5 16.0667C10.2236 16.0667 10 15.843 10 15.5667V7.5C10 7.22363 10.2236 7 10.5 7C10.7764 7 11 7.22363 11 7.5V15.5667ZM13.999 7.53127L13.499 15.5979C13.4826 15.8604 13.2638 16.0791 12.9687 16.0657C12.6933 16.0486 12.4839 15.8113 12.501 15.5354L13.001 7.46877C13.0181 7.1929 13.2598 6.9922 13.5312 7.001C13.8066 7.0181 14.0161 7.2554 13.999 7.53127ZM17 3H14V2.5C14 1.67287 13.3271 1 12.5 1H8.5C7.67287 1 7 1.67287 7 2.5V3H4C3.4477 3 3 3.4477 3 4C3 4.55223 3.4477 5 4 5H17C17.5523 5 18 4.55223 18 4C18 3.4477 17.5523 3 17 3ZM13 3H8V2.5C8 2.22413 8.22413 2 8.5 2H12.5C12.7759 2 13 2.22413 13 2.5V3Z"
                fill="#CD2C2C"
              />
            </svg>
          </button> */}
        </>
      ),
    },

    // add more columns as needed
  ];

  return (
    <>
      <div className="mainSellerTable">
        <div className="sellerTable">
          <div className="col-12 headname">Attribute</div>
          <div className="sellerMain">

            <div className="col-12" style={{ marginLeft: "28px" }}>
              <Button
                newClass={`whiteFont`}
                btnColor={`btnBlackPrime `}
                btnIcon={`fa-solid fa-plus `}
                btnName={`Add`}
                onClick={() => {
                  dispatch({
                    type: OPEN_DIALOGUE,
                    payload: { type: "attribute" },
                  });
                }}
                style={{ borderRadius: "5px", padding: "8px 32px", background: "#b93160" }}
              />
              {dialogue && dialogueType === "attribute" && (
                <AttributeDialog />
              )}
            </div>

            <div className="tableMain mt-2">
              <div className="d-flex justify-content-between">

                <div className="col-3" style={{ margin: "20px", zIndex: 50 }}>
                  <label>Subcategory</label>
                  <Select
                    // isMulti
                    options={options}
                    value={selectedOptions}
                    onChange={handleChange}
                    styles={customStyles}
                    placeholder="Select Subcategory..."
                  />
                </div>
                {/* 
                <div className="col-3" style={{ margin: "20px", zIndex: 50 }}>
                  <label>
                    Field Type
                  </label>
                  <select
                    className="form-control"
                    value={fieldType}
                    onChange={handleFieldTypeChange}
                    style={{ backgroundColor: "transparent", color: "#333333" }}
                  >
                    <option value="All">All</option>
                    <option value="1">Text Input</option>
                    <option value="2">Number Input</option>
                    <option value="3">File Input</option>
                    <option value="4">Radio</option>
                    <option value="5">Dropdown</option>
                    <option value="6">Checkboxes</option>
                  </select>
                </div> */}

                <div className="col-3" style={{ margin: "20px", zIndex: 50 }}>
                  <label>Field Type</label>
                  <Select
                    options={fieldTypeOptions}
                    value={fieldType}
                    onChange={(selected) => setFieldType(selected)}
                    styles={customStyles}
                    placeholder="Select field type..."
                  />
                </div>

              </div>
              <Table
                data={data}
                mapData={mapData}
                PerPage={rowsPerPage}
                Page={page}
                type={"client"}
              />
              <Pagination   //Pagination if need
                component="div"
                count={attribute?.length}
                serverPage={page}
                type={"client"}
                onPageChange={handleChangePage}
                serverPerPage={rowsPerPage}
                totalData={attribute?.length}
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

export default connect(null, { getAttribute, deleteAttribute })(Attribute);
