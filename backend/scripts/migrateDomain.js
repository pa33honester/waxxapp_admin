/**
 * One-shot migration: rewrite all stored URLs in MongoDB from
 * https://www.waxxapp.com/ (and http://www.waxxapp.com/, https://waxxapp.com/)
 * to https://www.j4market.com/.
 *
 * Background: image/video/file URLs were stored as absolute URLs in all
 * collection documents before the domain migration. After the migration,
 * those URLs return ERR_SSL_PROTOCOL_ERROR because www.waxxapp.com no
 * longer serves HTTPS. A temporary res.json() rewrite middleware in
 * index.js patches this at the API layer, but this script makes the fix
 * permanent in the database so the middleware can be removed afterward.
 *
 * The script is idempotent — re-running after success is a no-op because
 * all matched strings will already equal the new domain.
 *
 * Usage (from backend/):
 *   node scripts/migrateDomain.js          # live run
 *   node scripts/migrateDomain.js --dry    # dry run: shows what would change
 *
 * Safe to run while the backend is running (uses per-document bulkWrite).
 * No downtime required.
 */

"use strict";

const mongoose = require("mongoose");
const config = require("../config");

const OLD_DOMAIN_RE = /https?:\/\/(www\.)?waxxapp\.com\//g;
const NEW_BASE = "https://www.j4market.com/";
const DRY = process.argv.includes("--dry");

// ─── helpers ────────────────────────────────────────────────────────────────

/**
 * Recursively walk a value and replace all occurrences of the old domain
 * in every string field. Returns a new value (or the same reference if
 * nothing changed) plus a boolean indicating whether any replacement was made.
 */
function rewriteValue(value) {
  if (typeof value === "string") {
    if (OLD_DOMAIN_RE.test(value)) {
      OLD_DOMAIN_RE.lastIndex = 0;
      return { result: value.replace(OLD_DOMAIN_RE, NEW_BASE), changed: true };
    }
    OLD_DOMAIN_RE.lastIndex = 0;
    return { result: value, changed: false };
  }

  if (Array.isArray(value)) {
    let anyChanged = false;
    const arr = value.map((item) => {
      const { result, changed } = rewriteValue(item);
      if (changed) anyChanged = true;
      return result;
    });
    return { result: anyChanged ? arr : value, changed: anyChanged };
  }

  if (value !== null && typeof value === "object" && !(value instanceof mongoose.Types.ObjectId) && !(value instanceof Date) && !Buffer.isBuffer(value)) {
    let anyChanged = false;
    const obj = {};
    for (const [k, v] of Object.entries(value)) {
      const { result, changed } = rewriteValue(v);
      obj[k] = result;
      if (changed) anyChanged = true;
    }
    return { result: anyChanged ? obj : value, changed: anyChanged };
  }

  return { result: value, changed: false };
}

/**
 * Build a flat $set patch from the diff between original and rewritten doc.
 * Only includes top-level fields that actually changed so we touch the
 * minimum number of bytes per update.
 */
function buildSetPatch(original, rewritten) {
  const patch = {};
  for (const key of Object.keys(rewritten)) {
    if (key === "_id") continue;
    if (JSON.stringify(original[key]) !== JSON.stringify(rewritten[key])) {
      patch[key] = rewritten[key];
    }
  }
  return patch;
}

// ─── main ───────────────────────────────────────────────────────────────────

async function migrateCollection(db, collectionName) {
  const collection = db.collection(collectionName);

  // Find only documents that contain the old domain somewhere in their JSON
  // representation. Using $regex on a stringified scan would be slow — instead
  // we query for any string field containing "waxxapp.com" using a $text or
  // $where approach. $where is flexible but slow on large collections; for
  // targeted collections this is fine as a one-shot script.
  const cursor = collection.find({
    $where: function () {
      return JSON.stringify(this).indexOf("waxxapp.com") !== -1;
    },
  });

  let total = 0;
  let changed = 0;
  const ops = [];

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    total++;

    const plain = doc;
    const { result: rewritten, changed: wasChanged } = rewriteValue(plain);

    if (!wasChanged) continue;
    changed++;

    const patch = buildSetPatch(plain, rewritten);
    if (Object.keys(patch).length === 0) continue;

    if (DRY) {
      console.log(`  [DRY] ${collectionName}/${doc._id} — would update:`, Object.keys(patch).join(", "));
    } else {
      ops.push({
        updateOne: {
          filter: { _id: doc._id },
          update: { $set: patch },
        },
      });

      // Flush in batches of 200 to avoid memory pressure
      if (ops.length >= 200) {
        await collection.bulkWrite(ops, { ordered: false });
        ops.length = 0;
      }
    }
  }

  // Flush remaining ops
  if (!DRY && ops.length > 0) {
    await collection.bulkWrite(ops, { ordered: false });
  }

  return { total, changed };
}

async function main() {
  console.log(`\n=== migrateDomain.js ${DRY ? "(DRY RUN)" : "(LIVE)"} ===`);
  console.log(`Old: https://(www.)waxxapp.com/`);
  console.log(`New: ${NEW_BASE}`);
  console.log("");

  await mongoose.connect(config.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  const names = collections.map((c) => c.name).sort();

  console.log(`Found ${names.length} collections: ${names.join(", ")}\n`);

  let grandTotal = 0;
  let grandChanged = 0;

  for (const name of names) {
    process.stdout.write(`  Scanning ${name}... `);
    try {
      const { total, changed } = await migrateCollection(db, name);
      grandTotal += total;
      grandChanged += changed;
      console.log(`${total} docs scanned, ${changed} updated`);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`Total docs scanned : ${grandTotal}`);
  console.log(`Total docs updated : ${grandChanged}`);
  if (DRY) {
    console.log("\nRe-run without --dry to apply changes.");
  } else {
    console.log("\nAll URLs rewritten. You can now remove the res.json()");
    console.log("rewrite middleware from backend/index.js and restart.");
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
