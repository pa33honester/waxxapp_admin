/**
 * migrate-urls.js
 *
 * One-time migration: rewrite all stored waxxapp.com image/file URLs to the
 * current domain (j4market.com).  Safe to run multiple times — documents
 * that no longer contain the old origin are untouched.
 *
 * Usage (on the server, from backend/):
 *   node scripts/migrate-urls.js
 */

const mongoose = require("mongoose");
const config = require("../config");

const OLD_ORIGIN = "https://www.waxxapp.com";
const NEW_ORIGIN = new URL(config.baseURL).origin; // e.g. "https://www.j4market.com"
const OLD_REGEX = /https?:\/\/www\.waxxapp\.com/;

if (OLD_ORIGIN === NEW_ORIGIN) {
  console.log("OLD_ORIGIN === NEW_ORIGIN — nothing to migrate.");
  process.exit(0);
}

console.log(`Migrating: ${OLD_ORIGIN}  →  ${NEW_ORIGIN}\n`);

// ── Aggregation-pipeline helpers ─────────────────────────────────────────────

const replaceStr = (fieldPath) => ({
  $replaceAll: {
    input: { $ifNull: [`$${fieldPath}`, ""] },
    find: OLD_ORIGIN,
    replacement: NEW_ORIGIN,
  },
});

const replaceStrArray = (fieldPath) => ({
  $map: {
    input: { $ifNull: [`$${fieldPath}`, []] },
    as: "u",
    in: { $replaceAll: { input: "$$u", find: OLD_ORIGIN, replacement: NEW_ORIGIN } },
  },
});

const replaceInObjArray = (arrayPath, subField) => ({
  $map: {
    input: { $ifNull: [`$${arrayPath}`, []] },
    as: "item",
    in: {
      $mergeObjects: [
        "$$item",
        {
          [subField]: {
            $replaceAll: {
              input: { $ifNull: [`$$item.${subField}`, ""] },
              find: OLD_ORIGIN,
              replacement: NEW_ORIGIN,
            },
          },
        },
      ],
    },
  },
});

// ── Migration runner ──────────────────────────────────────────────────────────

async function migrate(db, collName, matchFilter, updateSpec) {
  const coll = db.collection(collName);
  const result = await coll.updateMany(matchFilter, [{ $set: updateSpec }]);
  const tag = result.modifiedCount > 0 ? "✓" : "-";
  console.log(`  ${tag}  ${collName}: ${result.modifiedCount} updated`);
  return result.modifiedCount;
}

function strFilter(...fields) {
  return { $or: fields.map((f) => ({ [f]: OLD_REGEX })) };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  await mongoose.connect(config.MONGODB_CONNECTION_STRING);
  console.log("Connected.\n");
  const db = mongoose.connection.db;
  let total = 0;

  // ── Simple flat string fields ────────────────────────────────────────────
  const simple = [
    { coll: "admins",           fields: ["image"] },
    { coll: "categories",       fields: ["image"] },
    { coll: "subcategories",    fields: ["image"] },
    { coll: "livechats",        fields: ["userImage"] },
    { coll: "livesellingviews", fields: ["image"] },
    { coll: "notifications",    fields: ["image"] },
    { coll: "reels",            fields: ["thumbnail", "video"] },
    { coll: "scheduledlives",   fields: ["image"] },
    {
      coll: "sellers",
      fields: ["image", "logo", "govId", "govIdFront", "govIdBack",
               "registrationCert", "addressProof", "video"],
    },
    {
      coll: "sellerrequests",
      fields: ["image", "logo", "govId", "govIdFront", "govIdBack",
               "registrationCert", "addressProof"],
    },
    { coll: "users",         fields: ["image"] },
    { coll: "verifications", fields: ["selfieFile"] },
    { coll: "withdraws",     fields: ["image"] },
  ];

  for (const { coll, fields } of simple) {
    const spec = Object.fromEntries(fields.map((f) => [f, replaceStr(f)]));
    total += await migrate(db, coll, strFilter(...fields), spec);
  }

  // ── Products: mainImage (string) + images (array of strings) ────────────
  total += await migrate(
    db,
    "products",
    { $or: [{ mainImage: OLD_REGEX }, { images: OLD_REGEX }] },
    { mainImage: replaceStr("mainImage"), images: replaceStrArray("images") }
  );

  // ── ProductRequests: same shape ──────────────────────────────────────────
  total += await migrate(
    db,
    "productrequests",
    { $or: [{ mainImage: OLD_REGEX }, { images: OLD_REGEX }] },
    { mainImage: replaceStr("mainImage"), images: replaceStrArray("images") }
  );

  // ── LiveSellers: flat image + selectedProducts[].mainImage ───────────────
  total += await migrate(
    db,
    "livesellers",
    { $or: [{ image: OLD_REGEX }, { "selectedProducts.mainImage": OLD_REGEX }] },
    {
      image: replaceStr("image"),
      selectedProducts: replaceInObjArray("selectedProducts", "mainImage"),
    }
  );

  // ── Attributes: attributes[].image ──────────────────────────────────────
  total += await migrate(
    db,
    "attributes",
    { "attributes.image": OLD_REGEX },
    { attributes: replaceInObjArray("attributes", "image") }
  );

  // ── ProductChatConversations: productSnapshot.image + messages[].senderImage
  total += await migrate(
    db,
    "productchatconversations",
    { $or: [{ "productSnapshot.image": OLD_REGEX }, { "messages.senderImage": OLD_REGEX }] },
    {
      "productSnapshot.image": replaceStr("productSnapshot.image"),
      messages: replaceInObjArray("messages", "senderImage"),
    }
  );

  // ── SupportConversations: messages[].senderImage ─────────────────────────
  total += await migrate(
    db,
    "supportconversations",
    { "messages.senderImage": OLD_REGEX },
    { messages: replaceInObjArray("messages", "senderImage") }
  );

  console.log(`\nDone. ${total} document(s) updated across all collections.`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
