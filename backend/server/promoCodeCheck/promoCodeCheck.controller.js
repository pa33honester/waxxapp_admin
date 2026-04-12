const PromoCodeCheck = require("../../server/promoCodeCheck/promoCodeCheck.model");

//import model
const PromoCode = require("../../server/promoCode/promoCode.model");
const User = require("../../server/user/user.model");

//when user apply the promoCode then check promoCode history
exports.checkPromoCode = async (req, res) => {
  try {
    if (!req.query.promocodeId || !req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const [promoCode, user, promoCodeCheck] = await Promise.all([
      PromoCode.findOne({ _id: req.query.promocodeId }),
      User.findOne({ _id: req.query.userId, isBlock: false }),
      PromoCodeCheck.findOne({ promoCodeId: req.query.promocodeId, userId: req.query.userId }),
    ]);

    if (!promoCode) {
      return res.status(200).json({ status: false, message: "promoCode does not found." });
    }

    if (!user) {
      return res.status(200).json({ status: false, message: "user does not found." });
    }

    if (promoCodeCheck) {
      return res.status(200).json({
        status: false,
        message: "you are not able to use that promoCode because that promoCode already used by this user!",
      });
    } else {
      return res.status(200).json({
        status: true,
        message: "you are able to use that promoCode!",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
