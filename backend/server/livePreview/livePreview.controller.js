const LiveSeller = require("../liveSeller/liveSeller.model");
const Seller = require("../seller/seller.model");
const mongoose = require("mongoose");

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

// Renders a public OG-tagged preview of a live show. Tapping the
// https://www.waxxapp.com/live/<liveSellingHistoryId> link will open
// the app directly on devices where the App Link / Universal Link is
// verified (see assetlinks.json + apple-app-site-association). If the
// app isn't installed (or App Links haven't verified yet), the user
// lands on this page and can hit Install. The page also handles the
// "live has ended" case — the LiveSeller doc is deleted on stream end,
// so an old shared link still renders something sane.
exports.renderLivePreview = async (req, res) => {
  try {
    const { liveSellingHistoryId } = req.params;
    if (!liveSellingHistoryId || !mongoose.Types.ObjectId.isValid(liveSellingHistoryId)) {
      return res.status(404).send(notFoundHtml({ ended: false }));
    }

    const live = await LiveSeller.findOne({ liveSellingHistoryId }).lean();

    let sellerName, image, businessTag, isLiveNow;
    if (live) {
      sellerName = live.businessName || `${live.firstName || ""} ${live.lastName || ""}`.trim() || "Waxxapp seller";
      image = live.image || "";
      businessTag = live.businessTag || "";
      isLiveNow = true;
    } else {
      // Live has ended — fall back to whatever seller info we can dig up
      // by following the liveSellingHistory back to the seller. If even
      // that fails we render the generic "ended" page.
      const histId = new mongoose.Types.ObjectId(liveSellingHistoryId);
      const SellingHistory = require("../liveSellingHistory/liveSellingHistory.model");
      const history = await SellingHistory.findById(histId).lean();
      if (!history) return res.status(404).send(notFoundHtml({ ended: true }));
      const seller = await Seller.findById(history.sellerId).select("firstName lastName businessName businessTag image").lean();
      if (!seller) return res.status(404).send(notFoundHtml({ ended: true }));
      sellerName = seller.businessName || `${seller.firstName || ""} ${seller.lastName || ""}`.trim() || "Waxxapp seller";
      image = seller.image || "";
      businessTag = seller.businessTag || "";
      isLiveNow = false;
    }

    const canonicalUrl = `https://www.waxxapp.com/live/${liveSellingHistoryId}`;

    res.set("Cache-Control", "public, max-age=60");
    return res.status(200).send(buildHtml({ sellerName, image, businessTag, isLiveNow, canonicalUrl, liveId: liveSellingHistoryId }));
  } catch (err) {
    console.error("renderLivePreview error:", err);
    return res.status(500).send(notFoundHtml({ ended: false }));
  }
};

