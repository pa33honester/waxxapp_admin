// One-shot migration: relabel every order item currently at status "Delivered"
// to "Complete" so historical orders fit the new flow (Delivered = buyer confirmed,
// Complete = admin released funds).
//
// IMPORTANT — STATUS RELABEL ONLY. Do NOT touch SellerWallet or Seller.netPayout.
// Under the old code path, the wallet credit ($inc netPayout + SellerWallet deposit row)
// already fired at the original Delivered transition. Re-running anything that touches
// wallets here would double-credit every historical order.
//
// Usage:
//   node scripts/migrate_delivered_to_complete.js
// Idempotent — second run finds zero matching items and exits clean.

const mongoose = require("mongoose");
const config = require("../config");

async function run() {
  await mongoose.connect(config.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("connected to:", config.MONGODB_CONNECTION_STRING);

  const db = mongoose.connection.db;
  const orders = db.collection("orders");

  const matched = await orders.countDocuments({ "items.status": "Delivered" });
  console.log(`orders containing at least one Delivered item: ${matched}`);

  const result = await orders.updateMany(
    { "items.status": "Delivered" },
    { $set: { "items.$[el].status": "Complete" } },
    { arrayFilters: [{ "el.status": "Delivered" }] }
  );

  console.log(`updated ${result.modifiedCount} order documents (Delivered -> Complete)`);
  console.log("NOTE: no wallet or netPayout changes were made — historical credits are preserved.");

  await mongoose.disconnect();
  console.log("done");
}

run().catch((err) => {
  console.error("migration failed:", err);
  process.exit(1);
});
