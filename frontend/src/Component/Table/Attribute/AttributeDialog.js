import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Grid,
  // Switch,
  FormControlLabel,
  Typography,
  Box,
  Divider,
  CircularProgress,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Switch from "@mui/material/Switch";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useDispatch, useSelector } from "react-redux";
import {
  createAttribute,
  getAllSubcategory,
  updateAttribute,
} from "../../store/attribute/attribute.action";
import { CLOSE_DIALOGUE } from "../../store/dialogue/dialogue.type";
import { baseURL } from "../../../util/config";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { getCategory } from "../../store/category/category.action";
import { getCategoryWiseSubCategory } from "../../store/subCategory/subCategory.action";
import HandleButton from "../../extra/Button";

const CustomSwitch = styled(Switch)(({ theme }) => ({
  width: 46,
  height: 26,
  padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 2,
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(20px)",
      "& + .MuiSwitch-track": {
        backgroundColor: "#b93160",
        opacity: 1,
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: "#fff",
    width: 18,
    height: 18,
    boxShadow: "none",
  },
  "& .MuiSwitch-track": {
    backgroundColor: "#cccccc",
    borderRadius: 26 / 2,
    opacity: 1,
    transition: theme.transitions.create(["background-color"], {
      duration: 500,
    }),
  },
}));

