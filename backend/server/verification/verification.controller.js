const Verification = require("./verification.model");
const User = require("../user/user.model");

const config = require("../../config");
const admin = require("../../util/privateKey");
const { fileUrlFor } = require("../../util/multer");
const { deleteFile } = require("../../util/deleteFile");

// Submit a selfie for verification.
// Body (multipart): { userId, autoCheckResult? } + file field "selfie"
//
// Writes a new Verification row and flips User.verificationStatus to
// "pending_review". Old pending submissions for the same user are
// kept as history (one row per submission) so reviewer audit and
// resubmit-after-rejection work cleanly. Rate-limited to 3 submits
// per user per 24h to avoid drowning the admin queue.
exports.submitSelfie = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "userId required" });
    }

    const user = await User.findById(userId);
    if (!user) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "User not found" });
    }

    if (!req.file) {
      return res.status(200).json({ status: false, message: "selfie file required" });
    }

    // Rate limit: count submissions in the last 24h.
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentCount = await Verification.countDocuments({
      userId,
      createdAt: { $gte: since },
    });
    if (recentCount >= 3) {
      deleteFile(req.file);
      return res.status(200).json({
        status: false,
        message: "Too many submissions in 24h. Please try again later.",
      });
    }

    // Parse autoCheckResult if the client posted it as JSON string
    // (multipart form fields arrive as strings; plain objects don't
    // survive the wire).
    let autoCheckResult = {};
    if (req.body.autoCheckResult) {
      try {
        autoCheckResult = typeof req.body.autoCheckResult === "string"
          ? JSON.parse(req.body.autoCheckResult)
          : req.body.autoCheckResult;
      } catch (e) {
        autoCheckResult = {};
      }
    }

    const url = fileUrlFor(req.file, config.baseURL);

    const verification = new Verification({
      userId,
      selfieFile: url,
      status: "pending_review",
      autoCheckResult: {
        faceCount: autoCheckResult.faceCount ?? null,
        leftEyeOpen: autoCheckResult.leftEyeOpen ?? null,
        rightEyeOpen: autoCheckResult.rightEyeOpen ?? null,
        faceAreaRatio: autoCheckResult.faceAreaRatio ?? null,
        mlKitVersion: autoCheckResult.mlKitVersion ?? null,
      },
    });

    await Promise.all([
      verification.save(),
      User.findByIdAndUpdate(userId, { verificationStatus: "pending_review" }),
    ]);

    return res.status(200).json({
      status: true,
      message: "Selfie submitted for review",
      verification,
    });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.error("submitSelfie error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

// Get the current user's latest submission status.
// Query: { userId }
exports.getMyStatus = async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(200).json({ status: false, message: "userId required" });
    }

    const latest = await Verification.findOne({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      status: true,
      message: "OK",
      verification: latest || null,
    });
  } catch (error) {
    console.error("getMyStatus error:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

// Admin: list submissions, default to pending queue.
// Query: { status?, page?, limit? }
// Header: Authorization (admin JWT) — enforced by adminAuth middleware
exports.adminList = async (req, res) => {
  try {
    const status = req.query.status || "pending_review";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const filter = status === "all" ? {} : { status };

    const [items, total] = await Promise.all([
      Verification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "firstName lastName email image mobileNumber")
        .lean(),
      Verification.countDocuments(filter),
    ]);

    return res.status(200).json({
      status: true,
      message: "OK",
      data: items,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("adminList error:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

// Admin: approve or reject a verification submission.
// Body: { verificationId, decision: "verified" | "rejected", rejectionReason? }
// Header: Authorization (admin JWT) — req.admin populated by middleware
exports.adminReview = async (req, res) => {
  try {
    const { verificationId, decision, rejectionReason } = req.body;
    if (!verificationId || !["verified", "rejected"].includes(decision)) {
      return res.status(200).json({
        status: false,
        message: 'Provide verificationId + decision ("verified" or "rejected")',
      });
    }

    const verification = await Verification.findById(verificationId);
    if (!verification) {
      return res.status(200).json({ status: false, message: "Verification not found" });
    }

    verification.status = decision;
    verification.reviewedAt = new Date();
    verification.reviewedBy = req.admin?._id || null;
    verification.rejectionReason = decision === "rejected" ? (rejectionReason || null) : null;
    await verification.save();

    // Mirror the decision to the User's denormalized field.
    await User.findByIdAndUpdate(verification.userId, { verificationStatus: decision });

    // Push notification (best-effort; doesn't fail the response).
    try {
      const user = await User.findById(verification.userId);
      if (user?.fcmToken) {
        const adminPromise = await admin;
        const isVerified = decision === "verified";
        await adminPromise.messaging().send({
          token: user.fcmToken,
          notification: {
            title: isVerified ? "You're verified!" : "Verification update",
            body: isVerified
              ? "Your selfie was approved. The verified badge now appears on your profile."
              : `Your selfie was not approved.${rejectionReason ? " Reason: " + rejectionReason : ""} You can retake and try again.`,
          },
          data: {
            type: isVerified ? "VERIFICATION_APPROVED" : "VERIFICATION_REJECTED",
            reason: rejectionReason || "",
          },
        });
      }
    } catch (e) {
      console.error("Verification push notify error:", e);
    }

    return res.status(200).json({
      status: true,
      message: `Verification ${decision}`,
      verification,
    });
  } catch (error) {
    console.error("adminReview error:", error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};
