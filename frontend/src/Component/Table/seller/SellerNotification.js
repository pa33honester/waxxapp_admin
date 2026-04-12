import { React, useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import Input from "../../extra/Input";
import Button from "../../extra/Button";
import { CLOSE_DIALOGUE } from "../../store/dialogue/dialogue.type";
import { SendSellerNotification } from "../../store/notification/notification.action";

const SellerNotification = (props) => {
  const { dialogueData } = useSelector((state) => state.dialogue);
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [description, setDescription] = useState("");
  const [sellerId, setSellerId] = useState("");
  const [imagePath, setImagePath] = useState();
  const [image, setImage] = useState([]);
  const [error, setError] = useState({
    title: "",
    description: "",
    image: "",
  });

  const handleImage = (e) => {
    setError((prevErrors) => ({
      ...prevErrors,
      image: "",
    }));
    setImage(e.target.files[0]);
    setImagePath(URL.createObjectURL(e.target.files[0]));
  };
  useEffect(() => {
    setSellerId(dialogueData?._id);
  });

  useEffect(
    () => () => {
      setTitle("");
      setMessage("");
      setImagePath("");
      setDescription("");

      setImage([]);
      setError({
        title: "",
        description: "",
        image: "",
      });
    },
    []
  );

  const handleSubmit = () => {
    if (!title || !message ) {
      let error = {};
      if (!title) error.title = "Title Is Required!";
      if (!message) error.message = "Message Is Required!";
     

      return setError({ ...error });
    } else {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("message", message);
      formData.append("image", image);

      props.SendSellerNotification(formData, sellerId);
      console.log("sellerId", sellerId);
      dispatch({ type: CLOSE_DIALOGUE });
    }
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
          className="mx-4"
          style={{ overflow: "auto" }}
        >
          <div className="">
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
                      message: `message Is Required`,
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

export default connect(null, { SendSellerNotification })(SellerNotification);
