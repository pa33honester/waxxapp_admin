import React, { useEffect, useState } from "react";
import Button from "../../extra/Button";
import { CLOSE_DIALOGUE } from "../../store/dialogue/dialogue.type";
import Input from "../../extra/Input";
import { connect, useDispatch, useSelector } from "react-redux";
import { getCategory } from "../../store/category/category.action";
import {
  createSubCategory,
  updateSubCategory,
} from "../../store/subCategory/subCategory.action";

const SubCategoryDialoge = (props) => {
  const { dialogueData, extraData } = useSelector((state) => state.dialogue);
  const { category } = useSelector((state) => state.category);
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(getCategory());
  }, [dispatch]);

  const [mongoId, setMongoId] = useState(0);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [categoryType, setCategoryType] = useState(extraData);
  const [error, setError] = useState({
    name: "",
    image: "",
    categoryType: "",
  });


  useEffect(() => {
    setMongoId(dialogueData?.subCategoryId);
    setName(dialogueData?.name);
    setImagePath(dialogueData?.image);

    if (mongoId) {
      setCategoryType(dialogueData?.categoryId);
    } else {
      setCategoryType(extraData);
    }
  }, [dialogueData, extraData]);

  const handleImage = (e) => {
    setImage(e.target.files[0]);
    setImagePath(URL.createObjectURL(e.target.files[0]));
    setError((prevErrors) => ({
      ...prevErrors,
      image: "",
    }));
  };
  const handleSubmit = (e) => {
    if (!name || !(image || imagePath)) {
      let error = {};
      if (!name) error.name = "Name is Required !";
      
      if (!image?.length === 0 || !imagePath)
        error.image = "Image is required!";
      
    
      return setError({ ...error });
    } else {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", image);
      formData.append("category", categoryType ? categoryType : "");

      if (dialogueData) {
        
        const id = dialogueData?._id ? dialogueData?._id : dialogueData?.subCategoryId
        props.updateSubCategory(formData, id);
      } else {
      
        props.createSubCategory(formData, extraData);
      }
      dispatch({ type: CLOSE_DIALOGUE });
    }
  };
  return (
    <div className="mainDialogue fade-in">
      <div className="Dialogue">
        <div className="dialogueHeader">
          <div className="headerTitle fw-bold text-white">Sub Category</div>
          <div
            className="closeBtn "
            onClick={() => {
              dispatch({ type: CLOSE_DIALOGUE });
            }}
          >
            <i class="fa-solid fa-xmark"></i>
          </div>
        </div>
        <div className="dialogueMain">
          <div className="row">
            <div className="col-12">
              <label className="styleForTitle mb-2" 
              style={{
                color : "#b93160"
              }}>Category</label>

              <select
                name="type"
                className="form-control form-control-line catSelect text-dark"
                id="type"
                value={categoryType}
                disabled
                onChange={(e) => {
                  setCategoryType(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      categoryType: "CategoryType is Required !",
                    });
                  } else {
                    return setError({
                      ...error,
                      categoryType: "",
                    });
                  }
                }}
              >
              
                {category.map((data) => (
                  <option
                    value={data._id}
                    key={data?._id}
                    selected={data?._id === categoryType}
                    readOnly // Check if the current option's value matches the default category ID
                  >
                    <span >
                    {data?.name}
                      </span>           
                  </option>
                ))}
              </select>
            
            </div>
          </div>
          <div className="row">
            <div className="col-12 mt-2">
              <Input
                label={`Name`}
                id={`name`}
                type={`text`}
                value={name}
                placeholder={`Enter Name`}
                errorMessage={error.name && error.name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      name: `Name Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      name: "",
                    });
                  }
                }}
              />
            </div>
            <div className="col-12">
              <Input
                label={`Image`}
                id={`image`}
                type={`file`}
                accept={`image/*`}
                onChange={(e) => handleImage(e)}
                errorMessage={error.image && error.image}
              />
              {imagePath && (
                <div className="image-start">
                  <img
                    src={imagePath}
                    alt="banner"
                    draggable="false"
                    width={100}
                    className="m-0"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="dialogueFooter">
          <div className="dialogueBtn">
            <Button
              btnName={`Submit`}
              btnColor={`btnBlackPrime text-light`}
              style={{ borderRadius: "5px", width: "80px" }}
              newClass={`me-2`}
              onClick={handleSubmit}
            />
            <Button
              btnName={`Close`}
              btnColor="myCustomButton"
              style={{ borderRadius: "5px", width: "80px" }}
              onClick={() => {
                dispatch({ type: CLOSE_DIALOGUE });
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(null, {
  getCategory,
  createSubCategory,
  updateSubCategory,
})(SubCategoryDialoge);
