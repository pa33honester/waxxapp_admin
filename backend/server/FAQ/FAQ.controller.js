const FAQ = require("../FAQ/FAQ.model");

//create FAQ
exports.store = async (req, res) => {
  try {
    if (!req.body.question || !req.body.answer) return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });

    const FaQ = new FAQ();
    FaQ.question = req.body.question;
    FaQ.answer = req.body.answer;
    await FaQ.save();

    return res.status(200).json({
      status: true,
      message: "create Successfully!",
      FaQ,
    });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//update FAQ
exports.update = async (req, res) => {
  try {
    const FaQ = await FAQ.findById(req.query.FaQId);
    if (!FaQ) {
      return res.status(200).json({ status: false, message: "FAQ does not found." });
    }

    FaQ.question = req.body.question ? req.body.question : FaQ.question;
    FaQ.answer = req.body.answer ? req.body.answer : FaQ.answer;
    await FaQ.save();

    return res.status(200).json({ status: true, message: "update Successfully!", FaQ });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//delete FAQ
exports.destroy = async (req, res) => {
  try {
    if (!req.query.FaQId) {
      return res.status(200).json({ status: false, message: "FaQId must be required." });
    }

    const FaQ = await FAQ.findById(req.query.FaQId);
    if (!FaQ) {
      return res.status(200).json({ status: false, message: "FAQ does not found." });
    }

    await FaQ.deleteOne();

    return res.status(200).json({ status: true, message: "delete Successfully!" });
  } catch (error) {
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//get FAQ
exports.get = async (req, res) => {
  try {
    const FaQ = await FAQ.find().sort({ createdAt: 1 });

    return res.status(200).json({ status: true, message: "data get Successfully!", FaQ });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};
