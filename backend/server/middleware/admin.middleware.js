//JWT Token
const jwt = require("jsonwebtoken");

//Config
const config = require("../../config");

//import model
const Admin = require("../admin/admin.model");

module.exports = async (req, res, next) => {
  try {
    const Authorization = req.get("Authorization") || req.get("authorization");
    if (!Authorization) {
      return res.status(403).json({ status: false, message: "Oops ! You are not Authorized!" });
    }

    // Accept header formats: "Bearer <token>" or the raw token
    const token = Authorization.startsWith("Bearer ") ? Authorization.split(" ")[1] : Authorization;

    const decodeToken = jwt.verify(token, config.JWT_SECRET);

    const admin = await Admin.findById(decodeToken._id);
    req.admin = admin;
    next();
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
