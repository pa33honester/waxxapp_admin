// One-shot migration: normalise + de-duplicate User.email so the partial
// unique index added in user.model.js can build cleanly.
//
// What it does:
//   1. Trims and lower-cases every non-empty `User.email`.
//   2. For any duplicate non-empty email, keeps the **oldest** account as-is
//      and clears `email = ""` on the rest. Those users will be re-prompted
//      to add an email by the in-app backfill sheet (see lib/main.dart).
//   3. Builds the partial unique index so future inserts/updates collide
//      cleanly when a duplicate is attempted.
//
// Usage (run once, against a backed-up DB):
//   node scripts/migrate_user_email.js
//
// Idempotent — safe to re-run; rows already normalised are no-ops.

const mongoose = require("mongoose");
const config = require("../config");
const User = require("../server/user/user.model");

async function run() {
  await mongoose.connect(config.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("connected to:", config.MONGODB_CONNECTION_STRING);

  // 1. Normalise casing/whitespace on all non-empty emails.
  const rawDocs = await User.find({ email: { $type: "string", $ne: "" } }, { email: 1 }).lean();
  let normalised = 0;
  for (const doc of rawDocs) {
    const cleaned = String(doc.email).trim().toLowerCase();
    if (cleaned !== doc.email) {
      await User.updateOne({ _id: doc._id }, { $set: { email: cleaned } });
      normalised += 1;
    }
  }
  console.log(`step 1: normalised ${normalised} email rows`);

  // 2. Find duplicate emails (after normalisation) and clear the newer ones.
  const dupes = await User.aggregate([
    { $match: { email: { $type: "string", $ne: "" } } },
    { $group: { _id: "$email", ids: { $push: { _id: "$_id", createdAt: "$createdAt" } }, count: { $sum: 1 } } },
    { $match: { count: { $gt: 1 } } },
  ]);

  let cleared = 0;
  for (const group of dupes) {
    const sorted = group.ids.slice().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const losers = sorted.slice(1).map((x) => x._id);
    if (losers.length === 0) continue;
    await User.updateMany({ _id: { $in: losers } }, { $set: { email: "" } });
    cleared += losers.length;
    console.log(`  duplicate "${group._id}" → kept ${sorted[0]._id}, cleared ${losers.length}`);
  }
  console.log(`step 2: cleared ${cleared} duplicate emails`);

  // 3. Ensure the index is built. mongoose.syncIndexes() drops and rebuilds
  //    indexes to match the schema; safe because the schema only adds one
  //    new unique index plus the existing non-unique ones.
  await User.syncIndexes();
  console.log("step 3: indexes synced");

  await mongoose.disconnect();
  console.log("done");
}

run().catch((err) => {
  console.error("migration failed:", err);
  process.exit(1);
});
