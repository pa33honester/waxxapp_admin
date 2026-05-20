const Order = require("../server/order/order.model");
const Product = require("../server/product/product.model");

const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;
const POLL_INTERVAL_MS = 60 * 60 * 1000; // run once per hour

async function autoConfirmDeliveries() {
  try {
    const cutoff = new Date(Date.now() - FORTY_EIGHT_HOURS_MS);

    // Find all order documents that have at least one Out Of Delivery item past the cutoff.
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
    console.error("[autoDeliveryWorker] Error:", err);
  }
}

// Run once at boot, then on interval.
autoConfirmDeliveries();
setInterval(autoConfirmDeliveries, POLL_INTERVAL_MS);

console.log("[autoDeliveryWorker] Started — checks every hour for Out Of Delivery items past 48h");
