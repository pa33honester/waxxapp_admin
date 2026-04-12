const ReportoReel = require("./reportoReel.model");

//import model
const User = require("../user/user.model");
const Reel = require("../reel/reel.model");
const LikeHistoryOfReel = require("../likeHistoryOfReel/likeHistoryOfReel.model");

//private key
const admin = require("../../util/privateKey");

//fs
const fs = require("fs");

//report to particular reel by the user
exports.reportReel = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.reelId || !req.body.description) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const [user, reel] = await Promise.all([User.findById(req?.body?.userId), Reel.findOne({ _id: req?.body?.reelId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (!reel) {
      return res.status(200).json({ satus: false, message: "reel does not found!" });
    }

    res.status(200).json({ status: true, message: "Report to particular reel by the user." });

    const reportoReel = new ReportoReel();
    reportoReel.userId = user?._id;
    reportoReel.reelId = reel?._id;
    reportoReel.status = 1;
    reportoReel.description = req?.body?.description;
    reportoReel.reportDate = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await reportoReel.save();

    if (!user.isBlock && user.fcmToken && user.fcmToken !== null) {
      const payload = {
        token: user.fcmToken,
        notification: {
          title: "✅ Report Received!",
          body: "📬 We’ve logged your report and our support team is on it. You’ll hear back from us shortly. Thanks for helping us improve! 🙌",
        },
        data: {
          type: "REPORT_SUBMITTED",
        },
      };

      const adminPromise = await admin;
      adminPromise
        .messaging()
        .send(payload)
        .then((response) => {
          console.log("Successfully sent with response: ", response);
        })
        .catch((error) => {
          console.log("Error sending message: ", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get all reported reels
exports.reportsOfReel = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const status = req.query.status ? parseInt(req.query.status) : null;

    const filter = {};
    if (status === 1 || status === 2) {
      filter.status = status;
    }

    const [totalReportOfReels, reportOfReels] = await Promise.all([
      ReportoReel.countDocuments(filter),
      ReportoReel.find(filter)
        .populate("reelId", "video videoType thumbnail thumbnailType")
        .populate("userId", "firstName lastName image uniqueId")
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    return res.status(200).json({
      status: true,
      message: reportOfReels.length > 0 ? "Reports of the reels retrieved successfully." : "No reports of reels found.",
      totalReportOfReels,
      reportOfReels,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//solved reported reel
exports.resolveReport = async (req, res) => {
  try {
    if (!req.query.reportId) {
      return res.status(200).json({ status: false, message: "reportId must be requried." });
    }

    const report = await ReportoReel.findById(req.query.reportId);
    if (!report) {
      return res.status(200).json({ status: false, message: "report does not found." });
    }

    if (report.status == 2) {
      return res.status(200).json({ status: false, message: "report already solved by the admin." });
    }

    res.status(200).send({
      status: true,
      message: "Report has been solved by the admin.",
    });

    report.status = 2;
    await report.save();

    const user = await User.findById(report.userId).select("_id isBlock fcmToken");

    if (user && !user.isBlock && user.fcmToken && user.fcmToken !== null) {
      const payload = {
        token: user.fcmToken,
        notification: {
          title: "✅ Issue Resolved Successfully",
          body: "📩 Thank you for your report. The issue in the short video has been reviewed and resolved. We appreciate your continued support. 🤝",
        },
        data: {
          type: "REPORT_SOLVED",
        },
      };

      const adminPromise = await admin;
      adminPromise
        .messaging()
        .send(payload)
        .then((response) => {
          console.log("Successfully sent with response: ", response);
        })
        .catch((error) => {
          console.log("Error sending message: ", error);
        });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//delete report
exports.deleteReport = async (req, res) => {
  try {
    const { reportId, reelId } = req.query;

    if (!reportId || !reelId) {
      return res.status(200).json({
        status: false,
        message: "Both reportId and reelId are required.",
      });
    }

    const [report, reel] = await Promise.all([ReportoReel.findById(reportId), Reel.findById(reelId)]);

    if (!report) {
      return res.status(200).json({
        status: false,
        message: "Report not found.",
      });
    }

    res.status(200).json({
      status: true,
      message: "Report has been deleted.",
    });

    const fileUnlinks = [];

    if (report.reelId && reel) {
      if (reel.video) {
        const videoPath = reel.video.split("storage")[1];
        if (videoPath) {
          const fullPath = "storage" + videoPath;
          if (fs.existsSync(fullPath)) {
            fileUnlinks.push(fs.promises.unlink(fullPath));
          }
        }
      }

      if (reel.thumbnail) {
        const thumbPath = reel.thumbnail.split("storage")[1];
        if (thumbPath) {
          const fullPath = "storage" + thumbPath;
          if (fs.existsSync(fullPath)) {
            fileUnlinks.push(fs.promises.unlink(fullPath));
          }
        }
      }

      await Promise.all([...fileUnlinks, LikeHistoryOfReel.deleteMany({ reelId }), reel.deleteOne()]);
    }

    await report.deleteOne();
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
