const fs = require("fs");

exports.deleteFile = (file) => {
  if (file && fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }
};

exports.deleteFiles = (files) => {
  if (!files || typeof files !== "object") return;

  Object.keys(files).forEach((key) => {
    const value = files[key];

    if (Array.isArray(value)) {
      value.forEach((file) => exports.deleteFile(file));
    } else {
      exports.deleteFile(value);
    }
  });
};
