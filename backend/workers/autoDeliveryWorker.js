const Order = require("../server/order/order.model");
const Product = require("../server/product/product.model");

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
const POLL_INTERVAL_MS = 60 * 60 * 1000; // run once per hour

// Count non-Sunday hours elapsed since `since`. Sundays (getDay() === 0)
// are excluded from the seller's 48-hour delivery commitment window.
function nonSundayHoursElapsed(since) {
  const now = Date.now();
  let hours = 0;
  let cursor = new Date(since).getTime();
  const ONE_HOUR = 3600000;
  while (cursor < now) {
    if (new Date(cursor).getDay() !== 0) hours++;
    cursor += ONE_HOUR;
  }
  return hours;
}

// Delivery Requested → Cancelled: seller failed to submit tracking within
// 48 working hours (Sundays excluded) of committing to ship.
async function autoCancelStaleDeliveryRequests() {
  try {
    const orders = await Order.find({
      items: { $elemMatch: { status: "Delivery Requested", deliveryRequestedAt: { $ne: null } } },
    }).select("_id items");

    if (orders.length === 0) return;

    for (const order of orders) {
      for (const item of order.items) {
        if (item.status !== "Delivery Requested") continue;
        if (!item.deliveryRequestedAt) continue;
        if (nonSundayHoursElapsed(item.deliveryRequestedAt) < 48) continue;

        await Order.updateOne(
          { _id: order._id, "items._id": item._id, "items.status": "Delivery Requested" },
          { $set: { "items.$.status": "Cancelled" } }
        );

        console.log(`[autoDeliveryWorker] Auto-cancelled delivery-request for item ${item._id} in order ${order._id} (48 working hours exceeded)`);
      }
    }
  } catch (err) {
    console.error("[autoDeliveryWorker] autoCancelStaleDeliveryRequests error:", err);
  }
}

// Out Of Delivery → Delivered: buyer did not tap Accept Delivery within 48h
// of the seller submitting tracking (calendar hours, Sundays included).
async function autoConfirmDeliveries() {
  try {
    const cutoff = new Date(Date.now() - FORTY_EIGHT_HOURS_MS);

    const orders = await Order.find({
      items: {
        $elemMatch: {
          status: "Out Of Delivery",
          deliveryStartedAt: { $lte: cutoff },
        },
      },
    }).select("_id items userId");

    if (orders.length === 0) return;

    console.log(`[autoDeliveryWorker] Processing ${orders.length} order(s) with stale Out Of Delivery items`);

    for (const order of orders) {
      for (const item of order.items) {
        if (item.status !== "Out Of Delivery") continue;
        if (!item.deliveryStartedAt) continue;
        if (new Date(item.deliveryStartedAt).getTime() > cutoff.getTime()) continue;

        await Promise.all([
          Order.updateOne(
            { _id: order._id, "items._id": item._id, "items.status": "Out Of Delivery" },
            { $set: { "items.$.status": "Delivered" } }
          ),
          Product.updateOne({ _id: item.productId }, { $inc: { sold: item.productQuantity } }),
        ]);

        console.log(`[autoDeliveryWorker] Auto-confirmed delivery for item ${item._id} in order ${order._id}`);
      }
    }
  } catch (err) {
    console.error("[autoDeliveryWorker] autoConfirmDeliveries error:", err);
  }
}

async function runAll() {
  await autoCancelStaleDeliveryRequests();
  await autoConfirmDeliveries();
}

// Run once at boot, then hourly.
runAll();
setInterval(runAll, POLL_INTERVAL_MS);

console.log("[autoDeliveryWorker] Started — checks every hour for stale Delivery Requested (48h excl Sun → Cancel) and Out Of Delivery (48h → Delivered)");
