// One-shot migration: add the phoneVerified flag to all existing users.
//
// What it does:
//   1. Users with a non-null mobileNumber already went through phone OTP
//      (either via Firebase mobile-login or the changePhone flow), so they
//      are marked phoneVerified: true.
//   2. All other users get phoneVerified: false and will be prompted to
//      verify after their next login.
//
// Usage (run once, against a backed-up DB — BEFORE deploying the backend
// that adds the phoneVerified field to the schema):
//   node scripts/migrate_phone_verified.js
//
// Idempotent — safe to re-run.

const mongoose = require("mongoose");
const config = require("../config");
const User = require("../server/user/user.model");

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

  await mongoose.disconnect();
  console.log("done.");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
