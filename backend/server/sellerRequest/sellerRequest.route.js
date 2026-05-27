//express
const express = require("express");
const route = express.Router();

//multer
const multer = require("multer");
const storage = require("../../util/multer");
const { fileFilter, kycAwareStorage } = require("../../util/multer");

// Default upload writes everything to public storage/. Used for
// admin-side `image` swap (admin.middleware-gated; no biometric
// content) on PATCH /update.
const upload = multer({
  storage,
  fileFilter,
});

// Mixed upload that routes KYC fields (govId, addressProof,
// registrationCert) to private_storage/ while leaving public fields
// (logo) on storage/. Used on POST /create.
const mixedUpload = multer({
  storage: kycAwareStorage,
  fileFilter,
});

const checkAccessWithSecretKey = require("../../util/checkAccess");

//controller
const sellerRequestController = require("./sellerRequest.controller");

//create request by user
route.post(
  "/create",
  checkAccessWithSecretKey(),
  mixedUpload.fields([
    { name: "logo", maxCount: 5 },
    { name: "govIdFront", maxCount: 1 },
    { name: "govIdBack", maxCount: 1 },
    { name: "registrationCert", maxCount: 5 },
    { name: "addressProof", maxCount: 5 },
  ]),
  sellerRequestController.storeRequest
);

//check seller become or not
route.post("/sellerBecomeOrNot", checkAccessWithSecretKey(), sellerRequestController.sellerBecomeOrNot);

//update request by admin
route.patch("/update", checkAccessWithSecretKey(), upload.single("image"), sellerRequestController.updateRequest);

//seller request accept or not by admin
route.patch("/acceptOrNot", checkAccessWithSecretKey(), sellerRequestController.acceptRequest);

//seller request reject by admin
route.patch("/reject", checkAccessWithSecretKey(), sellerRequestController.rejectRequest);

//get the all request for admin panel
route.get("/", checkAccessWithSecretKey(), sellerRequestController.getRequest);

module.exports = route;
