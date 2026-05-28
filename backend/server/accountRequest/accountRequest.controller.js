const AccountRequest = require("./accountRequest.model");
const User = require("../user/user.model");

//config
const config = require("../../config");

//Cryptr — same key/scheme used for User passwords (see server/user/user.controller.js)
const Cryptr = require("cryptr");
const cryptr = new Cryptr("myTotallySecretKey");

//email sender
const { sendTransactionalEmail, templates } = require("../../util/emailSender");

// Generate a 9-digit uniqueId not already taken by a User. Mirrors the
// helper in server/user/user.controller.js so an approved account gets the
// same kind of id a normal sign-up would.
const generateUniqueId = async () => {
  const random = () => Math.floor(Math.random() * (999999999 - 100000000)) + 100000000;
  let uniqueId = random();
  let user = await User.findOne({ uniqueId: uniqueId });
  while (user) {
    uniqueId = random();
    user = await User.findOne({ uniqueId: uniqueId });
  }
  return uniqueId;
};

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;

// strip the password before sending a request back to the admin panel
const sanitize = (doc) => {
  if (!doc) return doc;
  const obj = doc.toObject ? doc.toObject() : { ...doc };
  delete obj.password;
  return obj;
};

//create — called by the in-app sign-up assistant chatbot
exports.store = async (req, res) => {
  try {
    const firstName = (req.body.firstName || "").trim();
    const lastName = (req.body.lastName || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const identity = (req.body.identity || "").trim();
    const mobileNumber = (req.body.mobileNumber || "").trim() || null;
    const countryCode = (req.body.countryCode || "").trim() || null;

    if (!firstName || !email || !password) {
      return res.status(200).json({ status: false, message: "First name, email and password are required." });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(200).json({ status: false, message: "Please enter a valid email address." });
    }
    if (password.length < 8) {
      return res.status(200).json({ status: false, message: "Password must be at least 8 characters." });
    }

    // already a real account?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(200).json({ status: false, message: "An account with this email already exists. Please log in instead." });
    }

    // already a pending request for this email?
    const existingPending = await AccountRequest.findOne({ email, status: "pending" });
    if (existingPending) {
      return res.status(200).json({ status: false, message: "We've already received a request for this email — our team will get back to you soon." });
    }

    // light per-device rate-limit: max 3 pending requests per identity per day
    if (identity) {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentCount = await AccountRequest.countDocuments({ identity, status: "pending", createdAt: { $gte: since } });
      if (recentCount >= 3) {
        return res.status(200).json({ status: false, message: "Too many requests from this device. Please try again later." });
      }
    }

    const request = new AccountRequest();
    request.firstName = firstName;
    request.lastName = lastName;
    request.email = email;
    request.mobileNumber = mobileNumber;
    request.countryCode = countryCode;
    request.password = cryptr.encrypt(password);
    request.identity = identity || null;
    request.source = (req.body.source || "signup_assistant").toString().trim() || "signup_assistant";
    await request.save();

    return res.status(200).json({
      status: true,
      message: "Request submitted — our team will review it and set up your account.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get — admin list
exports.getAll = async (req, res) => {
  try {
    const query = {};
    if (req.query.status && ["pending", "approved", "rejected"].includes(req.query.status)) {
      query.status = req.query.status;
    }

    const accountRequests = await AccountRequest.find(query).select("-password").sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "data get Successfully!", accountRequests });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//approve — admin accepts the request and the real account is created
exports.approve = async (req, res) => {
  try {
    if (!req.query.requestId) {
      return res.status(200).json({ status: false, message: "requestId must be required." });
    }

    const request = await AccountRequest.findById(req.query.requestId);
    if (!request) {
      return res.status(200).json({ status: false, message: "Account request not found." });
    }
    if (request.status !== "pending") {
      return res.status(200).json({ status: false, message: `This request has already been ${request.status}.` });
    }

    // re-check the email is still free (a real sign-up may have happened in the meantime)
    const existingUser = await User.findOne({ email: request.email });
    if (existingUser) {
      request.status = "rejected";
      request.rejectReason = "An account with this email already exists.";
      request.reviewedAt = new Date();
      await request.save();
      return res.status(200).json({ status: false, message: "An account with this email already exists — request marked rejected." });
    }

    // Build the user directly — do NOT route through userFunction(), which would
    // re-encrypt the already-encrypted password and break login.
    const user = new User();
    user.firstName = request.firstName || "";
    user.lastName = request.lastName || "";
    user.email = request.email;
    user.mobileNumber = request.mobileNumber || null;
    user.countryCode = request.countryCode || null;
    user.loginType = 3; // email + password
    user.password = request.password; // already Cryptr-encrypted
    user.identity = request.identity || null;
    user.uniqueId = await generateUniqueId();
    user.image = `${config.baseURL}storage/erashopUser.png`;
    user.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await user.save();

    request.status = "approved";
    request.createdUser = user._id;
    request.reviewedAt = new Date();
    await request.save();

    // welcome email — never throws (see emailSender.js)
    let emailStatus = "skipped";
    if (request.email) {
      const result = await sendTransactionalEmail({
        to: request.email,
        subject: `Your ${config.projectName || "J4market"} account is ready`,
        html: templates.accountApproved({ firstName: user.firstName, email: user.email }),
      });
      emailStatus = result.ok ? "sent" : result.reason || "failed";
    }

    const safeUser = user.toObject();
    delete safeUser.password;

    return res.status(200).json({
      status: true,
      message: "Account created.",
      user: safeUser,
      request: sanitize(request),
      email: emailStatus,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//reject — admin declines the request
exports.reject = async (req, res) => {
  try {
    if (!req.query.requestId) {
      return res.status(200).json({ status: false, message: "requestId must be required." });
    }

    const request = await AccountRequest.findById(req.query.requestId);
    if (!request) {
      return res.status(200).json({ status: false, message: "Account request not found." });
    }
    if (request.status !== "pending") {
      return res.status(200).json({ status: false, message: `This request has already been ${request.status}.` });
    }

    request.status = "rejected";
    request.rejectReason = (req.body.rejectReason || "").trim() || null;
    request.reviewedAt = new Date();
    await request.save();

    let emailStatus = "skipped";
    if (request.email) {
      const result = await sendTransactionalEmail({
        to: request.email,
        subject: `About your ${config.projectName || "J4market"} account request`,
        html: templates.accountRejected({ firstName: request.firstName, reason: request.rejectReason }),
      });
      emailStatus = result.ok ? "sent" : result.reason || "failed";
    }

    return res.status(200).json({ status: true, message: "Request rejected.", request: sanitize(request), email: emailStatus });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete
exports.destroy = async (req, res) => {
  try {
    if (!req.query.requestId) {
      return res.status(200).json({ status: false, message: "requestId must be required." });
    }

    const request = await AccountRequest.findById(req.query.requestId);
    if (!request) {
      return res.status(200).json({ status: false, message: "Account request not found." });
    }

    await request.deleteOne();

    return res.status(200).json({ status: true, message: "delete Successfully!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
