// One-shot migration: add the phoneVerified flag to all existing users,
// and set a default password ("123456") for any user who has no password
// (primarily phone-signup users who never set one).
//
// What it does:
//   1. Users with a non-null mobileNumber are marked phoneVerified: true.
//   2. All other users get phoneVerified: false.
//   3. Users with password: null get a default Cryptr-encrypted password
//      of "123456" so they can log in via email + Forgot Password flow.
//      Only users WITHOUT a password are affected — existing passwords
//      are never overwritten.
//
// Usage (run once, against a backed-up DB — BEFORE deploying the backend
// that adds the phoneVerified field to the schema):
//   node scripts/migrate_phone_verified.js
//
// Idempotent — safe to re-run (step 3 skips users who already have a password).

const mongoose = require("mongoose");
const Cryptr = require("cryptr");
const config = require("../config");
const User = require("../server/user/user.model");

// Must match the key used in user.controller.js
const cryptr = new Cryptr("myTotallySecretKey");
const DEFAULT_PASSWORD = "123456";
const encryptedDefault = cryptr.encrypt(DEFAULT_PASSWORD);

async function run() {
  await mongoose.connect(config.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("connected to:", config.MONGODB_CONNECTION_STRING);

  // 1. Mark users who already have a phone as verified.
  const verifiedResult = await User.updateMany(
    { mobileNumber: { $ne: null } },
    { $set: { phoneVerified: true } }
  );
  console.log(`phoneVerified=true  → ${verifiedResult.modifiedCount} users updated`);

  // 2. Ensure users without a phone have the field set to false.
  const unverifiedResult = await User.updateMany(
    { mobileNumber: null, phoneVerified: { $exists: false } },
    { $set: { phoneVerified: false } }
  );
  console.log(`phoneVerified=false → ${unverifiedResult.modifiedCount} users updated`);

  // 3. Set default password for users who have no password at all.
  //    Does NOT touch users who already have a password.
  const passwordResult = await User.updateMany(
    { password: null },
    { $set: { password: encryptedDefault } }
  );
  console.log(`default password set → ${passwordResult.modifiedCount} users updated`);

  await mongoose.disconnect();
  console.log("done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
