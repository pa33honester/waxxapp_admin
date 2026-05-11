import { useState } from "react";
import { connect } from "react-redux";

import Button from "../../extra/Button";
import { sendAllNotification } from "../../store/notification/notification.action";

const BroadcastNotification = (props) => {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("User");
  const [imagePath, setImagePath] = useState();
  const [image, setImage] = useState(null);
  const [error, setError] = useState({});

  const handleImage = (e) => {
    setError((prev) => ({ ...prev, image: "" }));
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
      setImagePath(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSubmit = () => {
    const next = {};
    if (!title.trim()) next.title = "Title is required";
    if (!message.trim()) next.message = "Message is required";
    if (!type) next.type = "Audience is required";
    if (Object.keys(next).length > 0) {
      setError(next);
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("message", message.trim());
    if (image) formData.append("image", image);

    props.sendAllNotification(formData, type);

    // Reset the form so the admin sees the empty form after a send.
    setTitle("");
    setMessage("");
    setImage(null);
    setImagePath(undefined);
    setError({});
  };

  return (
    <div className="mainSellerTable">
      <div className="sellerTable">
        <div className="col-12 headname">Broadcast Notification</div>
        <div className="sellerMain">
          <div
            className="tableMain mt-2 p-4"
            style={{ maxWidth: "720px" }}
          >
            <p className="text-secondary" style={{ fontSize: "13px" }}>
              Send a push notification + in-app message to every user (or every
              seller) at once. Use sparingly — broadcasts go to thousands of
              devices.
            </p>

            {/* Audience */}
            <div className="form-group mt-3">
              <h6 className="fs-6" style={{ color: "#999AA4" }}>
                Audience
              </h6>
              <select
                className="form-input px-2 py-2"
                value={type}
                onChange={(e) => {
                  setError((p) => ({ ...p, type: "" }));
                  setType(e.target.value);
                }}
                style={{
                  width: "100%",
                  backgroundColor: "#0e0e0e",
                  color: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #333",
                  padding: "10px",
                }}
              >
                <option value="User">All Buyers (Users)</option>
                <option value="Seller">All Sellers</option>
              </select>
              {error.type && (
                <small style={{ color: "#dc3545" }}>{error.type}</small>
              )}
            </div>

            {/* Title */}
            <div className="form-group mt-3">
              <h6 className="fs-6" style={{ color: "#999AA4" }}>
                Title
              </h6>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setError((p) => ({ ...p, title: "" }));
                  setTitle(e.target.value);
                }}
                placeholder="e.g. Black Friday — 50% off!"
                style={{
                  width: "100%",
                  backgroundColor: "#0e0e0e",
                  color: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #333",
                  padding: "10px",
                }}
              />
              {error.title && (
                <small style={{ color: "#dc3545" }}>{error.title}</small>
              )}
            </div>

            {/* Message */}
            <div className="form-group mt-3">
              <h6 className="fs-6" style={{ color: "#999AA4" }}>
                Message
              </h6>
              <textarea
                value={message}
                onChange={(e) => {
                  setError((p) => ({ ...p, message: "" }));
                  setMessage(e.target.value);
                }}
                placeholder="Body of the push notification"
                rows={5}
                style={{
                  width: "100%",
                  backgroundColor: "#0e0e0e",
                  color: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #333",
                  padding: "10px",
                  resize: "vertical",
                }}
              />
              {error.message && (
                <small style={{ color: "#dc3545" }}>{error.message}</small>
              )}
            </div>

            {/* Image (optional) */}
            <div className="form-group mt-3">
              <h6 className="fs-6" style={{ color: "#999AA4" }}>
                Image (optional)
              </h6>
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                style={{ color: "#fff" }}
              />
              {imagePath && (
                <div className="mt-2">
                  <img
                    src={imagePath}
                    alt="preview"
                    style={{ maxHeight: "120px", borderRadius: "8px" }}
                  />
                </div>
              )}
            </div>

            {/* Send */}
            <div className="mt-4">
              <Button
                newClass="text-white fw-normal"
                btnName="Send Broadcast"
                style={{
                  borderRadius: "8px",
                  backgroundColor: "#1D9BF0",
                  padding: "10px 24px",
                  fontSize: "14px",
                }}
                onClick={handleSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default connect(null, { sendAllNotification })(BroadcastNotification);
