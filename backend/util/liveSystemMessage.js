/**
 * Emit a Whatnot-style system message into the live chat stream for a
 * broadcast. Renders as a pinned/chipped message on the Flutter client
 * (see waxx_app/lib/custom/live_system_message.dart).
 *
 * Envelope matches the regular "comment" event shape the client already
 * listens to, plus a `type: "SYSTEM"` discriminator + `systemType`.
 *
 * systemType ∈ { "SOLD", "BID", "GIVEAWAY_WIN", "FOLLOW" }
 *
 * Safe to call before io is initialized — silently no-ops if global.io is
 * missing or the room doesn't exist.
 */
function emitLiveSystemMessage({ liveSellingHistoryId, systemType, userName = "", text = "" }) {
  try {
    if (!global.io || !liveSellingHistoryId) return;
    const payload = JSON.stringify({
      type: "SYSTEM",
      systemType,
      userName,
      text,
      ts: Date.now(),
    });
    global.io.in("liveSellerRoom:" + liveSellingHistoryId.toString()).emit("comment", payload);
  } catch (err) {
    console.error("emitLiveSystemMessage failed:", err);
  }
}

module.exports = { emitLiveSystemMessage };
