const Order = require("./order.model");

//import model
const Cart = require("../cart/cart.model");
const User = require("../user/user.model");
const Product = require("../product/product.model");
const Seller = require("../seller/seller.model");
const SellerWallet = require("../sellerWallet/sellerWallet.model");
const Address = require("../address/address.model");
const PromoCode = require("../promoCode/promoCode.model");
const PromoCodeCheck = require("../promoCodeCheck/promoCodeCheck.model");
const Notification = require("../notification/notification.model");

//private key
const admin = require("../../util/privateKey");

//mongoose
const mongoose = require("mongoose");

//create the order by user
exports.createOrder = async (req, res) => {
  try {
    if (!settingJSON) {
      return res.status(200).json({ status: false, message: "Setting not found." });
    }

    if (!req.query.userId || !req.query.paymentGateway || !req.query.paymentStatus) {
      return res.status(200).json({ status: false, message: "Invalid details provided!" });
    }

    const { finalTotal } = req.body;

    if (finalTotal === undefined || finalTotal === null) {
      return res.status(200).json({ error: "finalTotal is required" });
    }

    if (isNaN(Number(finalTotal))) {
      return res.status(200).json({ error: "finalTotal must be a valid number" });
    }

    if (Number(finalTotal) < 0) {
      return res.status(200).json({ error: "finalTotal cannot be negative" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const finalTotalByUser = Math.floor(finalTotal);

    const [user, dataFromCart, orderAddress] = await Promise.all([
      User.findById(userId),
      Cart.findOne({ userId: userId }),
      Address.findOne({ userId: userId, isSelect: true }), //
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    if (!dataFromCart || dataFromCart.items.length === 0) {
      return res.status(200).json({ status: false, message: "Cart is empty or not found." });
    }

    const itemsBySeller = dataFromCart.items.reduce((acc, item) => {
      if (!acc[item.sellerId]) acc[item.sellerId] = [];
      acc[item.sellerId].push(item);
      return acc;
    }, {});

    const orders = [];
    const paymentGateway = req.query.paymentGateway.trim();
    const paymentStatus = Number(req.query.paymentStatus);

    const orderId = "INV#" + Math.floor(10000 + Math.random() * 90000);

    let quantityTotal = 0;
    let totalCartValue = dataFromCart.subTotal;
    let promoCodeData = null;
    let totalDiscount = 0;
    let discountedTotal = 0;
    let discountDistribution = {};
    let sellerPercentageDistribution = {};

    if (req?.body?.promoCode?.trim()) {
      promoCodeData = await PromoCode.findOne({ promoCode: req.body.promoCode }).lean();
      if (!promoCodeData) {
        return res.status(200).json({ status: false, message: "Invalid promo code." });
      }

      const promoCodeCheck = await PromoCodeCheck.findOne({
        promoCodeId: promoCodeData._id,
        userId: userId,
      });

      if (promoCodeCheck) {
        return res.status(200).json({ status: false, message: "Promo code already used by this user." });
      }

      if (promoCodeData.discountType === 1) {
        // Percentage discount
        totalDiscount = Math.floor((dataFromCart.subTotal * promoCodeData.discountAmount) / 100);
      } else if (promoCodeData.discountType === 2) {
        // Flat discount
        totalDiscount = promoCodeData.discountAmount;
      }

      // validate finalTotal
      discountedTotal = dataFromCart.subTotal - totalDiscount;
      const calculatedTotal = discountedTotal + dataFromCart.totalShippingCharges;
      if (finalTotalByUser !== calculatedTotal) {
        return res.status(200).json({
          status: false,
          message: "Invalid finalTotal after applying promo code.",
        });
      }

      Object.entries(itemsBySeller).forEach(([sellerId, items]) => {
        const sellerSubTotal = items.reduce((acc, item) => acc + item.purchasedTimeProductPrice * item.productQuantity, 0);

        // Calculate the percentage contribution of the seller
        sellerPercentageDistribution[sellerId] = ((sellerSubTotal / totalCartValue) * 100).toFixed(2);

        // Distribute the discount proportionally to the seller
        discountDistribution[sellerId] = parseFloat(((sellerSubTotal / totalCartValue) * totalDiscount).toFixed(2));
      });

      const distributedTotal = Object.values(discountDistribution).reduce((acc, value) => acc + value, 0);
      const difference = totalDiscount - distributedTotal;
      if (difference !== 0) {
        //Find the seller with the highest discount and adjust their value
        const [maxSellerId] = Object.entries(discountDistribution).reduce((max, entry) => (entry[1] > max[1] ? entry : max));

        discountDistribution[maxSellerId] += difference;
      }

      console.log("totalDiscount                ", totalDiscount);
      console.log("discountDistribution         ", discountDistribution);
      console.log("sellerPercentageDistribution ", sellerPercentageDistribution);
    } else {
      // No promoCode, validate finalTotal
      discountedTotal = dataFromCart.subTotal;
      const calculatedTotal = discountedTotal + dataFromCart.totalShippingCharges;
      if (finalTotalByUser !== calculatedTotal) {
        return res.status(200).json({
          status: false,
          message: "Invalid finalTotal without promo code.",
        });
      }
    }

    res.status(200).json({
      status: true,
      message: "Orders created successfully.",
    });

    for (const [sellerId, items] of Object.entries(itemsBySeller)) {
      const seller = await Seller.findById(sellerId);

      const purchasedTimeadminCommissionCharges = settingJSON?.adminCommissionCharges;
      const purchasedTimecancelOrderCharges = settingJSON?.cancelOrderCharges;

      const sellerSubTotal = items.reduce((acc, item) => acc + item.purchasedTimeProductPrice * item.productQuantity, 0);
      const sellerShippingCharges = items.reduce((acc, item) => acc + (item.purchasedTimeShippingCharges || 0), 0); // Sum shipping charges per item
      const sellerDiscount = discountDistribution[sellerId] || 0;
      const sellerDiscountRate = sellerPercentageDistribution[sellerId] || 0;
      const sellerFinalTotal = sellerSubTotal - sellerDiscount + sellerShippingCharges;

      const updatedItems = items.map((item) => {
        const itemValue = item.purchasedTimeProductPrice * item.productQuantity;
        const itemDiscount = parseFloat(((itemValue / sellerSubTotal) * sellerDiscount).toFixed(2));

        const adminCommission = (item.purchasedTimeProductPrice * purchasedTimeadminCommissionCharges) / 100;
        const commissionPerProductQuantity = adminCommission * item.productQuantity;
        quantityTotal += parseInt(item?.productQuantity);

        return {
          ...item,
          itemDiscount: itemDiscount,
          commissionPerProductQuantity: commissionPerProductQuantity,
          status: "Pending",
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        };
      });

      const orderData = {
        userId,
        sellerId,
        items: updatedItems,
        totalItems: items.length,
        subTotal: sellerSubTotal,
        discountRate: sellerDiscountRate,
        discount: sellerDiscount,
        totalShippingCharges: sellerShippingCharges,
        finalTotal: sellerFinalTotal,
        totalQuantity: quantityTotal,
        orderId,
        paymentStatus,
        paymentGateway,
        promoCode: req.body.promoCode
          ? {
              promoCode: promoCodeData?.promoCode,
              discountType: promoCodeData?.discountType,
              discountAmount: promoCodeData?.discountAmount,
              conditions: promoCodeData?.conditions, //
            }
          : null,
        shippingAddress: orderAddress
          ? {
              name: orderAddress.name,
              country: orderAddress.country,
              state: orderAddress.state,
              city: orderAddress.city,
              zipCode: orderAddress.zipCode,
              address: orderAddress.address,
            }
          : null,
        purchasedTimeadminCommissionCharges,
        purchasedTimecancelOrderCharges,
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
      };

      const order = new Order(orderData);

      orders.push(order);
      await order.save();

      console.log("order : ", order);

      if (!seller.isBlock && seller.fcmToken !== null) {
        const adminPromise = await admin;

        const sellerPayload = {
          token: seller.fcmToken,
          notification: {
            title: `💎 New Order Received!`,
            body: `🛍️ You have a new order from ${user?.firstName}. Check your dashboard for details!`,
          },
        };

        adminPromise
          .messaging()
          .send(sellerPayload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            const notification = new Notification();
            notification.userId = dataFromCart?.userId;
            notification.image = user?.image;
            notification.sellerId = seller?._id;
            notification.productId = item?.productId;
            notification.title = sellerPayload?.notification?.title;
            notification.message = sellerPayload?.notification?.body;
            notification.notificationType = 1;
            notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }
    }

    await Cart.findOneAndUpdate(
      { userId },
      {
        $set: {
          items: [],
          totalShippingCharges: 0,
          subTotal: 0,
          total: 0,
          finalTotal: 0,
          totalItems: 0,
        },
      }
    );

    if (user.fcmToken && user.fcmToken !== null) {
      const userPayload = {
        token: user.fcmToken,
        notification: {
          title: `🛒 Order Confirmed!`,
          body: `🎁 Your order (ID: ${orderId}) has been successfully placed. Thank you for shopping with us! 📦`,
        },
      };

      const adminPromise = await admin;
      adminPromise
        .messaging()
        .send(userPayload)
        .then(async (response) => {
          console.log("User notification sent successfully: ", response);
        })
        .catch((error) => {
          console.log("Error sending user notification: ", error);
        });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//update status wise the order by seller and admin
exports.updateOrder = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.orderId || !req.query.status || !req.query.itemId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const [user, findOrder] = await Promise.all([User.findById(req.query.userId), Order.findById(req.query.orderId)]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!findOrder) {
      return res.status(200).json({
        status: false,
        message: "Order does not found.",
      });
    }

    if (findOrder.userId.toString() !== user._id.toString()) {
      return res.status(200).json({
        status: false,
        message: "This order does not belongs to your account.",
      });
    }

    const itemToUpdate = findOrder.items.find((item) => item._id.toString() === req?.query?.itemId.toString());
    if (!itemToUpdate) {
      return res.status(200).json({ status: false, message: "Item does not found in the order." });
    }
    //console.log("itemToUpdate: ", itemToUpdate);

    if (req.query.status === "Pending") {
      if (itemToUpdate.status === "Pending")
        return res.status(200).json({
          status: false,
          message: "This order is already in Pending",
        });

      if (itemToUpdate.status === "Confirmed")
        return res.status(200).json({
          status: false,
          message: "This order is already Confirmed, after completion you can't update it to Pending",
        });

      if (itemToUpdate.status === "Out Of Delivery")
        return res.status(200).json({
          status: false,
          message: "This order is already Out Of Delivery, after completion you can't update it to Pending",
        });

      if (itemToUpdate.status === "Delivered")
        return res.status(200).json({
          status: false,
          message: "This order is already Delivered, after completion you can't update it to Pending",
        });

      if (itemToUpdate.status === "Cancelled")
        return res.status(200).json({
          status: false,
          message: "This order is already Cancelled , after cancellation you can't update it to Pending",
        });
    } else if (req.query.status === "Confirmed") {
      if (itemToUpdate.status === "Confirmed")
        return res.status(200).json({
          status: false,
          message: "This order is already Confirmed",
        });

      if (itemToUpdate.status === "Out Of Delivery")
        return res.status(200).json({
          status: false,
          message: "This order is already Out Of Delivery, after completion you can't update it to Confirmed",
        });

      if (itemToUpdate.status === "Delivered")
        return res.status(200).json({
          status: false,
          message: "This order is already Delivered, after completion you can't update it to Confirmed",
        });

      if (itemToUpdate.status === "Cancelled")
        return res.status(200).json({
          status: false,
          message: "This order is already Cancelled, after cancellation you can't update it to Confirmed",
        });

      const updatedOrder = await Order.findOneAndUpdate({ _id: findOrder._id, "items._id": itemToUpdate._id }, { $set: { "items.$.status": "Confirmed" } }, { new: true });

      const data = await Order.findOne({ _id: updatedOrder._id })
        .populate({
          path: "items.productId",
          select: "productName mainImage _id",
        })
        .populate({
          path: "items.sellerId",
          select: "firstName lastName businessName",
        })
        .populate({
          path: "userId",
          select: "firstName lastName uniqueId",
        });

      res.status(200).json({
        status: true,
        message: "Order item status has been updated to Confirmed",
        data: data,
      });

      //notification related
      if (!user.isBlock && user.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: user.fcmToken,
          notification: {
            title: "✅ Your Order Has Been Confirmed!",
            body: "Thank you for your purchase! Your order is confirmed and will be processed shortly. 📦",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            const notification = new Notification();
            notification.userId = findOrder.userId;
            notification.image = user.image;
            notification.sellerId = itemToUpdate.sellerId;
            notification.productId = itemToUpdate.productId;
            notification.message = payload.notification.title;
            notification.notificationType = 2;
            notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }
    } else if (req.query.status === "Out Of Delivery") {
      if (!req.body.deliveredServiceName || !req.body.trackingId || !req.body.trackingLink)
        return res.status(200).json({
          status: false,
          message: "trackingId,trackingLink,deliveredServiceName must be requried!!",
        });

      if (itemToUpdate.status !== "Confirmed")
        return res.status(200).json({
          status: false,
          message: "This order is not Confirmed , after Confirmed you can update it to Out Of Delivery",
        });

      if (itemToUpdate.status === "Out Of Delivery")
        return res.status(200).json({
          status: false,
          message: "This order is already Out Of Delivery",
        });

      if (itemToUpdate.status === "Delivered")
        return res.status(200).json({
          status: false,
          message: "This order is already Delivered, after completion you can't update it to Out Of Delivery",
        });

      if (itemToUpdate.status === "Cancelled")
        return res.status(200).json({
          status: false,
          message: "This order is already Cancelled, after cancellation you can't update it to Out Of Delivery",
        });

      const updatedOrder = await Order.findOneAndUpdate(
        { _id: findOrder._id, "items._id": itemToUpdate._id },
        {
          $set: {
            "items.$.status": "Out Of Delivery",
            "items.$.deliveredServiceName": req.body.deliveredServiceName,
            "items.$.trackingId": req.body.trackingId,
            "items.$.trackingLink": req.body.trackingLink,
          },
        },
        { new: true }
      );

      const data = await Order.findOne({ _id: updatedOrder._id })
        .populate({
          path: "items.productId",
          select: "productName mainImage _id",
        })
        .populate({
          path: "items.sellerId",
          select: "firstName lastName businessName",
        })
        .populate({
          path: "userId",
          select: "firstName lastName uniqueId",
        });

      res.status(200).json({
        status: true,
        message: "Order item status has been updated to Out Of Delivery",
        data: data,
      });

      //notification related
      if (!user.isBlock && user.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: user.fcmToken,
          notification: {
            title: "🚚 Your Order is Out for Delivery!",
            body: "Great news! Your order is on its way and will arrive soon. 🕒 Please be ready to receive it!",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            const notification = new Notification();
            notification.userId = findOrder.userId;
            notification.image = user.image;
            notification.sellerId = itemToUpdate.sellerId;
            notification.productId = itemToUpdate.productId;
            notification.message = payload.notification.title;
            notification.notificationType = 2;
            notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }
    } else if (req.query.status === "Delivered") {
      if (itemToUpdate.status === "Delivered") return res.status(200).json({ status: false, message: "This order is already Delivered" });

      if (itemToUpdate.status === "Cancelled")
        return res.status(200).json({
          status: false,
          message: "This order is already Cancelled , after cancellation you can't update it to Delivered",
        });

      if (itemToUpdate.status !== "Out Of Delivery")
        return res.status(200).json({
          status: false,
          message: "This order is not Out Of Delivery , after Out Of Delivery you can update it to Delivered",
        });

      const sellerEarning = itemToUpdate.purchasedTimeProductPrice * itemToUpdate.productQuantity - itemToUpdate?.commissionPerProductQuantity;

      const [updatedOrder] = await Promise.all([
        Order.findOneAndUpdate(
          { _id: findOrder._id, "items._id": itemToUpdate._id },
          {
            $set: {
              "items.$.status": "Delivered",
            },
          },
          { new: true }
        ),
        Product.findOneAndUpdate({ _id: itemToUpdate.productId }, { $inc: { sold: itemToUpdate.productQuantity } }), //update the "sold" field in the product model by incrementing it by the quantity ordered
        new SellerWallet({
          orderId: findOrder._id,
          productId: itemToUpdate.productId,
          itemId: itemToUpdate._id,
          sellerId: itemToUpdate.sellerId,
          amount: sellerEarning + itemToUpdate?.purchasedTimeShippingCharges,
          commissionPerProductQuantity: itemToUpdate?.commissionPerProductQuantity,
          shippingCharges: itemToUpdate?.purchasedTimeShippingCharges,
          transactionType: 1,
          date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        }).save(),
        Seller.updateOne(
          {
            _id: itemToUpdate.sellerId,
          },
          {
            $inc: {
              netPayout: sellerEarning + itemToUpdate?.purchasedTimeShippingCharges,
            },
          }
        ),
      ]);

      const data = await Order.findOne({ _id: updatedOrder._id })
        .populate({
          path: "items.productId",
          select: "productName mainImage _id",
        })
        .populate({
          path: "items.sellerId",
          select: "firstName lastName businessName",
        })
        .populate({
          path: "userId",
          select: "firstName lastName uniqueId",
        });

      res.status(200).json({
        status: true,
        message: "Order item status has been updated to Delivered",
        data: data,
      });

      //notification related
      if (!user.isBlock && user.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: user.fcmToken,
          notification: {
            title: "📦 Your Order Has Arrived! 🎉",
            body: "Your order is delivered! We hope you enjoy it. 😊 If you need any assistance, feel free to reach out to us.",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            const notification = new Notification();
            notification.userId = findOrder.userId;
            notification.image = user.image;
            notification.sellerId = itemToUpdate.sellerId;
            notification.productId = itemToUpdate.productId;
            notification.message = payload.notification.title;
            notification.notificationType = 2;
            notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }
    } else if (req.query.status === "Cancelled") {
      if (itemToUpdate.status === "Out Of Delivery")
        return res.status(200).json({
          status: false,
          message: "This order is already Out Of Delivery, after completion you can't update it to Cancelled",
        });

      if (itemToUpdate.status === "Delivered")
        return res.status(200).json({
          status: false,
          message: "This order is already Delivered , you can't update it to Cancelled",
        });

      if (itemToUpdate.status === "Cancelled")
        return res.status(200).json({
          status: false,
          message: "You can't cancel this order, This order is already cancelled",
        });

      const purchasedTimeProductPrice = parseInt(itemToUpdate?.purchasedTimeProductPrice);
      const productQuantity = parseInt(itemToUpdate?.productQuantity);
      const purchasedTimeShippingCharges = parseInt(itemToUpdate?.purchasedTimeShippingCharges);

      const cancelOrderCharges = (purchasedTimeProductPrice * findOrder?.purchasedTimecancelOrderCharges) / 100;
      const chargesPerProductQuantity = cancelOrderCharges * productQuantity;
      const refundAmount = purchasedTimeProductPrice * productQuantity + purchasedTimeShippingCharges - chargesPerProductQuantity;

      console.log("--------cancelOrderCharges---------", cancelOrderCharges);
      console.log("--------chargesPerProductQuantity---------", chargesPerProductQuantity);
      console.log("--------refundAmount---------", refundAmount);

      // Check if finalTotal is less than chargesPerProductQuantity
      if (refundAmount < chargesPerProductQuantity) {
        return res.status(200).json({
          status: false,
          message: "Cancellation not allowed as refund amount is less than the cancellation charges",
        });
      }

      const [updatedOrder, updateUser] = await Promise.all([
        Order.findOneAndUpdate(
          { _id: findOrder._id, "items._id": itemToUpdate._id },
          {
            $set: {
              "items.$.status": "Cancelled",
            },
          },
          { new: true }
        ),
        User.updateOne(
          { _id: user._id, amount: { $gt: 0 } },
          {
            $inc: {
              amount: Math.round(Math.abs(refundAmount)),
            },
          }
        ),
      ]);

      const data = await Order.findOne({ _id: updatedOrder._id })
        .populate({
          path: "items.productId",
          select: "productName mainImage _id",
        })
        .populate({
          path: "items.sellerId",
          select: "firstName lastName businessName",
        })
        .populate({
          path: "userId",
          select: "firstName lastName uniqueId",
        });

      res.status(200).json({
        status: true,
        message: "Order item status has been updated to Cancelled",
        data: data,
      });

      //notification related
      if (!user.isBlock && user.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: user.fcmToken,
          notification: {
            title: "🛑 Your Order Has Been Cancelled 🛑",
            body: "We're sorry to inform you that your order has been canceled. Please contact support if you need assistance.",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            const notification = new Notification();
            notification.userId = findOrder.userId;
            notification.image = user.image;
            notification.sellerId = itemToUpdate.sellerId;
            notification.productId = itemToUpdate.productId;
            notification.message = payload.notification.title;
            notification.notificationType = 2;
            notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }
    } else {
      return res.status(200).json({ status: false, message: "status must be passed valid" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//cancel the order by user
exports.cancelOrderByUser = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.orderId || !req.query.status || !req.query.itemId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const [user, findOrder] = await Promise.all([User.findById(req.query.userId), Order.findById(req.query.orderId)]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!findOrder)
      return res.status(200).json({
        status: false,
        message: "Order does not found!",
      });

    if (findOrder.userId.toString() !== user._id.toString())
      return res.status(200).json({
        status: false,
        message: "This order does not belongs to your account!",
      });

    const itemToUpdate = findOrder.items.find((item) => item._id.toString() === req.query.itemId.toString());
    if (!itemToUpdate) {
      return res.status(200).json({ status: false, message: "Item does not found in the order!" });
    }
    //console.log("itemToUpdate in cancel order by the user: ", itemToUpdate);

    if (req.query.status === "Cancelled") {
      if (itemToUpdate.status === "Out Of Delivery") {
        return res.status(200).json({
          status: false,
          message: "This order is already Out Of Delivery, after completion you can't update it to Cancelled",
        });
      }

      if (itemToUpdate.status === "Delivered") {
        return res.status(200).json({
          status: false,
          message: "This order is already Delivered , you can't update it to Cancelled",
        });
      }

      if (itemToUpdate.status === "Cancelled") {
        return res.status(200).json({
          status: false,
          message: "You can't cancel this order, This order is already cancelled",
        });
      }

      const purchasedTimeProductPrice = parseInt(itemToUpdate?.purchasedTimeProductPrice);
      const productQuantity = parseInt(itemToUpdate?.productQuantity);
      const purchasedTimeShippingCharges = parseInt(itemToUpdate?.purchasedTimeShippingCharges);

      const cancelOrderCharges = (purchasedTimeProductPrice * findOrder?.purchasedTimecancelOrderCharges) / 100;
      const chargesPerProductQuantity = cancelOrderCharges * productQuantity;
      const refundAmount = purchasedTimeProductPrice * productQuantity + purchasedTimeShippingCharges - chargesPerProductQuantity;

      console.log("--------cancelOrderCharges---------       ", cancelOrderCharges);
      console.log("--------chargesPerProductQuantity---------", chargesPerProductQuantity);
      console.log("--------refundAmount---------             ", refundAmount);

      // Check if finalTotal is less than chargesPerProductQuantity
      if (refundAmount < chargesPerProductQuantity) {
        return res.status(200).json({
          status: false,
          message: "Cancellation not allowed as refund amount is less than the cancellation charges",
        });
      }

      const [updatedOrder, userUpdate] = await Promise.all([
        Order.findOneAndUpdate(
          { _id: findOrder._id, "items._id": itemToUpdate._id },
          {
            $set: {
              "items.$.status": "Cancelled",
            },
          },
          { new: true }
        ),
        User.updateOne(
          { _id: user._id, amount: { $gt: 0 } },
          {
            $inc: {
              amount: Math.round(Math.abs(refundAmount)),
            },
          }
        ),
      ]);

      const data = await Order.findOne({ _id: updatedOrder._id })
        .populate({
          path: "items.productId",
          select: "productName mainImage _id",
        })
        .populate({
          path: "items.sellerId",
          select: "firstName lastName businessName",
        });

      res.status(200).json({
        status: true,
        message: "Order item status has been updated to Cancelled",
        data: data,
      });

      if (!user.isBlock && user.fcmToken !== null) {
        const adminPromise = await admin;

        const payload = {
          token: user.fcmToken,
          notification: {
            title: "🛑 Your Order Has Been Cancelled 🛑",
            body: "We're sorry to inform you that your order has been canceled. Please contact support if you need assistance.",
          },
        };

        adminPromise
          .messaging()
          .send(payload)
          .then(async (response) => {
            console.log("Successfully sent with response: ", response);

            const notification = new Notification();
            notification.userId = findOrder.userId;
            notification.image = user.image;
            notification.sellerId = itemToUpdate.sellerId;
            notification.message = payload.notification.title;
            notification.notificationType = 2;
            notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            await notification.save();
          })
          .catch((error) => {
            console.log("Error sending message:      ", error);
          });
      }
    } else {
      return res.status(200).json({ status: false, message: "status must be passed be valid!" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get order counts for seller
exports.orderCountForSeller = async (req, res) => {
  try {
    if (!req.query.sellerId || !req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const seller = await Seller.findById(req.query.sellerId);
    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller does not found!!" });
    }

    let dateQuery = {};
    const start_date = new Date(req.query.startDate);
    const end_date = new Date(req.query.endDate);

    dateQuery = {
      analyticDate: {
        $gte: start_date,
        $lte: end_date,
      },
    };
    //console.log("dateQuery____", dateQuery);

    const order = await Order.aggregate([
      {
        $unwind: "$items",
      },
      {
        $addFields: {
          "items.analyticDate": {
            $toDate: {
              $arrayElemAt: [{ $split: ["$items.date", ","] }, 0],
            },
          },
        },
      },
      {
        $match: {
          "items.sellerId": seller._id,
          "items.analyticDate": {
            $gte: start_date,
            $lte: end_date,
          },
        },
      },
    ]);

    const totalOrders = order.length;

    const pendingOrders = order.filter((item) => {
      return item.items.status === "Pending";
    }).length;

    const confirmedOrders = order.filter((item) => {
      return item.items.status === "Confirmed";
    }).length;

    const outOfDeliveryOrders = order.filter((item) => {
      return item.items.status === "Out Of Delivery";
    }).length;

    const deliveredOrders = order.filter((item) => {
      return item.items.status === "Delivered";
    }).length;

    const cancelledOrders = order.filter((item) => {
      return item.items.status === "Cancelled";
    }).length;

    return res.status(200).json({
      status: true,
      message: "Retrive Order count for the seller",
      totalOrders,
      pendingOrders,
      confirmedOrders,
      outOfDeliveryOrders,
      deliveredOrders,
      cancelledOrders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//get status wise order details for seller
exports.orderDetailsForSeller = async (req, res) => {
  try {
    if (!req.query.sellerId || !req.query.status || !req.query.startDate || !req.query.endDate) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const seller = await Seller.findById(req.query.sellerId);
    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller does not found!" });
    }

    const start_date = new Date(req.query.startDate);
    const end_date = new Date(req.query.endDate);

    if (req.query.status === "Pending") {
      const order = await Order.aggregate([
        {
          $unwind: "$items",
        },
        {
          $addFields: {
            "items.analyticDate": {
              $toDate: {
                $arrayElemAt: [{ $split: ["$items.date", ","] }, 0],
              },
            },
          },
        },
        {
          $match: {
            "items.sellerId": seller._id,
            "items.status": "Pending",
            "items.analyticDate": {
              $gte: start_date,
              $lte: end_date,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$_id",
            items: { $push: "$items" },
            shippingAddress: { $first: "$shippingAddress" },
            orderId: { $first: "$orderId" },
            createdAt: { $first: "$createdAt" },
            trackingLink: { $first: "$trackingLink" },
            paymentGateway: { $first: "$paymentGateway" },
            paymentStatus: { $first: "$paymentStatus" },
            userFirstName: { $first: "$user.firstName" },
            userLastName: { $first: "$user.lastName" },
            userMobileNumber: { $first: "$user.mobileNumber" },
            userId: { $first: "$user._id" },
          },
        },
        {
          $project: {
            _id: 1,
            items: 1,
            shippingAddress: 1,
            orderId: 1,
            paymentGateway: 1,
            paymentStatus: 1,
            userFirstName: 1,
            userLastName: 1,
            userMobileNumber: 1,
            userId: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      const orderWithProducts = await Order.populate(order, {
        path: "items.productId",
        select: "productName mainImage _id",
      });

      return res.status(200).json({
        status: true,
        message: `Order history for seller with status ${req.query.status}`,
        orders: orderWithProducts,
      });
    } else if (req.query.status === "Confirmed") {
      const order = await Order.aggregate([
        {
          $unwind: "$items",
        },
        {
          $addFields: {
            "items.analyticDate": {
              $toDate: {
                $arrayElemAt: [{ $split: ["$items.date", ","] }, 0],
              },
            },
          },
        },
        {
          $match: {
            "items.sellerId": seller._id,
            "items.status": "Confirmed",
            "items.analyticDate": {
              $gte: start_date,
              $lte: end_date,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$_id",
            items: { $push: "$items" },
            shippingAddress: { $first: "$shippingAddress" },
            orderId: { $first: "$orderId" },
            createdAt: { $first: "$createdAt" },
            userFirstName: { $first: "$user.firstName" },
            userLastName: { $first: "$user.lastName" },
            paymentGateway: { $first: "$paymentGateway" },
            paymentStatus: { $first: "$paymentStatus" },
            userMobileNumber: { $first: "$user.mobileNumber" },
            userId: { $first: "$user._id" },
          },
        },
        {
          $project: {
            _id: 1,
            items: 1,
            shippingAddress: 1,
            orderId: 1,
            paymentGateway: 1,
            paymentStatus: 1,
            userFirstName: 1,
            userLastName: 1,
            userMobileNumber: 1,
            userId: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      const orderWithProducts = await Order.populate(order, {
        path: "items.productId",
        select: "productName mainImage _id",
      });

      return res.status(200).json({
        status: true,
        message: `Order history for seller with status ${req.query.status}`,
        orders: orderWithProducts,
      });
    } else if (req.query.status === "Out Of Delivery") {
      const order = await Order.aggregate([
        {
          $unwind: "$items",
        },
        {
          $addFields: {
            "items.analyticDate": {
              $toDate: {
                $arrayElemAt: [{ $split: ["$items.date", ","] }, 0],
              },
            },
          },
        },
        {
          $match: {
            "items.sellerId": seller._id,
            "items.status": "Out Of Delivery",
            "items.analyticDate": {
              $gte: start_date,
              $lte: end_date,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$_id",
            items: { $push: "$items" },
            shippingAddress: { $first: "$shippingAddress" },
            orderId: { $first: "$orderId" },
            paymentGateway: { $first: "$paymentGateway" },
            paymentStatus: { $first: "$paymentStatus" },
            createdAt: { $first: "$createdAt" },
            userFirstName: { $first: "$user.firstName" },
            userLastName: { $first: "$user.lastName" },
            userMobileNumber: { $first: "$user.mobileNumber" },
            userId: { $first: "$user._id" },
          },
        },
        {
          $project: {
            _id: 1,
            items: 1,
            shippingAddress: 1,
            orderId: 1,
            paymentGateway: 1,
            paymentStatus: 1,
            userFirstName: 1,
            userLastName: 1,
            userMobileNumber: 1,
            userId: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      const orderWithProducts = await Order.populate(order, {
        path: "items.productId",
        select: "productName mainImage _id",
      });

      return res.status(200).json({
        status: true,
        message: `Order history for seller with status ${req.query.status}`,
        orders: orderWithProducts,
      });
    } else if (req.query.status === "Delivered") {
      const order = await Order.aggregate([
        {
          $unwind: "$items",
        },
        {
          $addFields: {
            "items.analyticDate": {
              $toDate: {
                $arrayElemAt: [{ $split: ["$items.date", ","] }, 0],
              },
            },
          },
        },
        {
          $match: {
            "items.sellerId": seller._id,
            "items.status": "Delivered",
            "items.analyticDate": {
              $gte: start_date,
              $lte: end_date,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$_id",
            items: { $push: "$items" },
            shippingAddress: { $first: "$shippingAddress" },
            orderId: { $first: "$orderId" },
            paymentGateway: { $first: "$paymentGateway" },
            paymentStatus: { $first: "$paymentStatus" },
            createdAt: { $first: "$createdAt" },
            userId: { $first: "$user._id" },
            userFirstName: { $first: "$user.firstName" },
            userLastName: { $first: "$user.lastName" },
            userMobileNumber: { $first: "$user.mobileNumber" },
          },
        },
        {
          $project: {
            _id: 1,
            items: 1,
            shippingAddress: 1,
            orderId: 1,
            paymentGateway: 1,
            paymentStatus: 1,
            userFirstName: 1,
            userLastName: 1,
            userMobileNumber: 1,
            userId: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      const orderWithProducts = await Order.populate(order, {
        path: "items.productId",
        select: "productName mainImage _id",
      });

      return res.status(200).json({
        status: true,
        message: `Order history for seller with status ${req.query.status}`,
        orders: orderWithProducts,
      });
    } else if (req.query.status === "Cancelled") {
      const order = await Order.aggregate([
        {
          $unwind: "$items",
        },
        {
          $addFields: {
            "items.analyticDate": {
              $toDate: {
                $arrayElemAt: [{ $split: ["$items.date", ","] }, 0],
              },
            },
          },
        },
        {
          $match: {
            "items.sellerId": seller._id,
            "items.status": "Cancelled",
            "items.analyticDate": {
              $gte: start_date,
              $lte: end_date,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$_id",
            items: { $push: "$items" },
            shippingAddress: { $first: "$shippingAddress" },
            orderId: { $first: "$orderId" },
            createdAt: { $first: "$createdAt" },
            userFirstName: { $first: "$user.firstName" },
            userLastName: { $first: "$user.lastName" },
            paymentGateway: { $first: "$paymentGateway" },
            paymentStatus: { $first: "$paymentStatus" },
            userMobileNumber: { $first: "$user.mobileNumber" },
            userId: { $first: "$user._id" },
          },
        },
        {
          $project: {
            _id: 1,
            items: 1,
            shippingAddress: 1,
            orderId: 1,
            paymentGateway: 1,
            paymentStatus: 1,
            userFirstName: 1,
            userLastName: 1,
            userMobileNumber: 1,
            userId: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      const orderWithProducts = await Order.populate(order, {
        path: "items.productId",
        select: "productName mainImage _id",
      });

      return res.status(200).json({
        status: true,
        message: `Order history for seller with status ${req.query.status}`,
        orders: orderWithProducts,
      });
    } else if (req.query.status === "All") {
      const order = await Order.aggregate([
        {
          $unwind: "$items",
        },
        {
          $addFields: {
            "items.analyticDate": {
              $toDate: {
                $arrayElemAt: [{ $split: ["$items.date", ","] }, 0],
              },
            },
          },
        },
        {
          $match: {
            "items.sellerId": seller._id,
            "items.status": {
              $in: ["Pending", "Confirmed", "Out Of Delivery", "Delivered", "Cancelled"],
            },
            "items.analyticDate": {
              $gte: start_date,
              $lte: end_date,
            },
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $group: {
            _id: "$_id",
            items: { $push: "$items" },
            shippingAddress: { $first: "$shippingAddress" },
            orderId: { $first: "$orderId" },
            createdAt: { $first: "$createdAt" },
            paymentGateway: { $first: "$paymentGateway" },
            paymentStatus: { $first: "$paymentStatus" },
            userFirstName: { $first: "$user.firstName" },
            userLastName: { $first: "$user.lastName" },
            userMobileNumber: { $first: "$user.mobileNumber" },
            userId: { $first: "$user._id" },
          },
        },
        {
          $project: {
            _id: 1,
            items: 1,
            shippingAddress: 1,
            orderId: 1,
            paymentGateway: 1,
            paymentStatus: 1,
            userFirstName: 1,
            userLastName: 1,
            userMobileNumber: 1,
            userId: 1,
            createdAt: 1,
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      const orderWithProducts = await Order.populate(order, {
        path: "items.productId",
        select: "productName mainImage _id",
      });

      return res.status(200).json({
        status: true,
        message: `Order history for seller with status ${req.query.status}`,
        orders: orderWithProducts,
      });
    } else {
      return res.status(200).json({ status: false, message: "status must be passed valid" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//get particular user's status wise orders for admin (user)
exports.ordersOfUser = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.status || !req.query.start || !req.query.limit) {
      return res.status(200).json({ status: true, message: "Oops ! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, order] = await Promise.all([User.findById(userId), Order.findOne({ userId: userId })]);

    if (!user) {
      return res.status(200).json({ status: true, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin." });
    }

    if (!order) {
      return res.status(200).json({ status: false, message: "This order does not belongs to your account!" });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let statusQuery = {};
    if (req.query.status === "Pending") {
      statusQuery = { "items.status": "Pending" };
    } else if (req.query.status === "Confirmed") {
      statusQuery = { "items.status": "Confirmed" };
    } else if (req.query.status === "Out Of Delivery") {
      statusQuery = { "items.status": "Out Of Delivery" };
    } else if (req.query.status === "Delivered") {
      statusQuery = { "items.status": "Delivered" };
    } else if (req.query.status === "Cancelled") {
      statusQuery = { "items.status": "Cancelled" };
    } else if (req.query.status === "All") {
      statusQuery = {
        "items.status": {
          $in: ["Pending", "Confirmed", "Out Of Delivery", "Delivered", "Cancelled"],
        },
      };
    } else {
      return res.status(200).json({ status: false, message: "status must be passed valid" });
    }

    const [totalOrder, orderData] = await Promise.all([
      Order.countDocuments({ userId: user._id, ...statusQuery }),
      Order.find({ userId: user._id, ...statusQuery })
        .populate({
          path: "items.productId",
          select: {
            productName: 1,
            mainImage: 1,
            _id: 1,
          },
        })
        .skip((start - 1) * limit)
        .limit(limit),
    ]);

    if (req.query.status !== "All") {
      orderData.forEach((order) => {
        order.items = order?.items.filter((item) => item?.status === req?.query?.status);
      });
    }

    return res.status(200).json({
      status: true,
      messages: `Retrive OrderHistory for User with status ${req.query.status}`,
      totalOrder: totalOrder,
      orderData: orderData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get particular seller's status wise orders for admin (Seller)
exports.ordersOfSeller = async (req, res) => {
  try {
    const VALID_STATUSES = [
      "Pending",
      "Confirmed",
      "Out Of Delivery",
      "Delivered",
      "Cancelled",
      "Manual Auction Pending Payment",
      "Manual Auction Cancelled",
      "Auction Pending Payment",
      "Auction Cancelled",
    ];

    const { sellerId, status, start = 1, limit = 10 } = req.query;

    if (!sellerId || !status || !mongoose.Types.ObjectId.isValid(sellerId)) {
      return res.status(200).json({ status: false, message: "Oops! Invalid sellerId or status." });
    }

    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller not found." });
    }

    let matchStatusQuery = {};
    if (status === "All") {
      matchStatusQuery["items.status"] = { $in: VALID_STATUSES };
    } else if (VALID_STATUSES.includes(status)) {
      matchStatusQuery["items.status"] = status;
    } else {
      return res.status(200).json({ status: false, message: "Invalid status value." });
    }

    const baseMatch = {
      "items.sellerId": seller._id,
      ...matchStatusQuery,
    };

    const paginatedPipeline = [
      { $unwind: "$items" },
      { $match: baseMatch },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: { path: "$user", preserveNullAndEmptyArrays: false },
      },
      {
        $group: {
          _id: "$_id",
          items: { $push: "$items" },
          shippingAddress: { $first: "$shippingAddress" },
          orderId: { $first: "$orderId" },
          userFirstName: { $first: "$user.firstName" },
          userLastName: { $first: "$user.lastName" },
          paymentGateway: { $first: "$paymentGateway" },
          paymentStatus: { $first: "$paymentStatus" },
        },
      },
      {
        $project: {
          _id: 1,
          items: 1,
          shippingAddress: 1,
          orderId: 1,
          paymentGateway: 1,
          paymentStatus: 1,
          userFirstName: 1,
          userLastName: 1,
        },
      },
      { $skip: (parseInt(start) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
    ];

    const countPipeline = [
      { $unwind: "$items" },
      { $match: baseMatch },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: { path: "$user", preserveNullAndEmptyArrays: false },
      },
      {
        $group: {
          _id: "$_id",
        },
      },
      { $count: "total" },
    ];

    const [orders, countResult] = await Promise.all([Order.aggregate(paginatedPipeline), Order.aggregate(countPipeline)]);

    const orderWithProducts = await Order.populate(orders, {
      path: "items.productId",
      select: "productName mainImage _id",
    });

    const total = countResult[0]?.total || 0;

    return res.status(200).json({
      status: true,
      message: `Order history for seller with status ${status}`,
      total,
      orders: orderWithProducts,
    });
  } catch (error) {
    console.error("Error in ordersOfSeller:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//status wise get all orders for admin
exports.getOrders = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    const status = req?.query?.status?.trim() || "All";

    let statusQuery = {};
    if (status === "Pending") {
      statusQuery = { "items.status": "Pending" };
    } else if (status === "Confirmed") {
      statusQuery = { "items.status": "Confirmed" };
    } else if (status === "Out Of Delivery") {
      statusQuery = { "items.status": "Out Of Delivery" };
    } else if (status === "Delivered") {
      statusQuery = { "items.status": "Delivered" };
    } else if (status === "Cancelled") {
      statusQuery = { "items.status": "Cancelled" };
    } else if (status === "Manual Auction Pending Payment") {
      statusQuery = { "items.status": "Manual Auction Pending Payment" };
    } else if (status === "Manual Auction Cancelled") {
      statusQuery = { "items.status": "Manual Auction Cancelled" };
    } else if (status === "Auction Cancelled") {
      statusQuery = { "items.status": "Auction Cancelle" };
    } else if (status === "Auction Pending Payment") {
      statusQuery = { "items.status": "Auction Pending Payment" };
    } else if (status === "All") {
      statusQuery = {
        "items.status": {
          $in: ["Pending", "Confirmed", "Out Of Delivery", "Delivered", "Cancelled", "Manual Auction Pending Payment", "Manual Auction Cancelled", "Auction Pending Payment", "Auction Cancelled"],
        },
      };
    } else {
      return res.status(200).json({ status: false, message: "status must be passed valid" });
    }

    const [totalOrders, orders] = await Promise.all([
      Order.countDocuments(statusQuery),
      Order.find(statusQuery)
        .populate({
          path: "items.productId",
          select: {
            productName: 1,
            mainImage: 1,
            _id: 1,
          },
        })
        .populate({
          path: "items.sellerId",
          select: "businessName",
        })
        .populate({
          path: "userId",
          select: "firstName lastName uniqueId",
        })
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit),
    ]);

    if (status !== "All") {
      orders.forEach((order) => {
        order.items = order?.items.filter((item) => item?.status === status);
      });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive orders Successfully!",
      totalOrders,
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get particular order Wise order details (admin)
exports.orderDetails = async (req, res) => {
  try {
    if (!req.query.orderId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const order = await Order.findById(req.query.orderId);
    if (!order) {
      return res.status(200).json({ status: false, message: "Order does not found." });
    }

    const orderWithProducts = await Order.findOne({ _id: order._id })
      .populate({
        path: "items.productId",
        select: "productName mainImage _id",
      })
      .populate({
        path: "items.sellerId",
        select: "firstName lastName",
      });

    return res.status(200).json({
      status: true,
      message: "Retrive order details for admin.",
      order: orderWithProducts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

//get recent orders for admin (dashboard)
exports.recentOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ date: -1 }).limit(10).populate("userId", "firstName lastName").populate("items.productId", "productName mainImage _id").exec();

    return res.status(200).json({
      status: true,
      message: "Retrive recent orders!",
      orders,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get status wise order details for user
exports.orderDetailsForUser = async (req, res) => {
  try {
    const { userId, status } = req.query;

    if (!userId || !status) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const user = await User.findById(userId).select("_id isBlock");
    if (!user) {
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin." });
    }

    const allowedStatuses = [
      "Pending",
      "Confirmed",
      "Out Of Delivery",
      "Delivered",
      "Cancelled",
      "Manual Auction Pending Payment",
      "Manual Auction Cancelled",
      "Auction Pending Payment",
      "Auction Cancelled",
    ];

    const matchStatus = status === "All" ? { "items.status": { $in: allowedStatuses } } : allowedStatuses.includes(status) ? { "items.status": status } : null;

    if (!matchStatus) {
      return res.status(200).json({ status: false, message: "Status must be valid" });
    }

    const now = new Date();

    const orders = await Order.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          ...matchStatus,
        },
      },
      {
        $project: {
          userId: 1,
          orderId: 1,
          finalTotal: 1,
          paymentStatus: 1,
          paymentGateway: 1,
          promoCode: 1,
          shippingAddress: 1,
          createdAt: 1,
          manualAuctionPaymentReminderDuration: 1,
          liveAuctionPaymentReminderDuration: 1,
          items: {
            $filter: {
              input: "$items",
              as: "item",
              cond: status === "All" ? { $in: ["$$item.status", allowedStatuses] } : { $eq: ["$$item.status", status] },
            },
          },
        },
      },
      {
        $addFields: {
          items: {
            $map: {
              input: "$items",
              as: "item",
              in: {
                $mergeObjects: [
                  "$$item",
                  {
                    paymentTimeRemaining: {
                      $switch: {
                        branches: [
                          {
                            case: {
                              $eq: ["$$item.status", "Manual Auction Pending Payment"],
                            },
                            then: {
                              $max: [
                                0,
                                {
                                  $subtract: [
                                    { $multiply: ["$manualAuctionPaymentReminderDuration", 60] },
                                    {
                                      $floor: {
                                        $divide: [{ $subtract: [now, "$createdAt"] }, 1000],
                                      },
                                    },
                                  ],
                                },
                              ],
                            },
                          },
                          {
                            case: {
                              $eq: ["$$item.status", "Auction Pending Payment"],
                            },
                            then: {
                              $max: [
                                0,
                                {
                                  $subtract: [
                                    { $multiply: ["$liveAuctionPaymentReminderDuration", 60] },
                                    {
                                      $floor: {
                                        $divide: [{ $subtract: [now, "$createdAt"] }, 1000],
                                      },
                                    },
                                  ],
                                },
                              ],
                            },
                          },
                        ],
                        default: "$$REMOVE",
                      },
                    },
                  },
                ],
              },
            },
          },
        },
      },
      { $unwind: "$items" },
      {
        $lookup: {
          from: "products",
          localField: "items.productId",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $addFields: {
          "items.productId": {
            $arrayElemAt: [
              {
                $map: {
                  input: "$productData",
                  as: "prod",
                  in: {
                    _id: "$$prod._id",
                    productName: "$$prod.productName",
                    mainImage: "$$prod.mainImage",
                  },
                },
              },
              0,
            ],
          },
        },
      },
      { $project: { productData: 0 } },
      {
        $group: {
          _id: "$_id",
          userId: { $first: "$userId" },
          orderId: { $first: "$orderId" },
          finalTotal: { $first: "$finalTotal" },
          paymentStatus: { $first: "$paymentStatus" },
          paymentGateway: { $first: "$paymentGateway" },
          promoCode: { $first: "$promoCode" },
          shippingAddress: { $first: "$shippingAddress" },
          createdAt: { $first: "$createdAt" },
          manualAuctionPaymentReminderDuration: { $first: "$manualAuctionPaymentReminderDuration" },
          liveAuctionPaymentReminderDuration: { $first: "$liveAuctionPaymentReminderDuration" },
          items: { $push: "$items" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $addFields: {
          userId: {
            $arrayElemAt: [
              {
                $map: {
                  input: "$userData",
                  as: "u",
                  in: {
                    _id: "$$u._id",
                    firstName: "$$u.firstName",
                    lastName: "$$u.lastName",
                    mobileNumber: "$$u.mobileNumber",
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $project: {
          userData: 0,
        },
      },
      {
        $sort: { createdAt: -1 },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: `Retrieved Order History for User with status ${status}`,
      orderData: orders,
    });
  } catch (error) {
    console.error("Aggregation Error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//confirm cod order ( seller )
exports.confirmCodOrderItemBySeller = async (req, res) => {
  try {
    const { userId, orderId, itemId } = req.query;

    if (!userId || !orderId || !itemId) {
      return res.status(200).json({ status: false, message: "Missing required parameters." });
    }

    const [user, order] = await Promise.all([User.findById(userId).lean().select("_id isBlock"), Order.findById(orderId).lean().select("_id userId items")]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found." });
    }

    if (!order) {
      return res.status(200).json({ status: false, message: "Order not found." });
    }

    if (order.userId.toString() !== user._id.toString()) {
      return res.status(200).json({ status: false, message: "Order does not belong to the user." });
    }

    const item = order.items.find((i) => i._id.toString() === itemId.toString());
    if (!item) {
      return res.status(200).json({ status: false, message: "Item not found in order." });
    }

    res.status(200).json({
      status: true,
      message: `Order item marked as COD confirmed.`,
    });

    await Order.updateOne(
      { _id: order._id, "items._id": item._id },
      {
        $set: {
          paymentStatus: 2, // paid
        },
      }
    );
  } catch (error) {
    console.error("Error in confirmCodOrderItemBySeller:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//update order for live/manual auction ( within payment reminder min payment made )
exports.modifyOrderItemStatus = async (req, res) => {
  try {
    const { userId, orderId, itemId, paymentGateway } = req.query;

    if (!userId || !orderId || !itemId || !paymentGateway) {
      return res.status(200).json({ status: false, message: "Missing required parameters." });
    }

    const [user, order, address] = await Promise.all([
      User.findById(userId).lean().select("_id isBlock"),
      Order.findById(orderId).lean().select("_id userId items"),
      Address.findOne({ userId: userId, isSelect: true }).select("name country state city zipCode address").lean(),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found." });
    }

    if (!order) {
      return res.status(200).json({ status: false, message: "Order not found." });
    }

    if (order.userId.toString() !== user._id.toString()) {
      return res.status(200).json({ status: false, message: "Order does not belong to the user." });
    }

    const item = order.items.find((i) => i._id.toString() === itemId.toString());
    if (!item) {
      return res.status(200).json({ status: false, message: "Item not found in order." });
    }

    res.status(200).json({
      status: true,
      message: `Order item status updated.`,
    });

    await Order.updateOne(
      { _id: order._id, "items._id": item._id },
      {
        $set: {
          "items.$.status": "Pending",
          paymentGateway: paymentGateway,
          shippingAddress: address,
        },
      }
    );
  } catch (error) {
    console.error("Error in updateOrderItemStatus:", error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};
