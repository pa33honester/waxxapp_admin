const ReportLive = require("./reportoLive.model");

const User = require("../user/user.model");
const LiveSellingHistory = require("../liveSellingHistory/liveSellingHistory.model");

const admin = require("../../util/privateKey");

// Buyer-side report against an active or recently-ended live show. Mirrors
// the existing reportoReel flow — fire-and-forget save plus an FCM
// confirmation back to the reporter so they know the report landed.
exports.reportLive = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.liveSellingHistoryId || !req.body.description) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const [user, live] = await Promise.all([
      User.findById(req.body.userId),
      LiveSellingHistory.findOne({ _id: req.body.liveSellingHistoryId }).select("_id sellerId"),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (!live) {
      return res.status(200).json({ status: false, message: "Live stream not found." });
    }

    res.status(200).json({ status: true, message: "Report received. Our team will review it shortly." });

    const report = new ReportLive();
    report.userId = user._id;
    report.liveSellingHistoryId = live._id;
    report.sellerId = live.sellerId || null;
    report.status = 1;
    report.description = req.body.description;
    report.reportDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await report.save();

    if (!user.isBlock && user.fcmToken) {
      const payload = {
        token: user.fcmToken,
        notification: {
          title: "Report Received",
          body: "Thanks for the report — we'll review the live stream and take action if needed.",
        },
        data: { type: "REPORT_SUBMITTED" },
      };

      const adminPromise = await admin;
      adminPromise
        .messaging()
        .send(payload)
        .catch((err) => console.log("reportLive FCM error:", err.message));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.reportsOfLive = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const status = req.query.status ? parseInt(req.query.status) : null;

    const filter = {};
    if (status === 1 || status === 2) {
      filter.status = status;
    }

    const [totalReports, reports] = await Promise.all([
      ReportLive.countDocuments(filter),
      ReportLive.find(filter)
        .populate("liveSellingHistoryId", "title startTime endTime")
        .populate("userId", "firstName lastName image uniqueId")
        .populate("sellerId", "businessName image")
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      status: true,
      message: reports.length > 0 ? "Reports retrieved successfully." : "No reports found.",
      totalReports,
      reports,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

exports.resolveReport = async (req, res) => {
  try {
    if (!req.query.reportId) {
      return res.status(200).json({ status: false, message: "reportId must be required." });
    }

    const report = await ReportLive.findById(req.query.reportId);
    if (!report) {
      return res.status(200).json({ status: false, message: "Report not found." });
    }

    if (report.status === 2) {
      return res.status(200).json({ status: false, message: "Report already solved." });
    }

    res.status(200).json({ status: true, message: "Report has been solved by the admin." });

    report.status = 2;
    await report.save();

    const user = await User.findById(report.userId).select("_id isBlock fcmToken");
    if (user && !user.isBlock && user.fcmToken) {
      const payload = {
        token: user.fcmToken,
        notification: {
          title: "Issue Resolved",
          body: "Your report on the live stream has been reviewed and resolved.",
        },
        data: { type: "REPORT_SOLVED" },
      };

      const adminPromise = await admin;
      adminPromise
        .messaging()
        .send(payload)
        .catch((err) => console.log("resolveReport FCM error:", err.message));
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    if (!req.query.reportId) {
      return res.status(200).json({ status: false, message: "reportId is required." });
    }

    const report = await ReportLive.findById(req.query.reportId);
    if (!report) {
      return res.status(200).json({ status: false, message: "Report not found." });
    }

    await report.deleteOne();
    return res.status(200).json({ status: true, message: "Report deleted." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
