const Bull = require("bull");

const Product = require("../server/product/product.model");
const AuctionBid = require("../server/auctionBid/auctionBid.model");
const Seller = require("../server/seller/seller.model");
const Order = require("../server/order/order.model");
const User = require("../server/user/user.model");

const admin = require("../util/privateKey");
const { findOrCreatePendingOrderForSeller } = require("../util/orderAggregator");

const manualAuctionQueue = new Bull("manual-auction-queue", {
  redis: { host: "127.0.0.1", port: 6379 },
});

const paymentQueue = new Bull("validate-payment-queue", {
  redis: {
    host: "127.0.0.1",
    port: 6379,
  },
});

manualAuctionQueue.process("closeManualAuction", async (job) => {
  console.log(`closeManualAuction Data:`, job.data);

  const { productId } = job.data;

  const [product, topBid] = await Promise.all([
    Product.findById(productId).select("seller productName title mainImage shippingCharges productCode attributes enableAuction productSaleType enableReservePrice reservePrice").lean(),
    AuctionBid.findOne({ productId, mode: 2, isWinningBid: false }).sort({ currentBid: -1 }).lean(),
  ]);

  if (!product || !product.enableAuction || product.productSaleType !== 2) {
    console.log(`Invalid product or auction for productId: ${productId}`);
    return;
  }

  if (!topBid) {
    await Product.findByIdAndUpdate(productId, {
      productSaleType: 3,
      isOutOfStock: false,
    });

    console.log(`Auction ended. No bids. Product NOT sold. productId: ${productId}`);
    return;
  }

  // Top bidder always wins if there is any bid
  const adminRate = settingJSON.adminCommissionCharges || 10;
  const reminderMinutes = Number(settingJSON.paymentReminderForManualAuction);

  const [seller, buyer, { order }] = await Promise.all([
    Seller.findOne({ _id: product.seller }).select("isBlock fcmToken"),
    User.findOne({ _id: topBid.userId }).select("isBlock fcmToken firstName"),
    // Append this win to any existing unpaid bundle from the same seller so
    // the buyer pays one combined shipping fee for the whole show's wins.
    findOrCreatePendingOrderForSeller({
      buyerId: topBid.userId,
      sellerId: product.seller,
      newItem: {
        productId: product._id,
        sellerId: product.seller,
        purchasedTimeProductPrice: topBid.currentBid,
        purchasedTimeShippingCharges: product.shippingCharges || 0,
        productCode: product.productCode || "",
        productQuantity: 1,
        attributesArray: topBid.attributes,
        commissionPerProductQuantity: (topBid.currentBid * adminRate) / 100,
        itemDiscount: 0,
        status: "Bundle Pending Payment",
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      },
      orderIdPrefix: "AU",
      settingJSON,
    }),
    Product.findByIdAndUpdate(productId, {
      productSaleType: 3,
      // isOutOfStock: true,
    }),
    AuctionBid.updateMany({ productId, mode: 2 }, { $set: { isWinningBid: false } }),
  ]);

  // Preserve the worker's existing reminder-snapshot behaviour on the
  // Order doc so the validatePaymentCompletion job keeps working.
  if (order.manualAuctionPaymentReminderDuration == null || order.manualAuctionPaymentReminderDuration === 0) {
    order.manualAuctionPaymentReminderDuration = reminderMinutes;
    await order.save();
  }

  // With bundling, the newly-added win is always the last item in the array.
  const itemId = order.items[order.items.length - 1]._id;

  await Promise.all([
    AuctionBid.findByIdAndUpdate(topBid._id, {
      $set: { isWinningBid: true },
    }),
    paymentQueue.add(
      "validatePaymentCompletion",
      {
        orderId: order._id,
        productId,
        itemId,
      },
      {
        delay: reminderMinutes * 60 * 1000,
        removeOnComplete: true,
        removeOnFail: true,
      }
    ),
  ]);

  console.log(`Auction completed. Winner userId: ${topBid.userId}, Amount: ${topBid.currentBid}`);
  console.log(`Auction completed. seller: ${seller}`);
  console.log(`Auction completed. buyer: ${buyer}`);

  // Notify Seller
  if (!seller.isBlock && seller.fcmToken !== null) {
    const payload = {
      token: seller.fcmToken,
      notification: {
        title: `🎉 Your product just SOLD at auction!`,
        body: `🏆 ${buyer?.firstName || "A user"} won the bid for “${product?.title || product?.productName}” at ${topBid.currentBid}.`,
      },
      data: {
        type: "AUCTION_WIN",
      },
    };

    const adminPromise = await admin;
    adminPromise
      .messaging()
      .send(payload)
      .then((response) => {
        console.log("Successfully sent to seller: ", response);
      })
      .catch((error) => {
        console.log("Error sending to seller: ", error);
      });
  }

  // Notify Buyer
  if (!buyer.isBlock && buyer.fcmToken !== null) {
    const payload = {
      token: buyer.fcmToken,
      notification: {
        title: `🥇 You won the auction!`,
        body: `🎯 You placed the highest bid for “${product.title}” at ${topBid.currentBid}. Complete payment within ${reminderMinutes} minutes.`,
      },
      data: {
        type: "AUCTION_SUCCESS",
        orderId: String(order._id),
        itemId: String(itemId),
        productId: String(productId),
        productAttributes: JSON.stringify(product.attributes || {}),
        amount: String(topBid.currentBid),
        productName: String(product.productName || ""),
        mainImage: String(product.mainImage || ""),
        shippingCharges: String(product.shippingCharges || 0),
        reminderMinutes: String(reminderMinutes),
      },
    };

    const adminPromise = await admin;
    adminPromise
      .messaging()
      .send(payload)
      .then((response) => {
        console.log("Successfully sent to buyer: ", response);
      })
      .catch((error) => {
        console.log("Error sending to buyer: ", error);
      });
  }
});

manualAuctionQueue.on("completed", (job) => {
  console.log(`Manual Auction Job ${job.id} completed`);
});

manualAuctionQueue.on("failed", (job, err) => {
  console.error(`Manual Auction Job ${job.id} failed: ${err.message}`);
});
