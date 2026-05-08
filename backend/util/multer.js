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

// Export storage as default for backward compatibility, and fileFilter as named export
module.exports = storage;
module.exports.fileFilter = fileFilter;
module.exports.storage = storage;
module.exports.privateStorage = privateStorage;
