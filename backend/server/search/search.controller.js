const mongoose = require("mongoose");

const Product = require("../product/product.model");
const Seller = require("../seller/seller.model");
const Reel = require("../reel/reel.model");

// Scopes callers can request; "all" fans out to every scope.
const SCOPES = ["products", "sellers", "live", "reels"];

/**
 * Unified multi-scope search. Runs a MongoDB `$text` query per scope in
 * parallel, falling back to a case-insensitive regex on the primary display
 * field when `$text` returns nothing (handy on cold indexes and for short
 * prefix queries like "ch" that text indexes don't match).
 *
 * GET /search/all?q=charizard&scope=all&limit=20
 * GET /search/all?q=sarah&scope=sellers&limit=10
 */
exports.searchAll = async (req, res) => {
  try {
    const raw = (req.query.q || "").toString().trim();
    if (raw.length < 2) {
      // Short queries short-circuit — $text would return nothing useful and
      // regex on 1 char hammers the DB.
      return res.status(200).json({ status: true, products: [], sellers: [], liveShows: [], reels: [] });
    }

    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
    const requestedScope = (req.query.scope || "all").toString().toLowerCase();
    const scopes = requestedScope === "all" ? SCOPES : [requestedScope].filter((s) => SCOPES.includes(s));
    if (scopes.length === 0) {
      return res.status(200).json({ status: false, message: "Invalid scope." });
    }

    const tasks = scopes.map((s) => _runScope(s, raw, limit));
    const results = await Promise.all(tasks);

    const payload = { status: true, products: [], sellers: [], liveShows: [], reels: [] };
    scopes.forEach((s, i) => {
      if (s === "products") payload.products = results[i];
      if (s === "sellers") payload.sellers = results[i];
      if (s === "live") payload.liveShows = results[i];
      if (s === "reels") payload.reels = results[i];
    });

    return res.status(200).json(payload);
  } catch (e) {
    console.error("searchAll error:", e);
    return res.status(500).json({ status: false, message: e.message || "Internal Server Error" });
  }
};

async function _runScope(scope, q, limit) {
  switch (scope) {
    case "products":
      return _searchProducts(q, limit);
    case "sellers":
      return _searchSellers(q, limit, { liveOnly: false });
    case "live":
      return _searchSellers(q, limit, { liveOnly: true });
    case "reels":
      return _searchReels(q, limit);
    default:
      return [];
  }
}

async function _searchProducts(q, limit) {
  const baseFilter = { createStatus: "Approved" };

  // Text-index pass
  const textDocs = await Product.find(
    { ...baseFilter, $text: { $search: q } },
    { score: { $meta: "textScore" } }
  )
    .select("productName mainImage price productSaleType seller")
    .populate("seller", "businessName image")
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean();

  if (textDocs.length > 0) return textDocs;

  // Fallback regex for cold indexes / short tokens
  const rx = new RegExp(_escapeRegex(q), "i");
  return Product.find({ ...baseFilter, productName: rx })
    .select("productName mainImage price productSaleType seller")
    .populate("seller", "businessName image")
    .sort({ searchCount: -1, createdAt: -1 })
    .limit(limit)
    .lean();
}

async function _searchSellers(q, limit, { liveOnly }) {
  const baseFilter = { isBlock: false };
  if (liveOnly) baseFilter.isLive = true;

  const textDocs = await Seller.find(
    { ...baseFilter, $text: { $search: q } },
    { score: { $meta: "textScore" } }
  )
    .select("businessName businessTag firstName lastName image isLive liveSellingHistoryId followers")
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean();

  if (textDocs.length > 0) return textDocs;

  const rx = new RegExp(_escapeRegex(q), "i");
  return Seller.find({ ...baseFilter, $or: [{ businessName: rx }, { firstName: rx }, { lastName: rx }] })
    .select("businessName businessTag firstName lastName image isLive liveSellingHistoryId followers")
    .sort({ followers: -1 })
    .limit(limit)
    .lean();
}

async function _searchReels(q, limit) {
  const textDocs = await Reel.find(
    { $text: { $search: q } },
    { score: { $meta: "textScore" } }
  )
    .select("thumbnail video description sellerId productId like")
    .populate("sellerId", "businessName image")
    .sort({ score: { $meta: "textScore" } })
    .limit(limit)
    .lean();

  if (textDocs.length > 0) return textDocs;

  const rx = new RegExp(_escapeRegex(q), "i");
  return Reel.find({ description: rx })
    .select("thumbnail video description sellerId productId like")
    .populate("sellerId", "businessName image")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
}

function _escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
