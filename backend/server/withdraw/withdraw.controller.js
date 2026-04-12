const Withdraw = require("./withdraw.model");

//deleteFile
const { deleteFile } = require("../../util/deleteFile");

//fs
const fs = require("fs");

//config
const config = require("../../config");

//store Withdraw
exports.store = async (req, res) => {
  try {
    if (!req.file || !req.body.name || !req.body.details) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const withdraw = new Withdraw();

    withdraw.name = req.body.name;
    withdraw.details = req.body.details;
    withdraw.image = config.baseURL + req.file.path;
    await withdraw.save();

    return res.status(200).json({
      status: true,
      message: "withdraw method create successfully.",
      withdraw,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update Withdraw
exports.update = async (req, res) => {
  try {
    if (!req.query.withdrawId) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Oops !! Invalid details!!" });
    }

    const withdraw = await Withdraw.findById(req.query.withdrawId);
    if (!withdraw) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "withdraw does not found!!" });
    }

    if (req.file) {
      const image = withdraw?.image?.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }

      withdraw.image = config.baseURL + req.file.path;
    }

    withdraw.name = req.body.name ? req.body.name : withdraw.name;
    withdraw.details = req.body.details ? req.body.details : withdraw.details;
    await withdraw.save();

    return res.status(200).json({
      status: true,
      message: "withdraw method update successfully.",
      withdraw,
    });
  } catch (error) {
    console.log(error);
    if (req.file) deleteFile(req.file);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete Withdraw
exports.delete = async (req, res) => {
  try {
    if (!req.query.withdrawId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid Details!!" });
    }

    const withdraw = await Withdraw.findById(req.query.withdrawId);
    if (!withdraw) {
      return res.status(200).json({ status: false, message: "withdraw does not found!!" });
    }

    const image = withdraw?.image?.split("storage");
    if (image) {
      if (fs.existsSync("storage" + image[1])) {
        fs.unlinkSync("storage" + image[1]);
      }
    }

    await withdraw.deleteOne();

    return res.status(200).json({ status: true, message: "data deleted successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get Withdraw
exports.index = async (req, res) => {
  try {
    const withdraw = await Withdraw.find().sort({ createdAt: -1 });

    return res.status(200).json({ status: true, message: "data get successfully", withdraw });
  } catch (error) {
    console.log(error);
    deleteFile(req.file);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//handle isEnabled switch
exports.handleSwitch = async (req, res) => {
  try {
    if (!req.query.withdrawId) return res.status(200).json({ status: false, message: "Oops ! Invalid details." });

    const withdraw = await Withdraw.findById(req.query.withdrawId);
    if (!withdraw) {
      return res.status(200).json({ status: false, message: "Withdraw does not found." });
    }

    withdraw.isEnabled = !withdraw.isEnabled;
    await withdraw.save();

    return res.status(200).json({ status: true, message: "Success", withdraw });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!!",
    });
  }
};

//get withdraw list added by admin
exports.withdrawalList = async (req, res) => {
  try {
    const withdraw = await Withdraw.find({ isEnabled: true }).sort({ createdAt: -1 }).lean();

    return res.status(200).json({ status: true, message: "finally, get withdrawal list added by admin!", withdraw });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
