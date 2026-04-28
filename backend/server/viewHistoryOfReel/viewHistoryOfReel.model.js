const mongoose = require("mongoose");

// One row per (userId, reelId) — the compound unique index does the
// per-user dedupe. The `incrementView` controller only bumps `Reel.view`
// when an insert here actually succeeds (i.e. this user hasn't viewed
// this reel before). Duplicate-key errors on subsequent attempts are
// caught and treated as a no-op so the count stays accurate.
const viewHistoryOfReelSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    reelId: { type: mongoose.Schema.Types.ObjectId, ref: "Reel", default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

viewHistoryOfReelSchema.index({ userId: 1, reelId: 1 }, { unique: true });
viewHistoryOfReelSchema.index({ reelId: 1 });

module.exports = mongoose.model("ViewHistoryOfReel", viewHistoryOfReelSchema);
