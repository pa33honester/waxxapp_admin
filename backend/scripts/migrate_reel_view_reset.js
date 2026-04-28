// One-shot migration: reset Reel.view counts so the new per-user dedupe
// (ViewHistoryOfReel compound unique index) starts from a clean baseline.
//
// What it does:
//   1. Sets `Reel.view = 0` on every reel — including legacy rows that
//      pre-date the field, so the projected `$ifNull: 0` in
//      getReelsForUser is replaced by an actual stored 0.
//   2. Wipes the ViewHistoryOfReel collection so previously-counted views
//      don't lock new users into duplicate-key no-ops on re-views.
//   3. Builds the compound unique index on (userId, reelId) so future
//      inserts collide cleanly.
//
// Usage (run once, against a backed-up DB, after deploying the
// incrementView dedupe code):
//   node scripts/migrate_reel_view_reset.js
//
// Idempotent — safe to re-run; the ops are unconditional sets/deletes.

const mongoose = require("mongoose");
const config = require("../config");
const Reel = require("../server/reel/reel.model");
const ViewHistoryOfReel = require("../server/viewHistoryOfReel/viewHistoryOfReel.model");

async function run() {
  await mongoose.connect(config.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("connected to:", config.MONGODB_CONNECTION_STRING);

  // 1. Zero out every reel's view counter.
  const reelReset = await Reel.updateMany({}, { $set: { view: 0 } });
  console.log(`step 1: reset Reel.view = 0 on ${reelReset.modifiedCount} rows (matched ${reelReset.matchedCount})`);

  // 2. Clear any prior view-history rows so the dedupe table starts empty.
  const historyDel = await ViewHistoryOfReel.deleteMany({});
  console.log(`step 2: deleted ${historyDel.deletedCount} ViewHistoryOfReel rows`);

  // 3. Ensure the (userId, reelId) compound unique index is built.
  await ViewHistoryOfReel.syncIndexes();
  console.log("step 3: ViewHistoryOfReel indexes synced");

  await mongoose.disconnect();
  console.log("done");
}

run().catch((err) => {
  console.error("migration failed:", err);
  process.exit(1);
});
