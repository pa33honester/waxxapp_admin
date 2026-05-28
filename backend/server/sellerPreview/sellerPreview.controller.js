const Seller = require("../seller/seller.model");
const mongoose = require("mongoose");

const escapeHtml = (s) =>
  String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

exports.renderSellerPreview = async (req, res) => {
  try {
    const { sellerId } = req.params;
    if (!sellerId || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(404).send(notFoundHtml());
    }

    const seller = await Seller.findById(sellerId)
      .select("businessName firstName lastName businessTag image description")
      .lean();

    if (!seller) return res.status(404).send(notFoundHtml());

    const sellerName =
      seller.businessName ||
      [seller.firstName, seller.lastName].filter(Boolean).join(" ") ||
      "J4market seller";
    const description = seller.description || seller.businessTag || `Check out ${sellerName}'s store on J4market`;
    const image = seller.image || "";
    const canonicalUrl = `https://www.j4market.com/seller/${sellerId}`;

    res.set("Cache-Control", "public, max-age=300");
    return res.status(200).send(buildHtml({ sellerName, description, image, canonicalUrl }));
  } catch (err) {
    console.error("renderSellerPreview error:", err);
    return res.status(500).send(notFoundHtml());
  }
};

function buildHtml({ sellerName, description, image, canonicalUrl }) {
  const safeName = escapeHtml(sellerName);
  const safeDesc = escapeHtml(description.length > 140 ? description.slice(0, 137) + "â€¦" : description);
  const safeImage = escapeHtml(image);
  const safeCanonical = escapeHtml(canonicalUrl);
  const sellerIdEscaped = escapeHtml(canonicalUrl.split("/seller/")[1] || "");
  const playStoreUrl = "https://play.google.com/store/apps/details?id=com.waxxapp";
  const appStoreUrl = "https://apps.apple.com/app/waxxapp/id000000000"; // TODO: replace with real iOS App Store id

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>${safeName} Â· J4market</title>
  <link rel="canonical" href="${safeCanonical}">

  <meta property="og:title" content="${safeName} on J4market">
  <meta property="og:description" content="${safeDesc}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:type" content="profile">
  <meta property="og:url" content="${safeCanonical}">
  <meta property="og:site_name" content="J4market">

  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeName} on J4market">
  <meta name="twitter:description" content="${safeDesc}">
  <meta name="twitter:image" content="${safeImage}">

  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; height: 100%; background: #0b0b0c; color: #fff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif; }
    .wrap { display: flex; flex-direction: column; align-items: center; min-height: 100%; padding: 24px 16px 32px; }
    .card { width: 100%; max-width: 420px; background: #15151a; border-radius: 18px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,.4); }
    .seller-img { width: 100%; aspect-ratio: 1 / 1; object-fit: cover; display: block; background: #1e1e26; max-height: 300px; }
    .avatar-placeholder { width: 100%; height: 200px; display: flex; align-items: center; justify-content: center; background: #1e1e26; font-size: 64px; }
    .meta { padding: 20px 16px 4px; text-align: center; }
    .seller-name { font-weight: 700; font-size: 18px; }
    .desc { color: #c8c8d0; font-size: 13px; margin-top: 10px; line-height: 1.4; }
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
      ${safeImage
        ? `<img class="seller-img" src="${safeImage}" alt="${safeName}">`
        : `<div class="avatar-placeholder">ðŸ›ï¸</div>`}
      <div class="meta">
        <div class="seller-name">${safeName}</div>
        <div class="desc">${safeDesc}</div>
      </div>
      <div class="actions">
        <a class="btn btn-primary" id="open-app" href="${safeCanonical}">View store</a>
        <a class="btn btn-secondary" id="install-btn" href="${playStoreUrl}">Install</a>
      </div>
    </div>
    <div class="footer">Powered by <a href="https://www.j4market.com">J4market</a></div>
  </div>
  <script>
    (function () {
      var SELLER_ID = ${JSON.stringify(sellerIdEscaped)};
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
            'intent://www.j4market.com/seller/' + SELLER_ID +
            '#Intent;scheme=https;package=com.waxxapp;' +
            'S.browser_fallback_url=' + fallback + ';end';
          window.location.href = intentUrl;
          return;
        }
        if (isIOS) {
          var customScheme = 'waxxapp://seller/' + SELLER_ID;
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

function notFoundHtml() {
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Seller not found Â· J4market</title>
<style>html,body{margin:0;padding:0;height:100%;background:#0b0b0c;color:#fff;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,system-ui,sans-serif;display:flex;align-items:center;justify-content:center;text-align:center}main{padding:32px}h1{font-size:18px;margin:0 0 8px}p{color:#9b9ba2;margin:0 0 24px}a{display:inline-block;background:#DEF213;color:#000;padding:10px 18px;border-radius:10px;text-decoration:none;font-weight:700;font-size:14px}</style>
</head><body><main><h1>This store isn't available</h1><p>It may have been removed or the link is incorrect.</p><a href="https://play.google.com/store/apps/details?id=com.waxxapp">Get the J4market app</a></main></body></html>`;
}
