const mongoose = require("mongoose");

const Order = require("../server/order/order.model");
const Seller = require("../server/seller/seller.model");

// Statuses that mean "item is part of a pending payment bundle the buyer
// still owes us for". Used to match an in-flight Order we can extend.
const PENDING_PAYMENT_STATUSES = [
  "Pending",
  "Auction Pending Payment",
  "Manual Auction Pending Payment",
  "Bundle Pending Payment",
];

// Recomputes an Order's aggregate totals after items are added or removed.
// Shipping mode follows the seller's configured rule — max (Whatnot default:
// one fee for the heaviest-ship item), sum (legacy behaviour: add every
// item's shipping), or flat (ignore per-item charges entirely).
function _recomputeOrderTotals(order, shippingMode) {
  const items = order.items || [];
  const subTotal = items.reduce(
    (acc, it) => acc + (Number(it.purchasedTimeProductPrice) || 0) * (Number(it.productQuantity) || 1),
    0
  );

  let shipping = 0;
  if (shippingMode === "max") {
    shipping = items.reduce((acc, it) => Math.max(acc, Number(it.purchasedTimeShippingCharges) || 0), 0);
  } else if (shippingMode === "flat") {
    shipping = items.length > 0 ? Number(items[0].purchasedTimeShippingCharges) || 0 : 0;
  } else {
    // "sum" (legacy) and anything unrecognised
    shipping = items.reduce((acc, it) => acc + (Number(it.purchasedTimeShippingCharges) || 0), 0);
  }

  order.subTotal = subTotal;
  order.total = subTotal;
  order.totalShippingCharges = shipping;
  order.finalTotal = subTotal + shipping;
  order.totalItems = items.length;
  order.totalQuantity = items.reduce((acc, it) => acc + (Number(it.productQuantity) || 1), 0);
}

/**
 * Finds an existing unpaid Order from `buyerId` to `sellerId` we can append
 * `newItem` to, or creates a fresh one. The shipping aggregation follows
 * the seller's `shippingMode` setting (default "max").
 *
 * @param {Object} opts
 * @param {String|ObjectId} opts.buyerId
 * @param {String|ObjectId} opts.sellerId
 * @param {Object} opts.newItem       Already-shaped Order.items[] sub-doc.
 *                                    Must include productId, sellerId,
 *                                    purchasedTimeProductPrice, shipping,
 *                                    productQuantity, status.
 * @param {String} [opts.orderIdPrefix='BU']  Only used when creating a
 *                                    brand-new Order row.
 * @param {Object} [opts.settingJSON]
 * @returns {Promise<{ order, isNew, shippingMode }>}
 */
async function findOrCreatePendingOrderForSeller({
  buyerId,
  sellerId,
  newItem,
  orderIdPrefix = "BU",
  settingJSON = {},
}) {
  const buyerObj = typeof buyerId === "string" ? new mongoose.Types.ObjectId(buyerId) : buyerId;
  const sellerObj = typeof sellerId === "string" ? new mongoose.Types.ObjectId(sellerId) : sellerId;

  const seller = await Seller.findById(sellerObj).select("shippingMode").lean();
  const shippingMode = (seller && seller.shippingMode) || "max";

  // Find an existing unpaid bundle Order for this (buyer, seller) combo. Match
  // on paymentStatus=1 (unpaid) and at least one item still in a pending-
  // payment state to avoid piling items onto an Order that's already been
  // settled.
  const existing = await Order.findOne({
    userId: buyerObj,
    paymentStatus: 1,
    items: {
      $elemMatch: {
        sellerId: sellerObj,
        status: { $in: PENDING_PAYMENT_STATUSES },
      },
    },
  });

  if (existing) {
    existing.items.push(newItem);
    _recomputeOrderTotals(existing, shippingMode);
    await existing.save();
    return { order: existing, isNew: false, shippingMode };
  }

  // No existing Order — spin up a fresh one with the single item seeded in.
  const adminRate = Number(settingJSON.adminCommissionCharges) || 10;
  const cancelRate = Number(settingJSON.cancelOrderCharges) || 10;

  const newOrder = new Order({
    orderId: `${orderIdPrefix}#` + Math.floor(10000 + Math.random() * 90000),
    userId: buyerObj,
    items: [newItem],
    paymentStatus: 1,
    paymentGateway: "",
    purchasedTimeadminCommissionCharges: adminRate,
    purchasedTimecancelOrderCharges: cancelRate,
  });
  _recomputeOrderTotals(newOrder, shippingMode);
  await newOrder.save();
  return { order: newOrder, isNew: true, shippingMode };
}

module.exports = {
  findOrCreatePendingOrderForSeller,
  PENDING_PAYMENT_STATUSES,
};
