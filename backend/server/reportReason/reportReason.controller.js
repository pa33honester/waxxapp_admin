const ReportReason = require("../reportReason/reportReason.model");

//create reportReason
exports.store = async (req, res) => {
  try {
    if (!req.query.title) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const title = req.query.title.trim();

    const reportReason = new ReportReason({ title: title });
    await reportReason.save();

    return res.status(200).json({
      status: true,
      message: "ReportReason created successfully.",
      data: reportReason,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//update reportReason
exports.update = async (req, res) => {
  try {
    if (!req.query.reportReasonId) {
      return res.status(200).json({ status: false, message: "reportReasonId must be needed." });
    }

    const reportReason = await ReportReason.findById(req.query.reportReasonId);
    if (!reportReason) {
      return res.status(200).json({ status: false, message: "reportReason does not found." });
    }

    reportReason.title = req.query.title ? req.query.title.trim() : reportReason.title;
    await reportReason.save();

    return res.status(200).json({
      status: true,
      message: "ReportReason update Successfully.",
      data: reportReason,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//get reportReason
exports.get = async (req, res) => {
  try {
    const reportReason = await ReportReason.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      status: true,
      message: "Retrive reportReason Successfully",
      data: reportReason,
    });
  } catch {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//delete reportReason
exports.delete = async (req, res) => {
  try {
    if (!req.query.reportReasonId) {
      return res.status(200).json({ status: false, message: "reportReasonId must be needed." });
    }

    const reportReason = await ReportReason.findById(req.query.reportReasonId);
    if (!reportReason) {
      return res.status(200).json({ status: false, message: "reportReason does not found." });
    }

    await reportReason.deleteOne();

    return res.status(200).json({
      status: true,
      message: "ReportReason deleted Successfully",
      data: reportReason,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};