const customStyles = {
  control: (base) => ({
    ...base,
    borderRadius: 8,
    minHeight: 48,
  }),
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


const AttributeDialog = () => {
  const dialogueDataFromStore = useSelector(
    (state) => state.dialogue.dialogueData
  );

  // For temporary testing override
  const dialogueData = dialogueDataFromStore ?? true; // fallback to true if undefined

  const { subcategory } = useSelector((state) => state.attribute);

  const { category } = useSelector((state) => state.category);
  const { categoryWiseSubCategory } = useSelector((state) => state.subCategory);
  const dispatch = useDispatch();


  const [selectedcategoryOptions, setSelectedCategoryOptions] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [mongoId, setMongoId] = useState("");
  const [name, setName] = useState("");
  const [fieldType, setFieldType] = useState("");
  const [fieldValues, setFieldValues] = useState([]);
  const [icon, setIcon] = useState(null);
  const [isRequired, setIsRequired] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [preview, setPreview] = useState("");

  const [error, setError] = useState({
    category: "",
    subcategories: "",
    name: "",
    fieldType: "",
    fieldValues: "",
    icon: "",
  });

  useEffect(() => {
    if (!dialogueData) return;

    setSelectedCategoryOptions(
      dialogueData?.subCategory?.category
        ? {
          value: dialogueData.subCategory?.category._id,
          label: dialogueData.subCategory?.category.name,
        }
        : ""
    );
    setSelectedOptions(
      dialogueData?.subCategory
        ? [
          {
            value: dialogueData.subCategory._id,
            label: dialogueData.subCategory.name,
          },
        ]
        : []
    );
    const attr = dialogueData?.attributes?.[0];
    setMongoId(attr?._id || "");
    setName(attr?.name || "");
    setFieldType(attr?.fieldType?.toString() || "");
    if (["4", "5", "6"].includes(attr?.fieldType?.toString())) {
      setFieldValues(attr?.values?.map((v) => ({ value: v, label: v })) || []);
    } else {
      setFieldValues([]);
    }
    setIcon(attr?.image ? baseURL + attr.image : null);
    setPreview(attr?.image ? baseURL + attr.image : "");
    setIsRequired(attr?.isRequired || false);
    setIsActive(attr?.isActive || false);
  }, [dialogueData]);

  const categoryOptions = category.map((item) => ({
    value: item._id,
    label: item.name,
  }));


  const options = categoryWiseSubCategory.map((item) => ({
    value: item.subCategoryId,
    label: item.name,
  }));

  // const handleChangeCategory = (selected) => {
  //   console.log("selected", selected);
  //    setSelectedCategoryOptions(selected);
  //   if (error.category) {
  //     setError((prev) => ({ ...prev, category: "" }));
  //   }
  // }

  const handleChangeCategory = (selected) => {
    setSelectedCategoryOptions(selected);
    setSelectedOptions([]); // Clear subcategories selection when category changes
    if (error.category) {
      setError((prev) => ({ ...prev, category: "" }));
    }
  }


  const handleChange = (selected) => {
    setSelectedOptions(selected);
    if (error.subcategories) {
      setError((prev) => ({ ...prev, subcategories: "" }));
    }
  };

  useEffect(() => {
    dispatch(getCategory());
    // dispatch(getAllSubcategory());
  }, [dispatch]);

  useEffect(() => {
    if (selectedcategoryOptions !== "") {
      dispatch(getCategoryWiseSubCategory(selectedcategoryOptions?.value));
    }
  }, [dispatch, selectedcategoryOptions]);

  const validateForm = () => {
    let newErrors = {
      category: "",
      subcategories: "",
      name: "",
      fieldType: "",
      fieldValues: "",
      icon: "",
    };
    let isValid = true;
    if (!selectedcategoryOptions || selectedcategoryOptions.length === 0) {
      newErrors.category = "Please select at least one category.";
      isValid = false;
    }
    if (!selectedOptions || selectedOptions.length === 0) {
      newErrors.subcategories = "Please select at least one subcategory.";
      isValid = false;
    }
    if (!name || !name.trim()) {
      newErrors.name = "Field name is required.";
      isValid = false;
    }
    if (!fieldType) {
      newErrors.fieldType = "Please select a field type.";
      isValid = false;
    }
    if (["4", "5", "6"].includes(fieldType)) {
      if (!fieldValues || fieldValues.length === 0) {
        newErrors.fieldValues = "Please provide at least one field value.";
        isValid = false;
      }
    }
    if (!icon) {
      newErrors.icon = "Please upload an icon image.";
      isValid = false;
    }
    setError(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    const isChoiceType = ["4", "5", "6"].includes(fieldType);
    const formData = new FormData();
    if (mongoId) {
      formData.append("attributeId", mongoId);
    } else {
      console.error("Error: mongoId is not set");
    }
    formData.append("name", name.trim());
    formData.append("fieldType", Number(fieldType));
    formData.append("isRequired", isRequired);
    formData.append("isActive", isActive);
    if (isChoiceType) {
      fieldValues.forEach((v) => {
        formData.append("values", v.value);
      });
    }
    if (!mongoId && selectedOptions.length > 0) {
      selectedOptions.forEach((item) => {
        formData.append("subCategoryIds[]", item.value);
      });
    }
    if (icon && typeof icon !== "string") {
      formData.append("image", icon);
    }
    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }
    if (mongoId) {
      dispatch(updateAttribute(formData));
    } else {
      dispatch(createAttribute(formData));
    }
    dispatch({ type: CLOSE_DIALOGUE });
  };

  useEffect(() => {
    return () => {
      if (
        preview &&
        typeof preview === "string" &&
        preview.startsWith("blob:")
      ) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <Dialog
      open={Boolean(dialogueData)}
      onClose={() => dispatch({ type: CLOSE_DIALOGUE })}
      maxWidth="sm"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: "18px",
          width: "600px",
          maxWidth: "100vw",
          padding: "6px 5px",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h5" component="span">
          {mongoId ? "Edit Attribute" : "Create Attribute"}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>


            {/* category */}

            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Select Category
              </Typography>
              <Select
                options={categoryOptions}
                value={selectedcategoryOptions}
                onChange={handleChangeCategory}
                placeholder="Select Category..."
                isDisabled={Boolean(mongoId)} // Disable when editing
                styles={customStyles}
              />
              {error.category && (
                <Typography variant="caption" color="error">
                  {error.category}
                </Typography>
              )}
            </Grid>



            {/* category */}

            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 0.5 }}>
                Select Subcategories
              </Typography>
              {/* <Select
                isMulti
                options={options}
                value={selectedOptions}
                onChange={handleChange}
                placeholder="Select subcategories..."
                styles={{
                  control: (base) => ({
                    ...base,
                    borderRadius: 8,
                    minHeight: 48,
                  }),
                }}
              /> */}

              <Select
                isMulti
                options={options}
                value={selectedOptions}
                onChange={handleChange}
                placeholder="Select subcategories..."
                isDisabled={Boolean(mongoId)} // Disable when editing
                styles={{
                  menu: (base) => ({
                    ...base,
                    backgroundColor: '#fff',
                    zIndex: 100,
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: '#b93160',
                    borderRadius: 20,
                    padding: '0 6px 0 12px',
                    display: 'flex',
                    alignItems: 'center',
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '1rem',
                    padding: '2px 8px 2px 0',
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    backgroundColor: '#fff',
                    color: '#b93160',
                    borderRadius: '50%',
                    minWidth: 22,
                    minHeight: 22,
                    width: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginLeft: 5,
                    boxShadow: '0 1px 4px rgba(185,49,96,0.09)',
                    border: 'none',
                    fontSize: 18,
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.1s',
                  }),
                  control: (base) => ({
                    ...base,
                    borderRadius: 8,
                    minHeight: 48,
                  }),
                  option: (provided, state) => ({
                    ...provided,
                    backgroundColor: state.isFocused ? '#ffccde' : 'white',
                    color: state.isSelected ? 'white' : 'black',
                    background: state.isSelected ? '#b93160' : undefined,
                    cursor: 'pointer',
                  }),
                }}

              />



              {error.subcategories && (
                <Typography variant="caption" color="error">
                  {error.subcategories}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Field Name"
                value={name}
                fullWidth
                onChange={(e) => {
                  setName(e.target.value);
                  if (error.name) setError((prev) => ({ ...prev, name: "" }));
                }}
                error={Boolean(error.name)}
                helperText={error.name}
                sx={{
                  borderRadius: 1,
                  // Root for input style
                  '& .MuiOutlinedInput-root': {
                    // Border color (default)
                    '& .MuiOutlinedInput-notchedOutline': {
                      // borderColor: "#b93160",
                    },
                    // Border color (hover)
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: "#b93160",
                    },
                    // Border color (focused)
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: "#b93160",
                    },
                  },
                  // Label color (default & focused)
                  '& .MuiInputLabel-outlined': {
                    // color: "#b93160",
                  },
                  '& .MuiInputLabel-outlined.Mui-focused': {
                    color: "#b93160",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                label="Field Type"
                value={fieldType}
                fullWidth
                onChange={(e) => {
                  setFieldType(e.target.value);
                  if (error.fieldType)
                    setError((prev) => ({ ...prev, fieldType: "" }));
                }}
                error={Boolean(error.fieldType)}
                helperText={error.fieldType}
                sx={{
                  borderRadius: 1,
                  // Root for input style
                  '& .MuiOutlinedInput-root': {
                    // Border color (default)
                    '& .MuiOutlinedInput-notchedOutline': {
                      // borderColor: "#b93160",
                    },
                    // Border color (hover)
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: "#b93160",
                    },
                    // Border color (focused)
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: "#b93160",
                    },
                  },
                  // Label color (default & focused)
                  '& .MuiInputLabel-outlined': {
                    // color: "#b93160",
                  },
                  '& .MuiInputLabel-outlined.Mui-focused': {
                    color: "#b93160",
                  },
                }}
              >
                <MenuItem value="5">Dropdown</MenuItem>
                <MenuItem value="6">Checkboxes</MenuItem>
              </TextField>
            </Grid>
            {["4", "5", "6"].includes(fieldType) && (
              <Grid item xs={12}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Field Values
                </Typography>
                {/* <CreatableSelect
                  isMulti
                  value={fieldValues}
                  onChange={(newValue) => {
                    setFieldValues(newValue);
                    if (error.fieldValues)
                      setError((prev) => ({ ...prev, fieldValues: "" }));
                  }}
                  placeholder="Type and press enter..."
                  styles={{
                    control: (base) => ({
                      ...base,
                      borderRadius: 8,
                      minHeight: 48,
                    }),
                  }}
                /> */}
                <CreatableSelect
                  isMulti
                  value={fieldValues}
                  onChange={setFieldValues}
                  placeholder="Type and press enter..."
                  styles={{
                    multiValue: (base) => ({
                      ...base,
                      backgroundColor: '#b93160',
                      borderRadius: 20,
                      padding: '0 6px 0 12px',
                      display: 'flex',
                      alignItems: 'center'
                    }),
                    multiValueLabel: (base) => ({
                      ...base,
                      color: '#fff',
                      fontWeight: 700,
                      fontSize: '1rem',
                      padding: '2px 8px 2px 0',
                    }),
                    multiValueRemove: (base) => ({
                      ...base,
                      backgroundColor: '#fff',
                      color: '#b93160',                 // cross visible always
                      borderRadius: '50%',
                      minWidth: 22,
                      minHeight: 22,
                      width: 22,
                      height: 22,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginLeft: 5,
                      boxShadow: '0 1px 4px rgba(185,49,96,0.09)',
                      border: 'none',
                      fontSize: 18,
                      cursor: 'pointer',
                      padding: 0,
                      transition: 'all 0.1s',
                      ':hover': {
                        // backgroundColor: '#b93160',
                        // color: '#fff',             // reverse color on hover
                      },
                    }),
                  }}
                />

                {error.fieldValues && (
                  <Typography variant="caption" color="error">
                    {error.fieldValues}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  This will be applied only for: <strong>Checkboxes</strong> and{" "}
                  <strong>Dropdown</strong>.
                </Typography>
              </Grid>
            )}
            <Grid item xs={12}>
              <Divider />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom>
                Attribute Icon
              </Typography>
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: 1,
                  border: "1px dashed",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  position: "relative",
                  mb: 1,
                  mt: 1,
                }}
              >
                {preview ? (
                  <>
                    <img
                      src={preview}
                      alt="Attribute Icon"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        background: "rgba(0,0,0,0.5)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        opacity: 0,
                        transition: "opacity 0.2s",
                        cursor: "pointer",
                        "&:hover": { opacity: 1 },
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="white"
                        align="center"
                      >
                        Click to change
                      </Typography>
                    </Box>
                  </>
                ) : (
                  <PhotoCameraIcon color="action" />
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: 0,
                    cursor: "pointer",
                  }}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setIcon(file);
                      const objectUrl = URL.createObjectURL(file);
                      setPreview(objectUrl);
                    }
                    if (error.icon) setError((prev) => ({ ...prev, icon: "" }));
                  }}
                />
              </Box>
              <Button
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                component="label"
                size="small"
                sx={{ width: "fit-content", mb: 2 }}
              >
                {preview ? "Change Icon" : "Upload Icon"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setIcon(file);
                      const objectUrl = URL.createObjectURL(file);
                      setPreview(objectUrl);
                    }
                    if (error.icon) setError((prev) => ({ ...prev, icon: "" }));
                  }}
                />
              </Button>
              <Typography
                variant="body2"
                color="text.secondary"
                className="mt-2"
              >
                Recommended size: 256x256 pixels. Maximum file size: 2MB.
                <br />
                Formats: JPG, PNG, GIF
              </Typography>
              {error.icon && (
                <Typography variant="caption" color="error" display="block">
                  {error.icon}
                </Typography>
              )}
            </Grid>
            <Grid item xs={12} sx={{ display: "flex", gap: 2 }}>
              <FormControlLabel
                control={
                  <CustomSwitch
                    checked={isRequired}
                    onChange={() => setIsRequired(!isRequired)}
                  />
                }
                label="Required"
              />
              <FormControlLabel
                control={
                  <CustomSwitch
                    checked={isActive}
                    onChange={() => setIsActive(!isActive)}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
            {/* <Button
              variant="outlined"
              onClick={() => dispatch({ type: CLOSE_DIALOGUE })}
            >
              Cancel
            </Button> */}
            <HandleButton
              btnName="Cancel"
              btnColor="myCustomButton"
              style={{ borderRadius: "5px", width: "80px" }}
              onClick={() => dispatch({ type: CLOSE_DIALOGUE })}
            />
            {/* <Button type="submit" variant="contained" >
              {mongoId ? "Update" : "Submit"}
            </Button> */}
            <HandleButton
              btnName={mongoId ? "Update" : "Submit"}
              btnColor="btnBlackPrime text-light"
              style={{ borderRadius: "5px", width: "80px" }}
              newClass="me-2"
              onClick={handleSubmit}
            />
          </Box>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AttributeDialog;
