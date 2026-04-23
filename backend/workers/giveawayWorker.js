const Bull = require("bull");

const giveawayQueue = new Bull("giveaway-queue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

giveawayQueue.process("autoDrawGiveaway", async (job) => {
  // Lazy require so the controller can load before the worker (they cross-reference).
  const { drawGiveawayInternal } = require("../server/giveaway/giveaway.controller");
  const { giveawayId } = job.data || {};
  if (!giveawayId) return;
  console.log(`[giveawayWorker] auto-drawing giveaway ${giveawayId}`);
  try {
    await drawGiveawayInternal({ giveawayId });
  } catch (err) {
    console.error("[giveawayWorker] drawGiveawayInternal failed:", err);
  }
});

giveawayQueue.on("completed", (job) => {
  console.log(`[giveawayWorker] Job ${job.id} completed`);
});
giveawayQueue.on("error", (err) => {
  console.error("[giveawayWorker] Queue Error:", err);
});
giveawayQueue.on("failed", (job, err) => {
  console.error(`[giveawayWorker] Job ${job.id} failed: ${err.message}`);
});

module.exports = { giveawayQueue };