function buildHtml({ sellerName, image, businessTag, isLiveNow, canonicalUrl, liveId }) {
  const safeSeller = escapeHtml(sellerName);
  const safeTag = escapeHtml(businessTag);
  const safeImage = escapeHtml(image);
  const safeCanonical = escapeHtml(canonicalUrl);
  const safeLiveId = escapeHtml(liveId);
  const description = isLiveNow ? `${sellerName} is live now on Waxxapp — join the show.` : `${sellerName} just wrapped a live show on Waxxapp.`;
  const safeDesc = escapeHtml(description);
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.waxxapp";
  const appStoreUrl = "https://apps.apple.com/app/waxxapp/id000000000"; // TODO: real iOS App Store id
  const liveBadge = isLiveNow
    ? `<span class="badge live">● LIVE NOW</span>`
    : `<span class="badge ended">SHOW ENDED</span>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${safeSeller} on Waxxapp</title>
  <link rel="canonical" href="${safeCanonical}">

  <meta property="og:title" content="${safeSeller} ${isLiveNow ? "is live now" : "on Waxxapp"}">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:type" content="video.other">
  <meta property="og:url" content="${safeCanonical}">
  <meta property="og:site_name" content="Waxxapp">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeSeller} ${isLiveNow ? "is live now" : "on Waxxapp"}">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImage}">

  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; height: 100%; background: #0b0b0c; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif; }
    .wrap { display: flex; flex-direction: column; align-items: center; min-height: 100%; padding: 24px 16px 32px; }
    .card { width: 100%; max-width: 420px; background: #15151a; border-radius: 18px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,.4); }
    .hero { position: relative; aspect-ratio: 1 / 1; background: #111; }
    .hero img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .badge { position: absolute; top: 12px; left: 12px; padding: 6px 10px; border-radius: 6px; font-size: 11px; font-weight: 800; letter-spacing: 0.5px; }
    .badge.live { background: #FF2D6A; color: #fff; }
    .badge.ended { background: rgba(255,255,255,.15); color: #fff; }
    .meta { padding: 16px 16px 4px; }
    .seller { font-weight: 700; font-size: 15px; }
    .tag { color: #c8c8d0; font-size: 12px; margin-top: 4px; }
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
      <div class="hero">
        ${safeImage ? `<img src="${safeImage}" alt="${safeSeller}">` : ""}
        ${liveBadge}
      </div>
      <div class="meta">
        <div class="seller">${safeSeller}</div>
        ${safeTag ? `<div class="tag">@${safeTag}</div>` : ""}
        <div class="desc">${safeDesc}</div>
      </div>
      <div class="actions">
        <a class="btn btn-primary" id="open-app" href="${safeCanonical}">${isLiveNow ? "Join live in app" : "Open in app"}</a>
        <a class="btn btn-secondary" id="install-btn" href="${playStoreUrl}">Install</a>
      </div>
    </div>
    <div class="footer">Powered by <a href="https://www.waxxapp.com">Waxxapp</a></div>
  </div>
  <script>
    // Same handoff pattern as the /short/<id> preview — see that file for
    // the rationale. Browsers don't dispatch to an installed app for a
    // same-domain link tap, so we explicitly route via Intent URL on
    // Android and waxxapp:// on iOS.
    (function () {
      var LIVE_ID = ${JSON.stringify(safeLiveId)};
      var PLAY_STORE = ${JSON.stringify(playStoreUrl)};
      var APP_STORE = ${JSON.stringify(appStoreUrl)};
      var openBtn = document.getElementById('open-app');
      var installBtn = document.getElementById('install-btn');

      var ua = navigator.userAgent || "";
      var isAndroid = /Android/i.test(ua);
      var isIOS = /iPad|iPhone|iPod/.test(ua);

      if (isIOS && installBtn) installBtn.href = APP_STORE;
      if (!openBtn) return;

      openBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (isAndroid) {
          var fallback = encodeURIComponent(PLAY_STORE);
          var intentUrl =
            'intent://www.waxxapp.com/live/' + LIVE_ID +
            '#Intent;scheme=https;package=com.waxxapp;' +
            'S.browser_fallback_url=' + fallback + ';end';
          window.location.href = intentUrl;
          return;
        }
        if (isIOS) {
          var customScheme = 'waxxapp://live/' + LIVE_ID;
          var t0 = Date.now();
          var fallbackTimer = setTimeout(function () {
            if (Date.now() - t0 < 2000 && !document.hidden) {
              window.location.href = APP_STORE;
            }
          }, 1600);
          document.addEventListener('visibilitychange', function () {
            if (document.hidden) clearTimeout(fallbackTimer);
          });
          window.location.href = customScheme;
          return;
        }
        window.location.href = PLAY_STORE;
      });
    })();
  </script>
</body>
</html>`;
}

function notFoundHtml({ ended }) {
  const msg = ended ? "This live show has ended" : "This live show isn't available";
  const sub = ended ? "The seller's no longer broadcasting." : "It may have been removed or the link is incorrect.";
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Live · Waxxapp</title>
<style>html,body{margin:0;padding:0;height:100%;background:#0b0b0c;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center}main{padding:32px}h1{font-size:18px;margin:0 0 8px}p{color:#9b9ba2;margin:0 0 24px}a{display:inline-block;background:#DEF213;color:#000;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px}</style>
</head><body><main><h1>${msg}</h1><p>${sub}</p><a href="https://play.google.com/store/apps/details?id=com.waxxapp">Get the Waxxapp app</a></main></body></html>`;
}
