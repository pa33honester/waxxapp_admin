const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const config = require("../../config");
const Verification = require("../verification/verification.model");
const Seller = require("../seller/seller.model");
const SellerRequest = require("../sellerRequest/sellerRequest.model");

// Auth-gated GET for private KYC / biometric files. Three accepted
// callers:
//   1. Admin (Authorization header carrying admin JWT — same shape as
//      admin.middleware.js).
//   2. Owner (query: userId=<id>). The userId must own a doc that
//      references this filename (Verification.selfieFile, Seller.govId
//      / addressProof / registrationCert, SellerRequest equivalents).
//   3. Anything else → 401.
//
// All callers must also send the standard `key=secretKey` header — the
// outer route already enforces that via checkAccessWithSecretKey, so
// we don't repeat the check here.
exports.serve = async (req, res) => {
  try {
    const { filename } = req.params;
    if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return res.status(400).json({ status: false, message: "Invalid filename" });
    }

    const filePath = path.join(__dirname, "..", "..", "private_storage", filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ status: false, message: "File not found" });
    }

    // Try admin path first.
    const Authorization = req.get("Authorization") || req.get("authorization");
    if (Authorization) {
      try {
        const token = Authorization.startsWith("Bearer ") ? Authorization.split(" ")[1] : Authorization;
        const decoded = jwt.verify(token, config.JWT_SECRET);
        if (decoded && decoded._id) {
          // Valid admin JWT. Stream.
          return res.sendFile(filePath);
        }
      } catch (e) {
        // Fall through to owner check.
      }
    }

    // Owner path.
    const userId = req.query.userId || req.body.userId;
    if (!userId) {
      return res.status(401).json({ status: false, message: "Unauthorized" });
    }

    // Look the filename up against any doc that legitimately
    // references it. The path stored in the doc may be a full URL
    // (legacy) or just `/private-file/<filename>` — we only need the
    // filename to match.
    const matches = (value) => {
      if (!value || typeof value !== "string") return false;
      return value.includes(filename);
    };

    const owns = await Promise.any([
      Verification.findOne({ userId, selfieFile: { $regex: filename } }).lean().then((d) => (d ? true : Promise.reject())),
      Seller.findOne({
        userId,
        $or: [
          { govId: { $regex: filename } },
          { addressProof: { $regex: filename } },
          { registrationCert: { $regex: filename } },
        ],
      }).lean().then((d) => (d ? true : Promise.reject())),
      SellerRequest.findOne({
        userId,
        $or: [
          { govId: { $regex: filename } },
          { addressProof: { $regex: filename } },
          { registrationCert: { $regex: filename } },
        ],
      }).lean().then((d) => (d ? true : Promise.reject())),
    ]).catch(() => false);

    if (!owns) {
      return res.status(403).json({ status: false, message: "Forbidden" });
    }

    return res.sendFile(filePath);
  } catch (error) {
    console.error("privateFile.serve error:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
