const Order = require("../server/order/order.model");

const mongoose = require("mongoose");
const Bull = require("bull");
const paymentQueue = new Bull("validate-payment-queue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

paymentQueue.process("validatePaymentCompletion", async (job) => {
  console.log(`Job ID: ${job.id}`);
  console.log(`Name: ${job.name}`);
  console.log(`Data validatePaymentCompletion:`, job.data);
  console.log(`Status: ${await job.getState()}`);

  const { orderId, itemId, productId } = job.data;

  const order = await Order.findOne(
    {
      _id: orderId,
      "items._id": itemId,
      "items.status": "Manual Auction Pending Payment",
    },
    {
      "items.$": 1,
      createdAt: 1,
    }
  ).lean();

  if (
    order &&
    order.items &&
    order.items.length > 0 &&
    new Date() > new Date(order.createdAt.getTime() + Number(settingJSON.paymentReminderForLiveAuction) * 60 * 1000) //Delay the execution of the job by minutes
  ) {
    console.log("Update that specific item to manual-auction-cancelled");

    await Promise.all([
      AuctionBid.deleteMany({
        mode: 2,
        productId: new mongoose.Types.ObjectId(productId),
      }),
      Order.updateOne(
        { _id: orderId, "items._id": itemId },
        {
          $set: {
            "items.$.status": "Manual Auction Cancelled",
          },
        }
      ),
    ]);
  }
});

paymentQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed!`);
});

paymentQueue.on("error", (err) => {
  console.error("Queue Error:", err);
});

paymentQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});
