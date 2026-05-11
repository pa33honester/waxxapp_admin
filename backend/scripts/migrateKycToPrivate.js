/**
 * One-shot migration: move existing seller KYC files (govId,
 * addressProof, registrationCert) from backend/storage/ → backend/
 * private_storage/, and rewrite the URL fields on Seller and
 * SellerRequest docs from `<baseURL>/storage/<filename>` →
 * `<baseURL>/private-file/<filename>`.
 *
 * Run on the server BEFORE deploying PR 2's mixedUpload change so
 * that legacy files are already gated by the time the static
 * /storage handler sees a request for one. Ordering:
 *   1. Stop the backend (or pm2 stop).
 *   2. node scripts/migrateKycToPrivate.js
 *   3. Deploy PR 2 (this PR) and start the backend.
 *
 * The script is idempotent — re-running it after success is a no-op
 * because the URLs already match the new shape.
 *
 * Usage:
 *   node scripts/migrateKycToPrivate.js [--dry]
 *
 * --dry: print what would change without touching files or DB.
 */

const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const config = require("../config");
const Seller = require("../server/seller/seller.model");
const SellerRequest = require("../server/sellerRequest/sellerRequest.model");

const DRY_RUN = process.argv.includes("--dry");

const STORAGE_DIR = path.join(__dirname, "..", "storage");
const PRIVATE_DIR = path.join(__dirname, "..", "private_storage");

const KYC_FIELDS = ["govId", "addressProof", "registrationCert"];

const log = (...args) => console.log(DRY_RUN ? "[DRY]" : "[RUN]", ...args);

const ensurePrivateDir = () => {
  if (!fs.existsSync(PRIVATE_DIR)) {
    if (!DRY_RUN) fs.mkdirSync(PRIVATE_DIR);
    log("created", PRIVATE_DIR);
  }
};

// Extract the filename from a stored URL like
// "https://www.waxxapp.com/storage/1730_xxx.jpg" or
// "https://www.waxxapp.com/private-file/1730_xxx.jpg".
const filenameFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const lastSlash = url.lastIndexOf("/");
  return lastSlash >= 0 ? url.substring(lastSlash + 1) : null;
};

// Already migrated → URL contains "/private-file/".
const isAlreadyPrivate = (url) => {
  return typeof url === "string" && url.includes("/private-file/");
};

// Move the file from storage/ → private_storage/ if it exists in the
// old location. Returns true if a move happened, false if missing
// (we still rewrite the URL — the doc reference is the source of
// truth even if the underlying file is gone).
const moveFile = (filename) => {
  const src = path.join(STORAGE_DIR, filename);
  const dst = path.join(PRIVATE_DIR, filename);
  if (!fs.existsSync(src)) {
    if (fs.existsSync(dst)) {
      log("file already in private_storage:", filename);
      return true;
    }
    log("missing file (URL kept, file gone):", filename);
    return false;
  }
  if (DRY_RUN) {
    log("would move", filename);
    return true;
  }
  fs.renameSync(src, dst);
  log("moved", filename);
  return true;
};

const newUrlFor = (filename) => `${config.baseURL}private-file/${filename}`;

// H5: roll the just-moved file(s) back to storage/ if the DB
// update fails. Without this, a partial migration leaves files in
// private_storage/ while the DB still points at /storage/<filename>,
// which the static handler can't find anymore.
const _rollbackFiles = (moved) => {
  for (const filename of moved) {
    try {
      const src = path.join(PRIVATE_DIR, filename);
      const dst = path.join(STORAGE_DIR, filename);
      if (fs.existsSync(src)) {
        fs.renameSync(src, dst);
        log("rolled back", filename);
      }
    } catch (e) {
      log("rollback error for", filename, ":", e?.message);
    }
  }
};

const migrateDoc = async (Model, doc) => {
  const updates = {};
  const movedThisDoc = [];
  for (const field of KYC_FIELDS) {
    const url = doc[field];
    if (!url || isAlreadyPrivate(url)) continue;
    const filename = filenameFromUrl(url);
    if (!filename) continue;
    moveFile(filename);
    if (!DRY_RUN) movedThisDoc.push(filename);
    updates[field] = newUrlFor(filename);
  }
  if (Object.keys(updates).length === 0) return false;
  log(`${Model.modelName} ${doc._id}: rewriting`, Object.keys(updates).join(", "));
  if (!DRY_RUN) {
    try {
      await Model.updateOne({ _id: doc._id }, { $set: updates });
    } catch (e) {
      log(`${Model.modelName} ${doc._id}: DB update FAILED — rolling back files:`, e?.message);
      _rollbackFiles(movedThisDoc);
      throw e;
    }
  }
  return true;
};

const run = async () => {
  log("Starting migration. DRY_RUN:", DRY_RUN);
  await mongoose.connect(config.MONGODB_CONNECTION_STRING);

  ensurePrivateDir();

  const sellerCursor = Seller.find({
    $or: KYC_FIELDS.map((f) => ({ [f]: { $exists: true, $ne: null } })),
  }).cursor();

  let sellerCount = 0;
  for await (const doc of sellerCursor) {
    if (await migrateDoc(Seller, doc)) sellerCount++;
  }
  log("Seller migrated:", sellerCount);

  const requestCursor = SellerRequest.find({
    $or: KYC_FIELDS.map((f) => ({ [f]: { $exists: true, $ne: null } })),
  }).cursor();

  let requestCount = 0;
  for await (const doc of requestCursor) {
    if (await migrateDoc(SellerRequest, doc)) requestCount++;
  }
  log("SellerRequest migrated:", requestCount);

  await mongoose.disconnect();
  log("Done.");
};

run().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
