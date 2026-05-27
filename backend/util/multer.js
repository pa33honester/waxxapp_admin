const multer = require("multer");

//fs
const fs = require("fs");

const storage = multer.diskStorage({
  filename: (req, file, callback) => {
    const filename = Date.now() + Math.floor(Math.random() * 100) + file.originalname;
    callback(null, filename);
  },

  destination: (req, file, callback) => {
    if (!fs.existsSync("storage")) {
      fs.mkdirSync("storage");
    }

    callback(null, "storage");
  },
});

// File filter to accept only image files
const fileFilter = (req, file, callback) => {
  // Allowed image MIME types
  const allowedMimes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg"];

  if (allowedMimes.includes(file.mimetype)) {
    callback(null, true);
  } else {
    callback(new Error(`Invalid file type: ${file.mimetype}. Only image files are allowed.`), false);
  }
};

// Private storage for biometric / KYC uploads (selfie verification +
// future-migrated govId / addressProof / registrationCert). Files
// land under `private_storage/` which is NOT served by the static
// /storage middleware — they're only accessible via the auth-gated
// /private-file/:filename controller.
const privateStorage = multer.diskStorage({
  filename: (req, file, callback) => {
    const filename = Date.now() + Math.floor(Math.random() * 100) + file.originalname;
    callback(null, filename);
  },

  destination: (req, file, callback) => {
    if (!fs.existsSync("private_storage")) {
      fs.mkdirSync("private_storage");
    }

    callback(null, "private_storage");
  },
});

// Field names whose uploads are biometric / KYC and must go to
// private_storage/ + be accessed via the auth-gated /private-file
// route. Keep this list in sync with privateFile.controller.js's
// ownership lookup and any new KYC field added to a model.
const KYC_FIELDNAMES = new Set([
  "selfie",
  "govId",
  "govIdFront",
  "govIdBack",
  "addressProof",
  "registrationCert",
]);

// Routes uploads by fieldname: KYC fields go to private_storage/,
// everything else to storage/. Lets a single multer().fields([...])
// call handle a request with mixed public + private uploads (e.g.
// the seller-request endpoint takes a public `logo` PLUS private
// `govId` / `addressProof` / `registrationCert`).
const kycAwareStorage = multer.diskStorage({
  filename: (req, file, callback) => {
    const filename = Date.now() + Math.floor(Math.random() * 100) + file.originalname;
    callback(null, filename);
  },

  destination: (req, file, callback) => {
    const dest = KYC_FIELDNAMES.has(file.fieldname) ? "private_storage" : "storage";
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    callback(null, dest);
  },
});

// Build the URL we persist on a Mongoose doc for a given uploaded
// file. KYC fields get the auth-gated `/private-file/<filename>`
// route; everything else keeps the legacy `<baseURL>/storage/<path>`
// shape that the existing static handler serves.
//
// Pass a `baseURL` (typically `config.baseURL`) so this helper is
// safe to import in places where pulling config in would create a
// cycle.
const fileUrlFor = (file, baseURL) => {
  if (!file) return null;
  if (KYC_FIELDNAMES.has(file.fieldname)) {
    return baseURL + "private-file/" + file.filename;
  }
  return baseURL + file.path.replace(/\\/g, "/");
};

// Export storage as default for backward compatibility, and fileFilter as named export
module.exports = storage;
module.exports.fileFilter = fileFilter;
module.exports.storage = storage;
module.exports.privateStorage = privateStorage;
module.exports.kycAwareStorage = kycAwareStorage;
module.exports.KYC_FIELDNAMES = KYC_FIELDNAMES;
module.exports.fileUrlFor = fileUrlFor;
