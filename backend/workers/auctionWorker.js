const LiveStreamer = require("../server/liveSeller/liveSeller.model");
const Order = require("../server/order/order.model");
const Product = require("../server/product/product.model");

const mongoose = require("mongoose");
const Bull = require("bull");
const auctionQueue = new Bull("auction-queue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

auctionQueue.process("checkPaymentStatus", async (job) => {
  console.log(`Job ID: ${job.id}`);
  console.log(`Name: ${job.name}`);
  console.log(`Data:`, job.data);
  console.log(`Status: ${await job.getState()}`);

  const { orderId, itemId, productId, liveStreamerId, liveHistoryId, socketId } = job.data;

  const order = await Order.findOne(
    {
      _id: orderId,
      "items._id": itemId,
      "items.status": "Auction Pending Payment",
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
    // Update that specific item to auction-cancelled
    await Order.updateOne(
      { _id: orderId, "items._id": itemId },
      {
        $set: {
          "items.$.status": "Auction Cancelled",
        },
      }
    );

    const [product, liveStreamer] = await Promise.all([
      Product.findById(productId).select("_id productName shippingCharges mainImage productCode").lean(),
      LiveStreamer.findOne({
        sellerId: new mongoose.Types.ObjectId(liveStreamerId),
        liveSellingHistoryId: new mongoose.Types.ObjectId(liveHistoryId),
        liveType: 2,
      })
        .select("_id selectedProducts")
        .lean(),
    ]);

    const selectedProduct = liveStreamer?.selectedProducts.find((item) => item?.productId.toString() === productId.toString());
    const productAttributes = selectedProduct?.productAttributes || [];
    console.log("productAttributes:", productAttributes);

    if (liveStreamer) {
      const targetSocket = io.sockets.sockets.get(socketId);
      if (targetSocket) {
        console.log("Target socket exists, emitting...");

        targetSocket.emit("handleAuctionExpiryAndRelist", {
          productId,
          orderId,
          itemId,
          liveHistoryId,
          liveStreamerId,
          productName: product.productName || "",
          mainImage: product.mainImage || "",
          shippingCharges: product.shippingCharges || 0,
          productAttributes: productAttributes,
          type: 2,
        });
      } else {
        console.log("Target socket not found for socketId:", socketId);
      }

      console.log(`Auction payment not received. Do you want to relist or remove this product? Emitted relist/remove option to liveStreamer ${liveStreamerId}`);
    }
  }
});

auctionQueue.on("completed", (job) => {
  console.log(`Job ${job.id} completed!`);
});

auctionQueue.on("error", (err) => {
  console.error("Queue Error:", err);
});

auctionQueue.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});
