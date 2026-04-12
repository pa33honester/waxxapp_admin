import React, { useEffect, useState } from "react";
import Button from "../../extra/Button";
import { CLOSE_DIALOGUE } from "../../store/dialogue/dialogue.type";
import Input from "../../extra/Input";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  createCategory,
  updateCategory,
} from "../../store/category/category.action";

const CategoryDialog = (props) => {
  const { dialogueData } = useSelector((state) => state.dialogue);
  const [mongoId, setMongoId] = useState(0);
  const [name, setName] = useState("");
  const [image, setImage] = useState(null);
  const [imagePath, setImagePath] = useState("");
  const [error, setError] = useState({
    name: "",
    image: "",
  });
  const dispatch = useDispatch();

  console.log("dialogueData::::", dialogueData);

  useEffect(() => {
    setMongoId(dialogueData?._id);
    setName(dialogueData?.name);
    setImagePath(dialogueData?.image);
  }, [dialogueData]);

  const handleImage = (e) => {
    setError((prevErrors) => ({
      ...prevErrors,
      image: "",
    }));
    setImage(e.target.files[0]);
    setImagePath(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = () => {
  
    if (!name || !imagePath) {
      let error = {};
      if (!name) error.name = "Name is Required !";
      if (!imagePath) error.image = "Image is required!";

      return setError({ ...error });
    } else {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", image);

      if (mongoId) {
        dispatch(updateCategory(formData, mongoId));
      } else {
        dispatch(createCategory(formData));
      }
      dispatch({ type: CLOSE_DIALOGUE });
    }
  };
  return (
    <div className="mainDialogue fade-in">
      <div className="Dialogue">
        <div className="dialogueHeader">
          <div className="headerTitle fw-bold text-white">Category</div>
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
              <Input
                label={`Name`}
                id={`name`}
                newClass={`text-capitalize`}
                type={`text`}
                value={name}
                placeholder={`Enter name`}
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
                errorMessage={error.image && error.image}
                onChange={(e) => handleImage(e)}
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
            {!mongoId ? (
              <>
                <Button
                  btnName={`Submit`}
                  btnColor={`btnBlackPrime text-light`}
                  style={{ borderRadius: "5px", width: "80px" }}
                  newClass={`me-2`}
                  onClick={handleSubmit}
                />
              </>
            ) : (
              <>
                <Button
                  btnName={`Update`}
                  btnColor={`btnBlackPrime text-light`}
                  style={{ borderRadius: "5px", width: "80px" }}
                  newClass={`me-2`}
                  onClick={handleSubmit}
                />
              </>
            )}
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

export default connect(null, { createCategory, updateCategory })(
  CategoryDialog
);
