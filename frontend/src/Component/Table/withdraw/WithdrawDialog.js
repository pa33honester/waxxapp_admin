import React, { useEffect, useState } from "react";
import Button from "../../extra/Button";
import Input from "../../extra/Input";
import { CLOSE_DIALOGUE } from "../../store/dialogue/dialogue.type";
import { connect, useDispatch, useSelector } from "react-redux";
import {
  createWithdraw,
  updateWithdraw,
} from "../../store/withdraw/withdraw.action";

const WithdrawDialog = (props) => {
  const { dialogueData } = useSelector((state) => state.dialogue);
  const [mongoId, setMongoId] = useState("");
  const [name, setName] = useState();
  const [image, setImage] = useState([]);
  const [imagePath, setImagePath] = useState("");

  const [detail, setDetail] = useState("");
  const [addDetail, setAddDetail] = useState([]);

  const [error, setError] = useState({
    name: "",
    imagePath: "",
    addDetail: "",
  });

  useEffect(() => {
    setMongoId(dialogueData?._id);
    setName(dialogueData?.name);
    setImagePath(dialogueData?.image);
    setAddDetail(dialogueData?.details);
  }, [dialogueData]);
  const dispatch = useDispatch();

  const handleImage = (e) => {
    setImage(e.target.files[0]);
    setImagePath(URL.createObjectURL(e.target.files[0]));
    setError((prevErrors) => ({
      ...prevErrors,
      image: "",
    }));
  };
  const addCountryList = (e) => {
    e.preventDefault();
    setAddDetail((old) => {
      if (!Array.isArray(old)) {
        old = [];
      }
      return [...old, detail];
    });
    setDetail("");
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addCountryList(event);
    }
  };

  const onRemove = (id) => {
    setAddDetail((old) => {
      if (!Array.isArray(old)) {
        old = [];
      }
      return old.filter((array, index) => {
        return index !== id;
      });
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name || !image || addDetail?.length === 0) {
      let error = {};
      if (!name) error.name = "Name is required!";
      if (addDetail?.length === 0) error.addDetail = "Details are required!";

      setError({ ...error });
    } else {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("image", image);
      for (let i = 0; i < addDetail?.length; i++) {
        formData.append("details", addDetail[i]);
      }

    if (mongoId) {
        props.updateWithdraw(formData, mongoId);
      } else {
        props.createWithdraw(formData);
      }
      dispatch({ type: CLOSE_DIALOGUE });
    }
  };

  return (
    <div className="mainDialogue fade-in">
      <div className="Dialogue">
        <div className="dialogueHeader">
          <div className="headerTitle fw-bold">Withdraw</div>
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
                type={`text`}
                value={name}
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
          </div>
          <div className="row">
            <div className="col-12 w-100">
              <div>
                <div className="form-group mb-2">
                </div>
                <div className="d-flex align-items-center">
                  <Input
                    type={`text`}
                    label={`Enter Detail`}
                    value={detail}
                    newClass={detail ? "col-11" : "col-12"}
                    placeholder={`Enter detail`}
                    onChange={(e) => {
                      setDetail(e.target.value);
                    }}
                    onKeyPress={handleKeyPress}
                  />
                  {detail !== "" && (
                    <div
                      className=" px-3 py-2 d-flex align-items-center justify-content-center"
                      style={{
                        
                        borderRadius: "5px",
                        cursor: "pointer",
                        backgroundColor: "#b93160",
                        color: "#fff",
                      }}
                      onClick={addCountryList}
                    >
                      <span>ADD</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="form-group mb-2">
              </div>
              <div className="mb-2">
                <div className="displayCountry">
                  {addDetail?.map((item, id) => {
                    return (
                      <>
                        <span
                          className="mx-1"
                          style={{
                            backgroundColor: " rgb(218, 216, 216)",
                            padding: "5px",
                            color: " #000",
                            borderRadius: "5px",
                            padding : "7px"
                          }}
                        >
                          {item}
                          <i
                            class="fa-regular fa-circle-xmark ms-2 my-2"
                            style={{cursor: "pointer",background : "rgb(218, 216, 216)"}}
                            onClick={() => {
                              onRemove(id);
                            }}
                          ></i>
                        </span>
                      </>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
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

export default connect(null, { createWithdraw, updateWithdraw })(
  WithdrawDialog
);
