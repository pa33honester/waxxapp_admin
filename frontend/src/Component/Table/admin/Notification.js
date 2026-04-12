import { React, useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import Input from "../../extra/Input";
import Button from "../../extra/Button";
import { CLOSE_DIALOGUE } from "../../store/dialogue/dialogue.type";
import { sendAllNotification } from "../../store/notification/notification.action";
const Notification = (props) => {

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const [imagePath, setImagePath] = useState();
  const [image, setImage] = useState([]);
  const [error, setError] = useState({
    title: "",
    description: "",
    type: "",
  });

  useEffect(
    () => () => {
      setTitle("");
      setImagePath("");
      setMessage("");
      setType("");
      setImage([]);
      setError({
        title: "",
        message: "",
        image: "",
        type: "",
      });
    },
    []
  );

  const handleSubmit = () => {
    if (!title || !message  || !type) {
      let error = {};
      if (!title) error.title = "Title Is Required!";
      if (!message) error.message = "Message Is Required!";
      
      if (!type || type === "selectType")
        error.type = "NotificationType Is Required!";

      return setError({ ...error });
    } else {

      const formData = new FormData();
      formData.append("title", title);
      formData.append("message", message);
      formData.append("image", image);

      props.sendAllNotification(formData, type);
      dispatch({ type: CLOSE_DIALOGUE });
    }
  };

  const dispatch = useDispatch();

  const handleImage = (e) => {
    setError((prevErrors) => ({
      ...prevErrors,
      image: "",
    }));
    setImage(e.target.files[0]);
    setImagePath(URL.createObjectURL(e.target.files[0]));
  };
  const showImg = (url) => {
    window.open(url, "_blank");
  };

  return (
    <div className="mainDialogue fade-in">
      <div className="Dialogue">
        <div className="dialogueHeader">
          <div className="headerTitle fw-bold">Notification</div>
          <div
            className="closeBtn "
            onClick={() => {
              dispatch({ type: CLOSE_DIALOGUE });
            }}
          >
            <i className="fa-solid fa-xmark"></i>
          </div>
        </div>
        <div
          className="dialogueMain mx-4"
          style={{ overflow: "auto" }}
        >
          <div className="form-group">
            <h6 className="fs-6"
              style={{
                color: "#999AA4"
              }}
            >Notification Type</h6>
            <select
              className=" form-input px-2 py-2"
              aria-label="Default select example"
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                if (e.target.value === "selectType") {
                  return setError({
                    ...error,
                    type: "Please select Type!",
                  });
                } else {
                  return setError({
                    ...error,
                    type: "",
                  });
                }
              }}
            >
              <option value="selectType">Select Type</option>
              <option value="Seller">Seller</option>
              <option value="User">User</option>
              <option value="Both">All</option>
            </select>
            {error.type && (
              <div className="ml-2 mt-1">
                {error.type && <p className="errorMessage">{error.type}</p>}
              </div>
            )}
          </div>
          <div className="mt-2">
            <div>
              <Input
                label={`Title`}
                id={`name`}
                type={`text`}
                value={title}
                errorMessage={error.title && error.title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      title: `Title Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      title: "",
                    });
                  }
                }}
              />
            </div>
            <div>
              <Input
                label={`Description`}
                id={`name`}
                type={`text`}
                value={message}
                errorMessage={error.message && error.message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (!e.target.value) {
                    return setError({
                      ...error,
                      message: `Message Is Required`,
                    });
                  } else {
                    return setError({
                      ...error,
                      message: "",
                    });
                  }
                }}
              />
            </div>

            <div className="mt-2">
              <Input
                label={`Image (Optional)`}
                id={`image`}
                type={`file`}
                accept={`image/*`}
                onChange={(e) => handleImage(e)}
              />
              {error.image && (
                <div className="ml-2 mt-1">
                  {error.type && <p className="errorMessage">{error.image}</p>}
                </div>
              )}
              {imagePath && (
                <div className="image-start">
                  <img
                    src={imagePath}
                    alt="banner"
                    draggable="false"
                    width={80}
                    height={80}
                    className="m-0 cursor rounded p-1"
                    onClick={() => showImg(imagePath)}
                    style={{
                      boxShadow: " 0px 5px 10px 0px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                </div>
              )}
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
    </div>
  );
};

export default connect(null, { sendAllNotification })(Notification);
