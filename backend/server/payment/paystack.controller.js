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

const crypto = require("crypto");
const Setting = require("../setting/setting.model");
const Order = require("../order/order.model");

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

// Paystack post-checkout redirect target. The paystack_for_flutter SDK
// runs the checkout in an in-app webview and handles its own success
// callback there, but Paystack's dashboard requires SOMETHING in the
// "Live Callback URL" field — and a hand-typed redirect URL on a
// generated payment page also lands here. Renders a tiny standalone
// HTML page that says "Payment received, please return to the app" so
// the user isn't dumped on a 404 if Paystack ever does redirect them.
exports.callback = async (req, res) => {
  const ref = (req.query && req.query.reference) || (req.query && req.query.trxref) || "";
  res.set("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(`<!doctype html>
<html><head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Payment received — Waxxapp</title>
  <style>
    html,body{margin:0;height:100%;background:#0b0b0b;color:#eee;font-family:-apple-system,BlinkMacSystemFont,sans-serif}
    .wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:24px;text-align:center}
    .ok{font-size:64px;margin-bottom:16px;color:#A3E635}
    h1{margin:0 0 8px;font-weight:600}
    p{margin:6px 0;color:#bbb}
    code{background:#1a1a1a;padding:2px 6px;border-radius:4px;font-size:12px;color:#999}
  </style>
</head><body>
<div class="wrap">
  <div class="ok">✓</div>
  <h1>Payment received</h1>
  <p>Thanks — your payment is being processed.</p>
  <p>You can return to the Waxxapp app to see your order.</p>
  ${ref ? `<p><code>Ref: ${String(ref).replace(/[^a-zA-Z0-9_-]/g, "")}</code></p>` : ""}
</div>
</body></html>`);
};

// Paystack server-to-server webhook. Paystack POSTs JSON events here
// with an `x-paystack-signature` header equal to HMAC-SHA512 of the
// raw body using our secret key. We verify the signature, then on
// `charge.success` mark the matching Order paid by paymentReference.
//
// Critical because the in-app verify path (POST /payment/paystack/verify
// from the Flutter client) can be lost if the user closes the app
// after Paystack confirmed but before the client called us back. With
// the webhook armed, the order still flips to paid even if the client
// never returns. Idempotent — already-paid orders are no-ops.
//
// IMPORTANT: this route MUST receive the raw request body to compute
// the HMAC. The route mount in route.js uses express.raw() for the
// webhook path before the global json() middleware, so req.body here
// is a Buffer.
exports.webhook = async (req, res) => {
  try {
    const signature = req.headers["x-paystack-signature"];
    if (!signature) {
      console.warn("Paystack webhook missing x-paystack-signature");
      return res.status(401).send("missing signature");
    }

    const setting = await Setting.findOne().sort({ createdAt: -1 });
    const secretKey = setting && setting.paystackSecretKey;
    if (!secretKey) {
      console.warn("Paystack webhook hit but secret key not configured");
      // Return 200 so Paystack doesn't retry forever while we configure.
      return res.status(200).send("not configured");
    }

    const rawBody = Buffer.isBuffer(req.body)
      ? req.body
      : Buffer.from(typeof req.body === "string" ? req.body : JSON.stringify(req.body || {}));

    const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
    if (expected !== signature) {
      console.warn("Paystack webhook signature mismatch");
      return res.status(401).send("invalid signature");
    }

    let payload;
    try {
      payload = JSON.parse(rawBody.toString("utf8"));
    } catch (parseErr) {
      console.warn("Paystack webhook body not JSON:", parseErr.message);
      return res.status(400).send("invalid body");
    }

    const event = payload && payload.event;
    const data = (payload && payload.data) || {};
    console.log("Paystack webhook received:", event, "ref:", data.reference);

    // We always 200 fast — Paystack retries 4xx/5xx aggressively. Heavy
    // work happens after the response is committed.
    res.status(200).send("ok");

    if (event === "charge.success" && data.reference) {
      try {
        const order = await Order.findOne({ paymentReference: data.reference });
        if (!order) {
          console.log(
            "Paystack webhook: no order yet for reference",
            data.reference,
            "- ignoring (verify path will catch it when client returns)"
          );
          return;
        }
        if (order.paymentStatus === 2) {
          console.log("Paystack webhook: order", order._id, "already marked paid - no-op");
          return;
        }
        order.paymentStatus = 2;
        await order.save();
        console.log("Paystack webhook: marked order", order._id, "paid");
      } catch (asyncErr) {
        console.error("Paystack webhook async-process error:", asyncErr.message);
      }
    }
  } catch (error) {
    console.error("Paystack webhook error:", error);
    // We have to 200 here since we may have already responded above.
    if (!res.headersSent) {
      return res.status(500).send("error");
    }
  }
};
