import React, { useEffect, useState } from "react";
import Button from "../../extra/Button";
import Input from "../../extra/Input";
import { connect, useDispatch, useSelector } from "react-redux";
import { sellerDropDown } from "../../store/seller/seller.action";
import { getCategory } from "../../store/category/category.action";
import { getCategoryWiseSubCategory } from "../../store/subCategory/subCategory.action";
import { getAttribute } from "../../store/attribute/attribute.action";
import { updateProduct } from "../../store/product/product.action";
import { createFakeProduct, updateFakeProduct } from "../../store/fakeProduct/fakeProduct.action";
import ReactDropzone from "react-dropzone";
import { useLocation, useNavigate } from "react-router-dom";
// import Select from "@mui/material/Select";
import { getFakeSellerDropDown } from "../../store/fake Seller/fakeSeller.action";
import { getDefaultCurrency } from "../../store/currency/currency.action";
import defaultImage from "../../../assets/images/default.jpg";
// import defaultImage from "../../../assets/images/default.jpg";
import Multiselect from "multiselect-react-dropdown";
import CancelIcon from "@mui/icons-material/Cancel";


const AddProduct = (props) => {
  const { fakeSeller } = useSelector((state) => state.fakeSeller);
  const { category } = useSelector((state) => state.category);
  const { categoryWiseSubCategory } = useSelector((state) => state.subCategory);
  const { attribute } = useSelector((state) => state.attribute);
  const { defaultCurrency } = useSelector((state) => state.currency);
  const { state } = useLocation();

  const [mongoId, setMongoId] = useState("");
  const [productName, setProductName] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [images, setImages] = useState([]);
  const [sellerType, setSellerType] = useState("");
  const [categoryType, setCategoryType] = useState("");
  const [subCategoryType, setSubCategoryType] = useState("");
  const [removedIndices, setRemovedIndices] = useState([]);
  const [description, setDescription] = useState("");
  const [shippingCharge, setShippingCharge] = useState("");
  const [productCode, setProductCode] = useState("");
  const [attributeType, setAttributeType] = useState("");
  const [selectedValue, setSelectedValue] = useState([]);
  const [selectedItems, setSelectedItems] = useState({});
  const [attrData, setAttrData] = useState([]);
  const [cheakImage, setImageCheak] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const [error, setError] = useState({
    productName: "",
    image: "",
    sellerType: "",
    categoryType: "",
    subCategoryType: "",
    description: "",
    attributeType: "",
    shippingCharge: "",
    productCode: "",
    images: "",
    personNames: "",
    selectedItemsErrors: {},
  });

  useEffect(() => {
    dispatch(getDefaultCurrency());
  }, [])

  useEffect(() => {
    setAttrData(attribute);
  }, [attribute, state]);

  useEffect(() => {
    if (!subCategoryType) {
      setAttrData([]);
    }
  }, [subCategoryType])

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getFakeSellerDropDown());
    dispatch(getCategory());
    if (categoryType) {
      dispatch(getCategoryWiseSubCategory(categoryType));
    }
  }, [categoryType, dispatch]);

  useEffect(() => {
    if (subCategoryType) {
      dispatch(getAttribute({ subCategoryId: subCategoryType, fieldType: "All" }));
    }
  }, [subCategoryType, dispatch, state?.id]);

  const handleRemove = (data) => {
    const id = data._id;

    const attrToRemove = attrData.find((attr) => attr._id === id);
    if (attrToRemove && attrToRemove.attributes[0].isRequired) {
      setModalMessage("This attribute is required and cannot be removed.");
      setShowModal(true);
    } else {
      // UI se attribute remove karna
      setAttrData((prev) => prev.filter((attr) => attr._id !== id));

      // selectedItems se attribute remove karna
      setSelectedItems(prev => {
        const updated = { ...prev };
        delete updated[data.attributes[0]._id];
        return updated;
      });
    }
  };

  useEffect(() => {
    if (state?.id) {
      // const incomingAttributes = state?.id?.attributes || [];
      // // Agar wo already expected format mein nahi hai, to map kar ke convert kar lete hain
      // const formattedAttributes = incomingAttributes.map((attr, index) => {
      //   return {
      //     _id: attr._id || `attr-temp-id-${index}`, // agar _id nahi to temp id bhi de sakte hain
      //     attributes: [
      //       {
      //         // fieldType: attr.fieldType,
      //         image: attr.image,
      //         // isActive: attr.isActive,
      //         // isRequired: attr.isRequired,
      //         // maxLength: parseInt(attr.maxLength),
      //         // minLength: parseInt(attr.minLength),
      //         name: attr.name,
      //         values: attr?.values?.map(val => val) || [],
      //       }
      //     ],
      //   };
      // });

      // setAttrData(formattedAttributes);
      const incomingAttributes = state?.id?.attributes || [];
      const preparedSelectedItems = {};
      incomingAttributes.forEach(attr => {
        preparedSelectedItems[attr._id] = {
          _id: attr._id,
          name: attr.name,
          values: attr.values?.map(val => ({
            label: val,
            value: val
          })) || [],
          image: attr.image
        };
      });
      setSelectedItems(preparedSelectedItems);
      setMongoId(state?.id?._id || '');
      setProductName(state?.id?.productName || '');
      setPrice(state?.id?.price || '');
      setImagePath(state?.id?.mainImage || '');
      setImage(state?.id?.mainImage || '');
      setSellerType(state?.id?.seller?._id || '');
      setCategoryType(state?.id?.category?._id || '');
      setSubCategoryType(state?.id?.subCategory?._id || '');
      setDescription(state?.id?.description || '');
      setImages(state?.id?.images || []);
      setImageCheak(state?.id?.images || []);
      setProductCode(state?.id?.productCode || '');
      setShippingCharge(state?.id?.shippingCharges || '');
    }
  }, [state]);


  const handleImage = (e) => {
    setImage(e.target.files[0]);
    setImagePath(URL.createObjectURL(e.target.files[0]));
    setError((prevErrors) => ({
      ...prevErrors,
      image: "",
    }));
  };

  const onPreviewDrop = (files) => {
    setError({ ...error, images: "" });
    files.map((file) =>
      Object.assign(file, { preview: URL.createObjectURL(file) })
    );
    setImages(prevImages => [...prevImages, ...files]);
  };

  const removeImage = (file, index) => {

    const fileUrl = file.preview ? file.preview : (typeof file === 'string' ? file : '');

    const matchedIndices = [];
    cheakImage.forEach((imgUrl, idx) => {
      if (imgUrl === fileUrl) {
        matchedIndices.push(idx);
      }
    });

    setRemovedIndices(prev => [...prev, ...matchedIndices]);

    if (file.preview) {
      const updatedImages = images.filter((_, i) => i !== index);
      setImages(updatedImages);
    } else {
      const updatedImages = images.filter(ele => ele !== file);
      setImages(updatedImages);
    }
  };


  const createCode = () => {
    const randomChars = "0123456789";
    let code_ = "";
    for (let i = 0; i < 6; i++) {
      code_ += randomChars.charAt(
        Math.floor(Math.random() * randomChars.length)
      );
      setProductCode(code_);
    }
    if (!code_) {
      return setError({
        ...error,
        productCode: "Code can't be a blank!",
      });
    } else {
      return setError({
        ...error,
        productCode: "",
      });
    }
  };

  const handleInputChange = (id, field, value, index = 0) => {
    // Clear specific error for minLength or maxLength on change
    setError((prevError) => {
      const newError = { ...prevError };
      if (field === "minLength" && newError.minLength) {
        newError.minLength = "";
      } else if (field === "maxLength" && newError.maxLength) {
        newError.maxLength = "";
      }
      return newError;
    });

    setAttrData((prev) =>
      prev.map((attr) => {
        if (attr._id === id) {
          const updatedAttributes = [...attr.attributes];
          updatedAttributes[index] = {
            ...updatedAttributes[index],
            [field]: value,
          };
          return {
            ...attr,
            attributes: updatedAttributes,
          };
        }
        return attr;
      })
    );
  };

  const fieldTypeNames = {
    1: "Text Input",
    2: "Number Input",
    3: "File Input",
    4: "Radio",
    5: "Dropdown",
    6: "Checkboxes",
  };

  const onSelect = (attrId, selectedValues) => {

    setSelectedItems(prev => ({
      ...prev,
      [attrId._id]: {
        name: attrId.name,     // store attribute name here
        values: selectedValues, // store selected values here
        image: attrId.image
      }
    }));
    // setError(prevError => {
    //   console.log("prevError", prevError);
    //   const newErrors = { ...prevError.selectedItemsErrors , [attrId._id]: "" };
    //   console.log("Clearing error for:", attrId._id, newErrors);
    //   return {
    //     ...prevError,
    //     selectedItemsErrors: newErrors
    //   };
    // });
  };

  const onRemove = (attrId, selectedValues) => {
    setSelectedItems(prev => ({
      ...prev,
      [attrId._id]: {
        name: attrId.name,
        values: selectedValues,
        image: attrId.image
      }
    }));
    // setError(prevError => {
    //   const newErrors = { ...prevError.selectedItemsErrors };
    //   if (!selectedValues || selectedValues.length === 0) {
    //     newErrors[attrId._id] = `Please select at least one value for "${attrId.name}".`;
    //   } else {
    //     newErrors[attrId._id] = "";
    //   }
    //   return {
    //     ...prevError,
    //     selectedItemsErrors: newErrors
    //   };
    // });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    
    let isValid = true;
    let error = {};

    // let selectedItemsErrors = {};

    // attrData.forEach((attr) => {
    //   const attrId = attr._id;
    //   const selectedAttr = selectedItems[attrId];

    //   if (!selectedAttr || !selectedAttr.values || selectedAttr.values.length === 0) {
    //     selectedItemsErrors[attrId] = `Please select at least one value for "${attr.attributes[0].name || 'this attribute'}".`;
    //     isValid = false;
    //   }
    // });

    // error.selectedItemsErrors = selectedItemsErrors;


    // ======= Product Level Validation ========
    if (
      !productName ||
      !image ||
      !images ||
      images.length <= 0 ||
      // selectedItems.length <= 0 ||
      !sellerType ||
      !price ||
      price <= 0 ||
      !categoryType ||
      !subCategoryType ||
      !description ||
      !shippingCharge ||
      shippingCharge <= 0 ||
      shippingCharge >= price ||
      !productCode ||
      productCode?.length > 7
    ) {
      if (!productName) error.productName = "ProductName is Required!";
      if (!price) error.price = "Price is Required!";
      if (price <= 0) error.price = "Enter Correct Price";
      if (sellerType?.length <= 0 || !sellerType) error.sellerType = "SellerType is Required!";
      if (!image || !imagePath) error.image = "MainImage is required!";
      if (!categoryType) error.categoryType = "CategoryType is Required!";
      if (!shippingCharge) error.shippingCharge = "ShippingCharge is Required!";
      if (shippingCharge <= 0) error.shippingCharge = "Enter Correct ShippingCharge";
      if (parseFloat(shippingCharge) >= parseFloat(price)) {
        error.shippingCharge = "Shipping Charge must be less than Product Price";
      }
      // if (!selectedItems || Object.keys(selectedItems).length === 0) error.selectedItems = "Select Items";
      if (!productCode) error.productCode = "ProductCode is Required!";
      if (productCode?.length > 7) error.productCode = "Correct ProductCode!";
      if (!subCategoryType) error.subCategoryType = "SubCategoryType is Required!";
      // if (!image?.length === 0 || !imagePath) error.image = "Image is required!";
      // if (images?.length === 0) error.images = "Images is required!";
      // if (!images || images.length === 0) {
      //   error.images = "Images is required!";
      //   isValid = false;
      // }
      if (images.length === 0) {
        error.images = "Images is required!";
        isValid = false;
      }
      if (!description) error.description = "Description is Required!";
      isValid = false;
    }

    // ======= Attributes Level Validation ========
    attrData.forEach((attr) => {
      const attrDetails = attr.attributes[0];
      const fieldType = attrDetails.fieldType ? attrDetails.fieldType.toString() : "";

      // if (fieldType === 1 || fieldType === 2) {
      //   if (!attrDetails.minLength && attrDetails.minLength !== 0) {
      //     error.minLength = `Min length is required for "${attrDetails.name || ''}" (${fieldTypeNames[fieldType]}).`;
      //     isValid = false;
      //   }
      //   if (!attrDetails.maxLength && attrDetails.maxLength !== 0) {
      //     error.maxLength = `Max length is required for "${attrDetails.name || ''}" (${fieldTypeNames[fieldType]}).`;
      //     isValid = false;
      //   }
      //   if (
      //     attrDetails.minLength !== undefined &&
      //     attrDetails.maxLength !== undefined &&
      //     Number(attrDetails.minLength) > Number(attrDetails.maxLength)
      //   ) {
      //     error.maxLength = `Max length must be greater than or equal to Min length for "${attrDetails.name || ''}".`;
      //     isValid = false;
      //   }
      // }
      if ([4, 5, 6].includes(fieldType)) {
        if (!attrDetails.values || attrDetails.values.length === 0) {
          error.fieldValues = `Please provide at least one value for "${attrDetails.name || ''}" (${fieldTypeNames[fieldType]}).`;
          isValid = false;
        }
      }
    });

    setError({ ...error });

    if (!isValid) return;
    const attributes = Object.entries(selectedItems).map(([attrId, attr]) => ({
      _id: attrId,
      name: attr.name,
      values: attr.values.map(v => v.value),
      image: attr.image
    }));


    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("price", price);
    formData.append("mainImage", image);
    formData.append("sellerId", sellerType);
    for (let i = 0; i < images?.length; i++) {
      formData.append("images", images[i]);
    }
    formData.append("category", categoryType);
    formData.append("subCategory", subCategoryType);
    formData.append("description", description);
    formData.append("shippingCharges", shippingCharge);
    formData.append("productCode", productCode);
    formData.append("attributes", JSON.stringify(attributes));
    formData.append("removeImageIndexes", JSON.stringify(removedIndices));


    // formData append ke baad

    if (mongoId && state?.pathName === '/admin/addProduct') {
      props.updateProduct(formData, mongoId, sellerType, productCode);
       navigate(-1);
    } else if (mongoId && state?.pathName === '/admin/fake/addProduct') {
      dispatch(updateFakeProduct(formData, mongoId, sellerType, productCode));
      navigate(-1);
    } else {
      props.createFakeProduct(formData);
      navigate(-1);
    }
    setMongoId("");
    setProductName("");
    setPrice("");
    setImage([]);
    setImagePath("");
    setSellerType("");
    setCategoryType("");
    setSubCategoryType("");
    setDescription("");
    setShippingCharge("");
    setProductCode("");
    setImages([]);
    setAttrData([]);
    setError({});
  };

  return (
    <>
      <div className="mainSellerDialog">
        <div className="sellerDialog" >
          <div className="sellerHeader primeHeader">
            <div className="row">
              <div className="col-12">
                <div className="d-flex justify-content-end">
                  <button
                    onClick={() => navigate(-1)}
                    className="btn  rounded-pill px-4 mb-4"
                    style={{ border: "1px solid #b93160", marginLeft: "0px", backgroundColor: "#b93160", color: "white" }}
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div className="sellerMain" style={{ margin: "10px 30px" }}>
            <div className="card" style={{ borderRadius: "5px" }}>
              <div className="card-body" >
                <div className="sellerDetail pt-3">
                  <div className="row">
                    <div className="col-lg-4 col-md-6">
                      {state?.id?.seller?.firstName ? (
                        <Input
                          label={`Seller`}
                          id={`type`}
                          type={`text`}
                          value={
                            state?.id?.seller?.firstName +
                            " " +
                            state?.id?.seller?.lastName
                          }
                          disabled={true}
                        />
                      ) : (
                        <>
                          <label className="styleForTitle mb-2"
                            style={{
                              color: "#999AA4",
                              fontSize: "14px"
                            }}
                          >
                            Seller
                          </label>
                          <select
                            productName="type"
                            className="form-control form-control-line"
                            id="type"
                            value={sellerType}
                            disabled={state ? true : false}
                            onChange={(e) => {
                              setSellerType(e.target.value);
                              if (!e.target.value) {
                                return setError({
                                  ...error,
                                  sellerType: "SellerType is Required !",
                                });
                              } else {
                                return setError({
                                  ...error,
                                  sellerType: "",
                                });
                              }
                            }}
                          >
                            <option value="" disabled selected>
                              --select seller--
                            </option>
                            {fakeSeller?.map((data) => {
                              return (
                                <option value={data?._id} key={data?._id}>
                                  {data?.firstName + " " + data?.lastName}
                                </option>
                              );
                            })}
                          </select>
                        </>
                      )}

                      {error.sellerType && (
                        <div className="pl-1 text-left">
                          <p className="errorMessage">{error.sellerType}</p>
                        </div>
                      )}
                    </div>
                    <div className="col-lg-4 col-md-6">
                      <Input
                        label={`Product Name`}
                        id={`productName`}
                        type={`text`}
                        value={productName}
                        placeholder={`Enter ProductName`}
                        errorMessage={error.productName && error.productName}
                        onChange={(e) => {
                          setProductName(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              productName: `Product Name Is Required`,
                            });
                          } else {
                            return setError({
                              ...error,
                              productName: "",
                            });
                          }
                        }}
                      />
                    </div>

                    <div className="col-lg-4 col-md-6">
                      <label className="styleForTitle mb-1 textcolorInput">
                        Category Type
                      </label>
                      <select
                        name="type"
                        className="form-control form-control-line"
                        id="type"
                        value={categoryType}
                        onChange={(e) => {
                          setCategoryType(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              categoryType: "CategoryType is Required !",
                            });
                          } else {
                            setError({
                              ...error,
                              categoryType: "",
                            });
                            setSubCategoryType(""); // Reset the selected subcategory
                            props.getCategoryWiseSubCategory(e.target.value); // Fetch subcategories based on the selected category
                          }
                        }}
                      >
                        <option value="" disabled selected>
                          --select category--
                        </option>
                        {category.map((data) => {
                          return <option value={data._id}>{data.name}</option>;
                        })}
                      </select>
                      {error.categoryType && (
                        <div className="pl-1 text-left">
                          <p className="errorMessage">{error.categoryType}</p>
                        </div>
                      )}
                    </div>
                    <div className="col-lg-4 col-md-6">
                      <label className="styleForTitle mb-1 textcolorInput">
                        Sub Category
                      </label>
                      <select
                        name="type"
                        className="form-control form-control-line"
                        id="type"
                        value={subCategoryType}
                        onChange={(e) => {
                          setSubCategoryType(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              subCategoryType: "SubCategoryType is Required !",
                            });
                          } else {
                            setError({
                              ...error,
                              subCategoryType: "",
                            });
                          }
                        }}
                      >
                        <option value="" disabled selected>
                          --select subCategory--
                        </option>
                        {categoryWiseSubCategory?.map((data) => {
                          return (
                            <option
                              key={data?.subCategoryId}
                              value={data?.subCategoryId}
                            >
                              {data?.name}
                            </option>
                          );
                        })}
                      </select>
                      {error.subCategoryType && (
                        <div className="pl-1 text-left">
                          <p className="errorMessage">
                            {error.subCategoryType}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="col-lg-4 col-md-6">
                      <Input
                        label={`Price (${defaultCurrency?.symbol})`}
                        id={`price`}
                        type={`number`}
                        className={`color1`}
                        value={price}
                        placeholder={`Enter Price`}
                        errorMessage={error.price && error.price}
                        onChange={(e) => {
                          setPrice(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              price: `Price Is Required`,
                            });
                          } else {
                            return setError({
                              ...error,
                              price: "",
                            });
                          }
                        }}
                      />
                    </div>
                    <div className="col-lg-4 col-md-6">
                      <Input
                        label={`Shipping Charge (${defaultCurrency?.symbol})`}
                        id={`shippingCharges`}
                        type={`number`}
                        value={shippingCharge}
                        placeholder={`Enter ShippingCharge`}
                        errorMessage={error.shippingCharge && error.shippingCharge}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setShippingCharge(e.target.value);

                          if (!value && value !== 0) {
                            return setError({
                              ...error,
                              shippingCharge: `Shipping Charge is required`,
                            });
                          }

                          if (value >= parseFloat(price)) {
                            return setError({
                              ...error,
                              shippingCharge: `Shipping Charge must be less than Product Price`,
                            });
                          }

                          setError({
                            ...error,
                            shippingCharge: "",
                          });
                        }}
                      />
                    </div>

                    <div className="col-lg-4 col-md-6">
                      <Input
                        label={`Image`}
                        id={`image`}
                        type={`file`}
                        accept={`image/*`}
                        errorMessage={error.image && error.image}
                        onChange={(e) => handleImage(e)}
                      />
                      <p style={{ color: '#ff2e2e', marginTop: '6px' }}>
                        Please select an image file (JPG, JPEG, PNG, WebP).
                      </p>

                      {imagePath && (
                        <div className="image-start">
                          <img
                            src={imagePath}
                            alt="banner"
                            draggable="false"
                            width={100}
                            className="m-0"
                            onError={(e) => {
                              e.target.error = null;
                              e.target.src = defaultImage;
                            }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="col-lg-4 col-md-6">
                      <div class="row d-flex justify-content-between">
                        <div class={`${mongoId ? "col-12" : "col-md-10"}`}>
                          <Input
                            label={`Product Code (6 digit)`}
                            id={`productCode`}
                            type={`number`}
                            value={productCode}
                            readOnly
                            disabled={state ? true : false}
                            errorMessage={
                              error.productCode && error.productCode
                            }
                            onChange={(e) => {
                              setProductCode(e.target.value);
                              if (!e.target.value) {
                                return setError({
                                  ...error,
                                  productCode: `Product Code Is Required`,
                                });
                              } else {
                                return setError({
                                  ...error,
                                  productCode: "",
                                });
                              }
                            }}
                          />
                        </div>
                        {!mongoId && (
                          <div
                            className="col-md-2   d-flex justify-content-center align-items-center"
                            style={{ marginTop: "10px" }}
                          >
                            <button
                              type="button"
                              className="btn text-light"
                              style={{
                                borderRadius: 5,
                                fontSize: "14px",
                                padding: "5px",
                                color: "#fff",
                                backgroundColor: "#B93160",

                              }}
                              onClick={createCode}
                            >
                              Generate
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ---------------------------------------------------------------------------------------------------------------------------------------- */}

                  <div className="row my-4">
                    <div className="mb-3 text-white">
                      Attributes
                    </div>

                    {attrData && attrData?.length > 0 ? (
                      attrData.map((data, index) => (
                        <div key={data?._id || index} className="col-md-4 mb-4">
                          <div className="card h-100">
                            {/* Card Header */}
                            <div className="card-header d-flex justify-content-between align-items-center">
                              {data?.attributes[0]?.name || `Attribute ${index + 1}`}
                              <button
                                type="button"
                                onClick={() => handleRemove(data)}
                                className="btn btn-sm btn-danger"
                                title="Remove Attribute"
                              >
                                &times;
                              </button>
                            </div>

                            {/* Card Body */}
                            <div className="card-body d-flex">
                              <div className="flex-grow-1">
                                <div className="row gx-2 gy-3">
                                  {/* Attribute Name */}
                                  <div className="col-12">
                                    <label className="form-label">Name</label>
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={data?.attributes[0]?.name || ''}
                                      readOnly
                                    />
                                  </div>

                                  {data.attributes.map(attr => (
                                    <Multiselect
                                      key={attr._id}
                                      options={attr.values.map(val => ({
                                        label: val,
                                        value: val
                                      }))}
                                      selectedValues={selectedItems[attr._id]?.values || []}
                                      onSelect={(selected) => onSelect(attr, selected)}
                                      onRemove={(selected) => onRemove(attr, selected)}
                                      displayValue="label"
                                      className="custom-dropdown cursor-pointer"
                                    />
                                  ))}
                                  {/* {error.selectedItemsErrors &&
                                    error.selectedItemsErrors[data._id] &&
                                    error.selectedItemsErrors[data._id].trim() !== "" && (
                                      <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem' }}>
                                        {error.selectedItemsErrors[data._id]}
                                      </div>
                                    )} */}

                                  {error.selectedItems && (
                                    <div style={{ color: '#dc3545', fontSize: '0.875em', marginTop: '0.25rem' }}>
                                      {error.selectedItems}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-12">
                        <div className="alert alert-info">No Data</div>
                      </div>
                    )}
                  </div>

                  {/* --------------------------------------------------------------------------------------------------------------------------------------- */}

                  <div className="row">
                    <div className="col-12">
                      <label className="float-left styleForTitle"
                        style={{
                          color: "#999AA4"
                        }}
                      >
                        Description
                      </label>
                      <textarea
                        class="form-control"
                        placeholder="description..."
                        id="exampleFormControlTextarea1"
                        rows="5"
                        value={description}
                        onChange={(e) => {
                          setDescription(e.target.value);

                          if (!e.target.value) {
                            return setError({
                              ...error,
                              description: "Description is Required!",
                            });
                          } else {
                            return setError({
                              ...error,
                              description: "",
                            });
                          }
                        }}
                      ></textarea>

                      {error.description && (
                        <div className="ml-2 mt-1">
                          {error.description && (
                            <div className="pl-1 text__left">
                              <span className="errorMessage">
                                {error.description}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-xl-2 col-md-4 col-12 mt-2">
                      <label class="float-left dialog__input__title"
                        style={{
                          color: "#999AA4"
                        }}
                      >
                        Select (Multiple) Image
                      </label>

                      <>
                        <ReactDropzone
                          onDrop={(acceptedFiles) => onPreviewDrop(acceptedFiles)}
                          accept="image/*"
                        >
                          {({ getRootProps, getInputProps }) => (
                            <section className="mt-4">
                              <div {...getRootProps()}>
                                <input {...getInputProps()} />
                                <div
                                  style={{
                                    height: "130px",
                                    width: "130px",
                                    border: "2px dashed gray",
                                    textAlign: "center",
                                    marginTop: "10px",
                                  }}
                                >
                                  <i
                                    className="fa-solid fa-plus fa-2x"
                                    style={{
                                      paddingTop: "40px",
                                      fontSize: "50px",
                                      color: "#888",
                                    }}
                                  ></i>
                                </div>
                              </div>
                            </section>
                          )}
                        </ReactDropzone>

                      </>
                    </div>

                    <div className="col-xl-10 col-md-8 col-12 mt-5">
                      {images?.map((file, index) => {
                        return file?.type?.split("image")[0] === "" ? (
                          <div
                            key={index}
                            style={{ display: "inline-block", position: "relative", float: "left", marginRight: "15px", marginTop: "10px" }}
                          >
                            <img
                              height="100px"
                              width="100px"
                              alt="app"
                              src={file.preview}
                              style={{
                                boxShadow: "0 5px 15px 0 rgb(105 103 103 / 25%)",
                                borderRadius: "10px",
                                objectFit: "contain",
                              }}
                              draggable="false"
                            />
                            <CancelIcon
                              onClick={() => removeImage(file, index)}
                              sx={{
                                position: "absolute",
                                top: "-5px",
                                right: "-5px",
                                cursor: "pointer",
                                color: "red",
                                zIndex: 100,
                                fontSize: 20,
                                backgroundColor: "white",
                                borderRadius: "50%",
                              }}
                            />
                          </div>
                        ) : (
                          <div
                            key={index}
                            style={{ position: "relative", float: "left", marginRight: "15px", marginTop: "10px" }}
                          >
                            <img
                              height="100px"
                              width="100px"
                              alt="app"
                              src={file}
                              style={{
                                boxShadow: "0 5px 15px 0 rgb(105 103 103 / 25%)",
                                borderRadius: "10px",
                                objectFit: "contain",
                              }}
                              draggable="false"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = defaultImage;
                              }}
                            />
                            <CancelIcon
                              onClick={() => removeImage(file, index)}
                              sx={{
                                position: "absolute",
                                top: "-5px",
                                right: "-5px",
                                cursor: "pointer",
                                color: "red",
                                zIndex: 100,
                                fontSize: 20,
                                backgroundColor: "white",
                                borderRadius: "50%",
                              }}
                            />
                          </div>
                        );
                      })}
                    </div>

                  </div>
                  {error.images && (
                    <div className="ml-2 mt-1">
                      {error.images && (
                        <div className="pl-1 text__left">
                          <span className="errorMessage">{error.images}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="row">
                    <div className="col-12 d-flex justify-content-end">
                      <Button
                        btnName={`Close`}
                        btnColor="myCustomButton"
                        style={{ borderRadius: "5px", width: "80px" }}
                        onClick={() => {
                          navigate(-1);
                        }}
                      />
                      {!mongoId ? (
                        <>
                          <Button
                            btnName={`Submit`}
                            btnColor={`btnBlackPrime text-light ms-2`}
                            style={{ borderRadius: "5px", width: "80px" }}
                            onClick={(e) => handleSubmit(e)}
                          />
                        </>
                      ) : (
                        <>
                          <Button
                            btnName={`Update`}
                            btnColor={`btnBlackPrime text-light ms-2`}
                            style={{ borderRadius: "5px", width: "80px" }}
                            onClick={(e) => handleSubmit(e)}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="sellerFooter primeFooter"></div>
        </div>
      </div>

      {showModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Warning</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>{modalMessage}</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-primary" onClick={() => setShowModal(false)}>OK</button>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
};

export default connect(null, {
  createFakeProduct,
  updateProduct,
  sellerDropDown,
  getCategory,
  getCategoryWiseSubCategory,
  getAttribute,
})(AddProduct);
