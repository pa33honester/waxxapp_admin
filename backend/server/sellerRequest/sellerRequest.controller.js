const Request = require("./sellerRequest.model");

//fs
const fs = require("fs");

//import model
const User = require("../user/user.model");
const Seller = require("../seller/seller.model");
const Notification = require("../notification/notification.model");

//config
const config = require("../../config");

//deleteFile
const { deleteFile, deleteFiles } = require("../../util/deleteFile");

//private key
const admin = require("../../util/privateKey");

//email
const { sendTransactionalEmail, templates } = require("../../util/emailSender");

const getValidToken = (token) => {
  if (typeof token !== "string") return null;
  const trimmedToken = token.trim();
  return trimmedToken.length > 0 ? trimmedToken : null;
};

//create request by user
exports.storeRequest = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.mobileNumber) {
      deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "OOps ! Invalid details!" });
    }

    const user = await User.findById(req.body.userId);
    if (!user) {
      deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    const existRequest = await Request.findOne({ userId: user._id });

    if (existRequest?.mobileNumber === req?.body?.mobileNumber.toString()) {
      deleteFiles(req.files);
      return res.status(200).json({
        status: true,
        message: "A seller request has already been generated for the provided mobile number, You cannot create another seller request using the same number.",
      });
    }

    if (existRequest?.isAccepted === false) {
      deleteFiles(req.files);
      return res.status(200).json({
        status: true,
        message: "You have already sent seller request!",
      });
    }

    if (existRequest?.isAccepted === true) {
      deleteFiles(req.files);

      const [seller, isAccepted] = await Promise.all([Seller.findOne({ uniqueId: existRequest.uniqueId }), existRequest.isAccepted]);

      if (!seller) {
        deleteFiles(req.files);
        return res.status(200).json({
          status: false,
          message: "this user does not become the seller!",
        });
      }

      return res.status(200).json({
        status: false,
        message: "this user already become the Seller!",
        seller,
        isAccepted,
      });
    }

    const request = new Request();

    request.firstName = req.body.firstName ? req.body.firstName : user.firstName;
    request.lastName = req.body.lastName ? req.body.lastName : user.lastName;
    request.businessTag = req.body.businessTag ? req.body.businessTag : user.businessTag;
    request.businessName = req.body.businessName ? req.body.businessName : user.businessName;
    request.countryCode = req?.body?.countryCode;
    request.mobileNumber = req.body.mobileNumber;
    request.userId = user._id;
    request.email = user.email;
    request.password = user.password;
    request.uniqueId = user.uniqueId;
    request.image = user.image;
    request.gender = user.gender;
    request.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    request.fcmToken = user.fcmToken;

    request.storeName = req.body.storeName || null;
    request.businessType = req.body.businessType || null;
    request.category = req.body.category || null;
    request.description = req.body.description || null;

    if (req.files?.logo?.[0]) {
      request.logo = config.baseURL + req.files.logo[0].path.replace(/\\/g, "/");
    }

    if (req.files?.govId?.[0]) {
      request.govId = config.baseURL + req.files.govId[0].path.replace(/\\/g, "/");
    }

    if (req.files?.registrationCert?.[0]) {
      request.registrationCert = config.baseURL + req.files.registrationCert[0].path.replace(/\\/g, "/");
    }

    if (req.files?.addressProof?.[0]) {
      request.addressProof = config.baseURL + req.files.addressProof[0].path.replace(/\\/g, "/");
    }

    //seller's address fields
    request.address.address = req.body.address ? req.body.address : request.address.address;
    request.address.landMark = req.body.landMark ? req.body.landMark : request.address.landMark;
    request.address.city = req.body.city ? req.body.city : request.address.city;
    request.address.pinCode = parseInt(req.body.pinCode) ? parseInt(req.body.pinCode) : request.address.pinCode;
    request.address.state = req.body.state ? req.body.state : request.address.state;
    request.address.country = req.body.country ? req.body.country : request.address.country;

    //seller's mobile-money payout details
    request.bankDetails.bankBusinessName = req.body.bankBusinessName ? req.body.bankBusinessName : request.bankDetails.bankBusinessName;
    request.bankDetails.bankName = req.body.bankName ? req.body.bankName : request.bankDetails.bankName;
    request.bankDetails.momoNumber = req.body.momoNumber ? String(req.body.momoNumber) : request.bankDetails.momoNumber;
    request.bankDetails.networkName = req.body.networkName ? req.body.networkName : request.bankDetails.networkName;
    request.bankDetails.momoName = req.body.momoName ? req.body.momoName : request.bankDetails.momoName;

    const [saveRequest, isAccepted] = await Promise.all([request.save(), request?.isAccepted]);

    res.status(200).json({
      status: true,
      message: "Seller request sent successfully!",
      request: saveRequest,
      isAccepted: isAccepted,
    });

    if (user.fcmToken !== null) {
      const requestPayload = {
        token: user.fcmToken,
        notification: {
          title: "Seller Request Submitted",
          body: "Thanks for applying! Our team is reviewing your seller request. We will notify you once it is approved.",
        },
        data: {
          type: "SELLER_REQUEST_CREATED",
        },
      };

      try {
        const adminPromise = await admin;
        const response = await adminPromise.messaging().send(requestPayload);
        console.log("Successfully sent notification: ", response);
      } catch (error) {
        console.error("Error sending notification: ", error);
      }
    }
  } catch (error) {
    deleteFiles(req.files);
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//check seller become or not
exports.sellerBecomeOrNot = async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.status(200).json({ status: false, message: "OOps ! Invalid details!" });
    }

    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    const existRequest = await Request.findOne({ userId: user._id });

    if (existRequest?.isAccepted === false) {
      return res.status(200).json({
        status: true,
        message: "You have already sent seller request!",
      });
    }

    if (existRequest?.isAccepted === true) {
      const seller = await Seller.findOne({ uniqueId: existRequest.uniqueId });
      const isAccepted = await existRequest.isAccepted;

      if (!seller) {
        return res.status(200).json({
          status: false,
          message: "this user does not become the seller!",
        });
      }

      return res.status(200).json({
        status: false,
        message: "this user already become the Seller!",
        seller,
        isAccepted,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//update request by admin
exports.updateRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.query.requestId);
    if (!request) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "request does not found!!" });
    }

    if (req.file) {
      const image = request.image.split("storage");

      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }

        request.image = config.baseURL + req.file.path;
      }
    }

    request.firstName = req.body.firstName ? req.body.firstName : request.firstName;
    request.lastName = req.body.lastName ? req.body.lastName : request.lastName;
    request.gender = req.body.gender ? req.body.gender : request.gender;
    request.countryCode = req.body.countryCode ? req.body.countryCode : request.countryCode;
    request.mobileNumber = req.body.mobileNumber ? req.body.mobileNumber : request.mobileNumber;
    request.businessName = req.body.businessName ? req.body.businessName : request.businessName;
    request.businessTag = req.body.businessTag ? req.body.businessTag : request.businessTag;

    //Update the seller's address fields
    request.address.address = req.body.address ? req.body.address : request.address.address;
    request.address.landMark = req.body.landMark ? req.body.landMark : request.address.landMark;
    request.address.city = req.body.city ? req.body.city : request.address.city;
    request.address.pinCode = parseInt(req.body.pinCode) ? parseInt(req.body.pinCode) : request.address.pinCode;
    request.address.state = req.body.state ? req.body.state : request.address.state;
    request.address.country = req.body.country ? req.body.country : request.address.country;

    //Update the seller's mobile-money payout details
    request.bankDetails.bankBusinessName = req.body.bankBusinessName ? req.body.bankBusinessName : request.bankDetails.bankBusinessName;
    request.bankDetails.bankName = req.body.bankName ? req.body.bankName : request.bankDetails.bankName;
    request.bankDetails.momoNumber = req.body.momoNumber ? String(req.body.momoNumber) : request.bankDetails.momoNumber;
    request.bankDetails.networkName = req.body.networkName ? req.body.networkName : request.bankDetails.networkName;
    request.bankDetails.momoName = req.body.momoName ? req.body.momoName : request.bankDetails.momoName;

    await request.save();

    return res.status(200).json({
      status: true,
      message: "request updated by admin.",
      request: request,
    });
  } catch (error) {
    console.log(error);
    if (req.file) deleteFile(req.file);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//seller request accept or not by admin
exports.acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.query.requestId);
    if (!request) {
      return res.status(200).json({ status: false, message: "Seller request does not found!" });
    }

    if (request.isAccepted === true) {
      return res.status(200).json({ status: false, message: "Seller request already accepted by the admin!" });
    }

    const seller = new Seller();

    const user = await User.findById(request.userId);

    request.isAccepted = true;

    user.isSeller = true;
    user.seller = seller?._id;

    seller.firstName = request.firstName;
    seller.lastName = request.lastName;
    seller.businessName = request.businessName;
    seller.fcmToken = request.fcmToken;
    seller.businessTag = request.businessTag;
    seller.mobileNumber = request.mobileNumber;
    seller.image = request.image;
    seller.gender = request.gender;
    seller.email = request.email;
    seller.password = request.password;
    seller.fcmToken = request.fcmToken;
    seller.identity = user.identity;
    seller.uniqueId = user.uniqueId;
    seller.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    //seller's address fields
    seller.address.address = request.address.address;
    seller.address.landMark = request.address.landMark;
    seller.address.city = request.address.city;
    seller.address.pinCode = request.address.pinCode;
    seller.address.state = request.address.state;
    seller.address.country = request.address.country;

    //seller's mobile-money payout details (cloned from approved request)
    seller.bankDetails.bankBusinessName = request.bankDetails.bankBusinessName;
    seller.bankDetails.bankName = request.bankDetails.bankName;
    seller.bankDetails.momoNumber = request.bankDetails.momoNumber;
    seller.bankDetails.networkName = request.bankDetails.networkName;
    seller.bankDetails.momoName = request.bankDetails.momoName;

    seller.storeName = request?.storeName;
    seller.businessType = request?.businessType;
    seller.category = request?.category;
    seller.logo = request?.logo;
    seller.description = request?.description;
    seller.govId = request?.govId;
    seller.registrationCert = request?.registrationCert;
    seller.addressProof = request?.addressProof;

    seller.userId = user?._id;

    await Promise.all([request.save(), user.save(), seller.save()]);

    const notificationTitle = "Seller Verification Completed";
    const notificationBody = "Your seller profile is now verified. Start listing your products and grow your business today.";

    const notification = new Notification();
    notification.userId = user?._id || null;
    notification.sellerId = seller?._id || null;
    notification.title = notificationTitle;
    notification.message = notificationBody;
    notification.notificationType = 4;
    notification.image = user?.image || "";
    notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await notification.save();

    // Push — fallback to the original request's fcmToken if the user's own
    // has gone stale since applying.
    let pushStatus = "no_token";
    const userToken = getValidToken(user?.fcmToken) || getValidToken(request?.fcmToken);
    if (userToken) {
      try {
        const adminPromise = await admin;
        await adminPromise.messaging().send({
          token: userToken,
          notification: { title: notificationTitle, body: notificationBody },
          data: { type: "SELLER_VERIFICATION_APPROVED" },
        });
        pushStatus = "sent";
      } catch (error) {
        console.error("Error sending seller-approved push:", error);
        pushStatus = "failed";
      }
    }

    // Email — reliable fallback when push tokens are stale (common between
    // application and approval, since users often reinstall the app).
    let emailStatus = "no_email";
    const recipientEmail = (user?.email || request?.email || "").trim();
    if (recipientEmail) {
      const result = await sendTransactionalEmail({
        to: recipientEmail,
        subject: "You're a verified seller",
        html: templates.sellerApproved({ firstName: user?.firstName || request?.firstName }),
      });
      emailStatus = result.ok ? "sent" : result.reason || "failed";
    }

    return res.status(200).json({
      status: true,
      message: "Seller request accepted and become the seller!",
      request,
      deliveries: { push: pushStatus, email: emailStatus },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

// Admin rejects a seller request. Writes an in-app notification, fires a push,
// and sends an explanatory email. The request row is flagged rejected (not
// deleted) so the admin has an audit trail.
exports.rejectRequest = async (req, res) => {
  try {
    const requestId = req.query.requestId || req.body.requestId;
    const reason = (req.body.rejectionReason || "").trim();

    if (!requestId) {
      return res.status(200).json({ status: false, message: "requestId is required." });
    }

    const request = await Request.findById(requestId);
    if (!request) {
      return res.status(200).json({ status: false, message: "Seller request not found." });
    }

    if (request.isAccepted) {
      return res.status(200).json({ status: false, message: "This request was already approved — cannot reject." });
    }

    if (request.isRejected) {
      return res.status(200).json({ status: false, message: "This request was already rejected." });
    }

    request.isRejected = true;
    request.rejectionReason = reason || null;
    await request.save();

    const user = request.userId ? await User.findById(request.userId) : null;

    const title = "Seller Application Rejected";
    const body = reason
      ? `Your seller application was rejected. Reason: ${reason}`
      : "Your seller application was rejected. You can update your details and reapply.";

    const notification = new Notification();
    notification.userId = user?._id || request.userId || null;
    notification.title = title;
    notification.message = body;
    notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await notification.save();

    let pushStatus = "no_token";
    const userToken = getValidToken(user?.fcmToken) || getValidToken(request?.fcmToken);
    if (userToken) {
      try {
        const adminPromise = await admin;
        await adminPromise.messaging().send({
          token: userToken,
          notification: { title, body },
          data: { type: "SELLER_VERIFICATION_REJECTED", reason: reason || "" },
        });
        pushStatus = "sent";
      } catch (error) {
        console.error("Error sending seller-rejected push:", error);
        pushStatus = "failed";
      }
    }

    let emailStatus = "no_email";
    const recipientEmail = (user?.email || request?.email || "").trim();
    if (recipientEmail) {
      const result = await sendTransactionalEmail({
        to: recipientEmail,
        subject: "Your seller application wasn't approved",
        html: templates.sellerRejected({ firstName: user?.firstName || request?.firstName, reason }),
      });
      emailStatus = result.ok ? "sent" : result.reason || "failed";
    }

    return res.status(200).json({
      status: true,
      message: "Seller request rejected.",
      request,
      deliveries: { push: pushStatus, email: emailStatus },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get the all request for admin
exports.getRequest = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const [totalrequest, request] = await Promise.all([
      Request.find({ isAccepted: false, isRejected: { $ne: true } }).countDocuments(),
      Request.find({ isAccepted: false, isRejected: { $ne: true } })
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit),
    ]);

    return res.status(200).json({
      status: true,
      message: "Requests get successfully.",
      totalrequest,
      request,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Sever Error",
    });
  }
};
