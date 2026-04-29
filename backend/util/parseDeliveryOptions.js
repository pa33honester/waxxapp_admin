// Parses + validates the Shape B per-option shipping prices the Flutter
// pricing page sends as a JSON-encoded multipart string:
//   `[{"type":"local","price":50},{"type":"international","price":1000}]`
//
// Returns a deduped, type-validated array. Bad shapes / out-of-enum types
// are dropped silently so a malformed client payload doesn't crash the
// product save. Used by both `product.controller.js` and
// `productRequest.controller.js`.
const ALLOWED = new Set(["local", "nationwide", "international"]);

function parseDeliveryOptions(raw) {
  if (raw == null) return [];
  let list;
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "string") {
    if (!raw.trim()) return [];
    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      list = parsed;
    } catch (_) {
      return [];
    }
  } else {
    return [];
  }
  const seen = new Set();
  const out = [];
  for (const entry of list) {
    if (!entry || typeof entry !== "object") continue;
    const t = String(entry.type || "").trim().toLowerCase();
    if (!ALLOWED.has(t) || seen.has(t)) continue;
    const p = Number(entry.price);
    if (!Number.isFinite(p) || p < 0) continue;
    seen.add(t);
    out.push({ type: t, price: p });
  }
  return out;
}

module.exports = { parseDeliveryOptions };
