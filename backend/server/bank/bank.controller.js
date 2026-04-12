const Bank = require("../bank/bank.model");

exports.store = async (req, res) => {
  try {
    if (!req.body.name.trim()) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const bank = new Bank();
    bank.name = req.body.name.trim();
    await bank.save();

    return res.status(200).json({ status: true, message: "Bank has been Created by the admin.", bank: bank });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

exports.update = async (req, res) => {
  try {
    if (!req.query.bankId) {
      return res.status(200).json({ status: false, message: "bank Id is required!" });
    }

    const bank = await Bank.findById(req.query.bankId);
    if (!bank) {
      return res.status(200).json({ status: false, message: "bank does not found!" });
    }

    bank.name = req.body.name.trim() ? req.body.name.trim() : bank.name.trim();
    await bank.save();

    return res.status(200).json({ status: true, message: "Bank has been Updated by the admin.", bank: bank });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.delete = async (req, res) => {
  try {
    if (!req.query.bankId) {
      return res.status(200).json({ status: false, message: "bank Id is required!" });
    }

    const bank = await Bank.findById(req.query.bankId);
    if (!bank) {
      return res.status(200).json({ status: false, message: "bank does not found!" });
    }

    await bank.deleteOne();

    return res.status(200).json({ status: true, message: "Bank has been deleted by the admin.", bank: bank });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.getBanks = async (req, res) => {
  try {
    const bank = await Bank.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({ status: true, message: "Retrive Banks.", bank: bank });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
