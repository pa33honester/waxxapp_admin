const { Resend } = require("resend");
const config = require("../config");

// Lightweight transactional email wrapper around Resend. Callers are typically
// "fire and forget" from inside larger flows (approve seller, reject product…)
// so this never throws — it returns a result object the caller can use to
// report delivery status back to the admin.
async function sendTransactionalEmail({ to, subject, html }) {
  if (!to || !subject || !html) {
    return { ok: false, reason: "missing_fields" };
  }

  const apiKey = global.settingJSON && global.settingJSON.resendApiKey;
  if (!apiKey || apiKey === "YOUR_RESEND_API_KEY" || apiKey === "RESEND API KEY") {
    console.warn("sendTransactionalEmail skipped — resendApiKey not configured");
    return { ok: false, reason: "not_configured" };
  }

  try {
    const resend = new Resend(apiKey);
    const response = await resend.emails.send({
      from: config.EMAIL,
      to,
      subject,
      html,
    });

    if (response.error) {
      console.error("Resend send error:", response.error);
      return { ok: false, reason: "send_failed", error: response.error.message };
    }

    return { ok: true, id: response.data && response.data.id };
  } catch (error) {
    console.error("Resend threw:", error);
    return { ok: false, reason: "exception", error: error.message };
  }
}

function baseTemplate({ heading, intro, ctaText, ctaUrl, outro }) {
  const brand = config.projectName || "Waxxapp";
  const btn = ctaText && ctaUrl
    ? `<p style="text-align:center;margin:28px 0;">
         <a href="${ctaUrl}" style="display:inline-block;padding:12px 28px;background:#b93160;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;">${ctaText}</a>
       </p>`
    : "";

  return `<!doctype html><html><body style="margin:0;padding:0;background:#f6f6f6;font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
    <div style="max-width:560px;margin:32px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.05);">
      <div style="padding:24px 28px;background:#b93160;color:#fff;">
        <div style="font-size:20px;font-weight:700;">${brand}</div>
      </div>
      <div style="padding:28px;color:#333;font-size:15px;line-height:1.55;">
        <h2 style="margin:0 0 14px 0;color:#222;">${heading}</h2>
        <p style="margin:0 0 14px 0;">${intro}</p>
        ${btn}
        ${outro ? `<p style="margin:0 0 14px 0;color:#555;">${outro}</p>` : ""}
        <p style="margin:24px 0 0 0;color:#888;font-size:13px;">— ${brand}</p>
      </div>
    </div>
  </body></html>`;
}

// Smart-link target for "Open the app" CTAs. config.baseURL is the
// backend domain (https://www.waxxapp.com/) — pointing CTAs there just
// opens the API root in a browser, which isn't useful. Until the iOS
// build ships with its App Store ID, we fall back to the Play Store
// install / open URL on Android. Devices with the app already installed
// will resolve the package and open the app; devices without it land
// on the install page. Override via global.settingJSON.appOpenLink if
// the admin needs to point this elsewhere (e.g. once iOS is live).
// Defensive — even if settingJSON.appOpenLink ends up pointing at the
// backend domain (which is the actual symptom we keep seeing in the
// "Open the app" email CTA), reject it and fall through to the Play
// Store URL so users always end up somewhere useful.
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.waxxapp";
function appOpenLink() {
  const override = global.settingJSON && global.settingJSON.appOpenLink;
  if (typeof override === "string") {
    const cleaned = override.trim();
    if (
      cleaned &&
      !/waxxapp\.com\/?$/i.test(cleaned) && // bare backend domain
      !cleaned.startsWith("http://www.waxxapp.com") &&
      !cleaned.startsWith("https://www.waxxapp.com/admin") &&
      cleaned !== "https://www.waxxapp.com" &&
      cleaned !== "https://www.waxxapp.com/"
    ) {
      return cleaned;
    }
  }
  return PLAY_STORE_URL;
}

const templates = {
  sellerApproved({ firstName }) {
    return baseTemplate({
      heading: "You're a verified seller 🎉",
      intro: `Hi ${firstName || "there"}, your seller verification has been approved. You can now list products, go live, and start selling.`,
      ctaText: "Open the app",
      ctaUrl: appOpenLink(),
      outro: "If you have any questions, just reply to this email.",
    });
  },
  sellerRejected({ firstName, reason }) {
    return baseTemplate({
      heading: "Your seller application wasn't approved",
      intro: `Hi ${firstName || "there"}, we reviewed your seller application and weren't able to approve it at this time.`,
      outro: reason
        ? `<strong>Reason provided:</strong> ${reason}<br/><br/>You're welcome to update your details and reapply.`
        : "You're welcome to update your details and reapply.",
    });
  },
  productApproved({ firstName, productName }) {
    return baseTemplate({
      heading: "Your product is live 🚀",
      intro: `Hi ${firstName || "there"}, <strong>${productName || "your product"}</strong> has been approved and is now visible to buyers.`,
      ctaText: "Manage in the app",
      ctaUrl: appOpenLink(),
    });
  },
  productRejected({ firstName, productName, reason }) {
    return baseTemplate({
      heading: "Your product was rejected",
      intro: `Hi ${firstName || "there"}, <strong>${productName || "your product"}</strong> was rejected during review.`,
      outro: reason
        ? `<strong>Reason:</strong> ${reason}<br/><br/>Please update the listing and resubmit.`
        : "Please review the listing and resubmit.",
    });
  },
  emailChangeOtp({ firstName, code }) {
    return baseTemplate({
      heading: "Confirm your new email",
      intro: `Hi ${firstName || "there"}, use the code below to confirm this email address on your account. The code expires in 5 minutes.`,
      outro: `<div style="text-align:center;margin:8px 0 0 0;">
                <div style="display:inline-block;padding:12px 24px;background:#f5f5f5;border-radius:6px;font-size:24px;letter-spacing:6px;font-weight:700;color:#222;">${code}</div>
              </div><br/>If you didn't request this, you can ignore this email — your account stays as it is.`,
    });
  },
  // Sign-up assistant: a pending account request was approved and the
  // account created. We don't email the password (the user chose it in
  // the app) — just confirm the account is live and how to sign in.
  accountApproved({ firstName, email }) {
    return baseTemplate({
      heading: "Your account is ready 🎉",
      intro: `Hi ${firstName || "there"}, your account has been approved and created. You can now sign in${email ? ` with <strong>${email}</strong>` : ""} and the password you chose in the app.`,
      ctaText: "Open the app",
      ctaUrl: appOpenLink(),
      outro: "Forgot your password? You can reset it from the sign-in screen. If you have any questions, just reply to this email.",
    });
  },
  // Sign-up assistant: a pending account request was rejected by an admin.
  accountRejected({ firstName, reason }) {
    return baseTemplate({
      heading: "About your account request",
      intro: `Hi ${firstName || "there"}, we reviewed your account request and weren't able to approve it at this time.`,
      outro: reason
        ? `<strong>Reason provided:</strong> ${reason}<br/><br/>If you think this was a mistake, just reply to this email.`
        : "If you think this was a mistake, just reply to this email.",
    });
  },
};

module.exports = { sendTransactionalEmail, templates };
