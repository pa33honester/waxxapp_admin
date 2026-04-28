// One-shot migration: copy the legacy bank-account fields onto the new
// mobile-money fields under `bankDetails`, then drop the legacy keys.
//
// Renames performed (on every Seller and SellerRequest doc):
//   bankDetails.accountNumber  → bankDetails.momoNumber   (cast to String)
//   bankDetails.IFSCCode       → bankDetails.networkName  (best-effort enum match)
//   bankDetails.branchName     → bankDetails.momoName
//
// `networkName` is restricted to the enum {MTN, Vodafone, AirtelTigo}. If
// the legacy IFSCCode value doesn't match (case-insensitive), networkName
// is left null and the seller will be prompted to pick one next time they
// edit their payout details. The original IFSC text is dropped — it has
// no meaning on the mobile-money side.
//
// Usage:
//   node scripts/migrate_seller_momo.js
// Idempotent — re-running after the legacy keys are gone is a no-op.

const mongoose = require("mongoose");
const config = require("../config");

const NETWORK_ALIASES = {
  mtn: "MTN",
  vodafone: "Vodafone",
  voda: "Vodafone",
  airtel: "AirtelTigo",
  tigo: "AirtelTigo",
  airteltigo: "AirtelTigo",
  "airtel-tigo": "AirtelTigo",
  "airtel tigo": "AirtelTigo",
};

function normaliseNetwork(legacyValue) {
  if (legacyValue == null) return null;
  const key = String(legacyValue).trim().toLowerCase().replace(/\s+/g, "");
  return NETWORK_ALIASES[key] || null;
}

async function migrateCollection(collection, label) {
  let scanned = 0;
  let migrated = 0;
  const cursor = collection.find({
    $or: [
      { "bankDetails.accountNumber": { $exists: true } },
      { "bankDetails.IFSCCode": { $exists: true } },
      { "bankDetails.branchName": { $exists: true } },
    ],
  });

  // eslint-disable-next-line no-await-in-loop
  for await (const doc of cursor) {
    scanned += 1;
    const legacy = doc.bankDetails || {};
    const update = {};
    const unset = {};

    if (legacy.accountNumber != null && legacy.accountNumber !== "") {
      update["bankDetails.momoNumber"] = String(legacy.accountNumber);
    }
    if (legacy.IFSCCode != null && legacy.IFSCCode !== "") {
      const network = normaliseNetwork(legacy.IFSCCode);
      if (network) update["bankDetails.networkName"] = network;
    }
    if (legacy.branchName != null && legacy.branchName !== "") {
      update["bankDetails.momoName"] = String(legacy.branchName);
    }

    unset["bankDetails.accountNumber"] = "";
    unset["bankDetails.IFSCCode"] = "";
    unset["bankDetails.branchName"] = "";

    await collection.updateOne(
      { _id: doc._id },
      {
        ...(Object.keys(update).length ? { $set: update } : {}),
        $unset: unset,
      }
    );
    migrated += 1;
  }

  console.log(`${label}: scanned ${scanned}, migrated ${migrated}`);
}

async function run() {
  await mongoose.connect(config.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("connected to:", config.MONGODB_CONNECTION_STRING);

  const db = mongoose.connection.db;
  await migrateCollection(db.collection("sellers"), "sellers");
  await migrateCollection(db.collection("sellerrequests"), "sellerrequests");

  await mongoose.disconnect();
  console.log("done");
}

run().catch((err) => {
  console.error("migration failed:", err);
  process.exit(1);
});
