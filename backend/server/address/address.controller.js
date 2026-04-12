const Address = require("./address.model");

//import model
const User = require("../user/user.model");

//mongoose
const mongoose = require("mongoose");

//store address for user
exports.store = async (req, res) => {
  try {
    if (!req.body.userId) {
      return res.status(200).json({ status: false, message: "userId must be requried." });
    }

    const user = await User.findOne({ _id: req.body.userId });
    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!req.body.name) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const address = new Address();

    address.userId = user._id;
    address.name = req.body.name;
    address.country = req.body.country || address.country;
    address.state = req.body.state || address.state;
    address.city = req.body.city || address.city;
    address.zipCode = parseInt(req.body.zipCode) || address.zipCode;
    address.address = req.body.address.trim() || address.address;
    await address.save();

    return res.status(200).json({
      status: true,
      message: "Address created by the user.",
      address,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//update address for user
exports.update = async (req, res) => {
  try {
    if (!req.query.addressId) {
      return res.status(200).json({ status: false, message: "addressId must be requried." });
    }

    if (!req.body.userId) {
      return res.status(200).json({ status: false, message: "userId must be requried." });
    }

    const [user, address] = await Promise.all([
      User.findOne({ _id: req.body.userId }),
      Address.findOne({ _id: req.query.addressId, userId: req.body.userId }).populate("userId", "firstName lastName"),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!address)
      return res.status(200).json({
        status: false,
        message: "Address does not found for that user.",
      });

    address.userId = req.body.userId ? user._id : address.userId;
    address.name = req.body.name ? req.body.name : address.name;
    address.country = req.body.country ? req.body.country : address.country;
    address.state = req.body.state ? req.body.state : address.state;
    address.city = req.body.city ? req.body.city : address.city;
    address.zipCode = req.body.zipCode ? parseInt(req.body.zipCode) : address.zipCode;
    address.address = req.body.address.trim() ? req.body.address.trim() : address.address;

    await address.save();

    return res.status(200).json({
      status: true,
      message: "Address has been updated by the user.",
      address,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get all address for users
exports.getAllAddress = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be required." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, address] = await Promise.all([User.findOne({ _id: userId }), Address.find({ userId: userId }).populate("userId", "firstName lastName").sort({ createdAt: -1 })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    return res.status(200).json({
      status: address.length > 0 ? true : false,
      message: "Retrive addresses for this user.",
      address: address.length > 0 ? address : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//the address is selected true
exports.selectedOrNot = async (req, res) => {
  try {
    if (!req.query.addressId || !req.query.userId) {
      return res.status(200).json({ status: false, massage: "addressId and userId must be required." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const addressId = new mongoose.Types.ObjectId(req.query.addressId);

    await Address.updateMany({ userId: userId }, { $set: { isSelect: false } }, { new: true });

    const [user, address] = await Promise.all([User.findOne({ _id: userId }), Address.findByIdAndUpdate(addressId, { isSelect: true }, { new: true }).populate("userId", "firstName lastName")]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!address) {
      return res.status(200).json({ status: false, message: "Address does not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Success",
      address,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get all isSelect address for users
exports.getSelectedAddress = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "userId must be requried." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, address] = await Promise.all([User.findOne({ _id: userId }), Address.findOne({ userId: userId, isSelect: true }).populate("userId", "firstName lastName").sort({ createdAt: -1 })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!address) {
      return res.status(200).json({ status: false, message: "Address does not found for this user." });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive address selected for this user.",
      address,
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//delete address by user
exports.destroy = async (req, res) => {
  try {
    if (!req.query.addressId || !req.query.userId) {
      return res.status(200).json({ status: false, massage: "addressId and userId must be requried." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const addressId = new mongoose.Types.ObjectId(req.query.addressId);

    const [user, address] = await Promise.all([User.findOne({ _id: userId }), Address.findOne({ _id: addressId, userId: userId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by admin!" });
    }

    if (!address) {
      return res.status(200).json({ status: false, message: "Address does not found for that user." });
    }

    await address.deleteOne();

    return res.status(200).json({ status: true, message: "Address deleted Successfully." });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};
