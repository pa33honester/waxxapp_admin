// Paystack server-side transaction verification.
//
// The Flutter app launches Paystack's standard checkout via
// paystack_for_flutter, which signs in with the secret key and returns a
// reference on the success callback. That callback alone is *not* trustworthy
// — anyone can hit our /order/create with paymentGateway=Paystack and a fake
// reference. So before we credit anything, the app calls this endpoint with
// the reference; we hit Paystack's GET /transaction/verify/:reference using
// the admin-configured secret key and confirm:
//
//   * Paystack says status === "success"
//   * the amount Paystack settled matches what the client said it expected
//
// Only then do we return { status: true } and let the order proceed.

const Setting = require("../setting/setting.model");

exports.verify = async (req, res) => {
  try {
    const { reference, expectedAmount } = req.body || {};

    if (!reference || typeof reference !== "string") {
      return res.status(200).json({ status: false, message: "reference is required" });
    }

    // Pull the freshest secret key from Mongo, not from global.settingJSON,
    // so a key rotation in the admin panel takes effect without a restart.
    const setting = await Setting.findOne().sort({ createdAt: -1 });
    const secretKey = setting && setting.paystackSecretKey;
    if (!secretKey) {
      return res.status(200).json({ status: false, message: "Paystack is not configured" });
    }

    const paystackResp = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
      }
    );

    const body = await paystackResp.json().catch(() => null);
    if (!paystackResp.ok || !body) {
      console.log("Paystack verify HTTP error:", paystackResp.status, body);
      return res.status(200).json({ status: false, message: "Verify failed at gateway" });
    }

    const data = body.data || {};
    const gatewayStatus = data.status; // "success" | "failed" | "abandoned" | ...
    const gatewayAmount = data.amount; // in kobo/pesewas — smallest unit
    const gatewayCurrency = data.currency;

    if (gatewayStatus !== "success") {
      return res.status(200).json({
        status: false,
        message: `Paystack status: ${gatewayStatus || "unknown"}`,
      });
    }

    // Defence against amount tampering. Both sides agree on the smallest
    // currency unit. If the client's expectedAmount and Paystack's settled
    // amount disagree, refuse — the client may have asked Paystack to charge
    // 1 GHS and then claimed the order was 1000 GHS.
    if (
      expectedAmount !== undefined &&
      expectedAmount !== null &&
      Number(expectedAmount) > 0 &&
      Number(expectedAmount) !== Number(gatewayAmount)
    ) {
      console.log(
        "Paystack amount mismatch — expected",
        expectedAmount,
        "got",
        gatewayAmount
      );
      return res.status(200).json({
        status: false,
        message: "Amount mismatch — payment rejected",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Verified",
      data: {
        reference: data.reference,
        amount: gatewayAmount,
        currency: gatewayCurrency,
        paid_at: data.paid_at,
      },
    });
  } catch (error) {
    console.error("Paystack verify error:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
