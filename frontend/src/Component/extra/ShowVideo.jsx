import { Box, Modal } from "@mui/material";
import Button from "./Button";

function ShowVideo({ show, url, handleClose, title }) {
  return (
    <div>
      <Modal
        open={show}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box className=" model-style">
          <div className="model-header">
            <p className="m-0">{title}</p>
          </div>
          <div className="model-body">
            <video
              autoPlay
              controls
              className="w-100"
              height={450}
              style={{ borderRadius: "5px" }}
              src={url}
            />
          </div>
          <div className="model-footer">
            <div className="m-3 d-flex justify-content-end">
              <Button
                onClick={handleClose}
                btnName={"Close"}
                newClass={"close-model-btn me-3"}
              />
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
export default ShowVideo;
