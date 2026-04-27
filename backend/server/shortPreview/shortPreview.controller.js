const Reel = require("../reel/reel.model");
const mongoose = require("mongoose");

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Renders an HTML preview for a single short. Tapping the original
// https://www.waxxapp.com/short/<id> link will open the app directly on
// devices where Android App Links / iOS Universal Links have verified the
// domain (see /.well-known/assetlinks.json + apple-app-site-association).
// Anyone without the app installed lands on this page, sees the video,
// and can install via the Play Store / App Store buttons.
exports.renderShortPreview = async (req, res) => {
  try {
    const { reelId } = req.params;
    if (!reelId || !mongoose.Types.ObjectId.isValid(reelId)) {
      return res.status(404).send(notFoundHtml());
    }

    const reel = await Reel.findById(reelId)
      .populate([
        { path: "sellerId", select: "firstName lastName businessName businessTag image" },
        { path: "productId", select: "productName mainImage price" },
      ])
      .lean();

    if (!reel) return res.status(404).send(notFoundHtml());

    const sellerName =
      reel.sellerId?.businessName ||
      [reel.sellerId?.firstName, reel.sellerId?.lastName].filter(Boolean).join(" ") ||
      "Waxxapp seller";
    const description = reel.description || `${sellerName} on Waxxapp`;
    const thumbnail = reel.thumbnail || "";
    const video = reel.video || "";
    const canonicalUrl = `https://www.waxxapp.com/short/${reelId}`;

    res.set("Cache-Control", "public, max-age=300");
    return res.status(200).send(buildHtml({ sellerName, description, thumbnail, video, canonicalUrl }));
  } catch (err) {
    console.error("renderShortPreview error:", err);
    return res.status(500).send(notFoundHtml());
  }
};

function buildHtml({ sellerName, description, thumbnail, video, canonicalUrl }) {
  const safeSeller = escapeHtml(sellerName);
  const safeDescription = escapeHtml(description.length > 140 ? description.slice(0, 137) + "…" : description);
  const safeThumb = escapeHtml(thumbnail);
  const safeVideo = escapeHtml(video);
  const safeCanonical = escapeHtml(canonicalUrl);
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.waxxapp";
  const appStoreUrl = "https://apps.apple.com/app/waxxapp/id000000000"; // TODO: replace with real iOS App Store id

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${safeSeller} on Waxxapp</title>
  <link rel="canonical" href="${safeCanonical}">

  <meta property="og:title" content="${safeSeller} on Waxxapp">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${safeThumb}">
  <meta property="og:video" content="${safeVideo}">
  <meta property="og:video:type" content="video/mp4">
  <meta property="og:type" content="video.other">
  <meta property="og:url" content="${safeCanonical}">
  <meta property="og:site_name" content="Waxxapp">

  <meta name="twitter:card" content="player">
  <meta name="twitter:title" content="${safeSeller} on Waxxapp">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${safeThumb}">
  <meta name="twitter:player" content="${safeVideo}">

  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; height: 100%; background: #0b0b0c; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif; }
    .wrap { display: flex; flex-direction: column; align-items: center; min-height: 100%; padding: 24px 16px 32px; }
    .card { width: 100%; max-width: 420px; background: #15151a; border-radius: 18px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,.4); }
    video { width: 100%; height: auto; aspect-ratio: 9 / 16; background: #000; display: block; }
    .meta { padding: 16px 16px 4px; }
    .seller { font-weight: 700; font-size: 15px; }
    .desc { color: #c8c8d0; font-size: 13px; margin-top: 6px; line-height: 1.4; }
    .actions { display: flex; gap: 10px; padding: 14px 16px 18px; }
    .btn { flex: 1; display: inline-flex; align-items: center; justify-content: center; height: 44px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; }
    .btn-primary { background: #DEF213; color: #000; }
    .btn-secondary { background: #2a2a32; color: #fff; }
    .footer { color: #6b6b75; font-size: 12px; margin-top: 22px; }
    .footer a { color: #c0c0c8; text-decoration: none; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="card">
      <video src="${safeVideo}" poster="${safeThumb}" controls playsinline preload="metadata"></video>
      <div class="meta">
        <div class="seller">${safeSeller}</div>
        <div class="desc">${safeDescription}</div>
      </div>
      <div class="actions">
        <a class="btn btn-primary" id="open-app" href="${safeCanonical}">Open in app</a>
        <a class="btn btn-secondary" href="${playStoreUrl}">Install</a>
      </div>
    </div>
    <div class="footer">Powered by <a href="https://www.waxxapp.com">Waxxapp</a></div>
  </div>
  <script>
    // Best-effort: when this page is reached because the app didn't auto-open
    // (App Links unverified, app not installed, or the user is on desktop),
    // route them to the right store on tap of "Install".
    (function () {
      var ua = navigator.userAgent || "";
      var isIOS = /iPad|iPhone|iPod/.test(ua);
      if (isIOS) {
        var btn = document.querySelector('.btn-secondary');
        if (btn) btn.href = ${JSON.stringify(appStoreUrl)};
      }
    })();
  </script>
</body>
</html>`;
}

function notFoundHtml() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Short not found · Waxxapp</title>
<style>html,body{margin:0;padding:0;height:100%;background:#0b0b0c;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center}main{padding:32px}h1{font-size:18px;margin:0 0 8px}p{color:#9b9ba2;margin:0 0 24px}a{display:inline-block;background:#DEF213;color:#000;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px}</style>
</head><body><main><h1>This short isn't available</h1><p>It may have been removed or the link is incorrect.</p><a href="https://play.google.com/store/apps/details?id=com.waxxapp">Get the Waxxapp app</a></main></body></html>`;
}
