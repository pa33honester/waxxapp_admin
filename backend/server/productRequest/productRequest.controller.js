const ProductRequest = require("./productRequest.model");

//fs
const fs = require("fs");

//mongoose
const mongoose = require("mongoose");

//config
const Config = require("../../config");

//import model
const Seller = require("../seller/seller.model");
const Category = require("../category/category.model");
const SubCategory = require("../subCategory/subCategory.model");

// Mirrors the helper in product.controller.js — accepts the `promoCodes`
// field from a multipart form (CSV string) or a JSON body (array). Drops
// invalid ObjectIds and de-dupes. Empty/missing input → empty array.
const parsePromoCodeIds = (raw) => {
  if (raw == null) return [];
  let list;
  if (Array.isArray(raw)) {
    list = raw;
  } else if (typeof raw === "string") {
    if (!raw.trim()) return [];
    try {
      const parsed = JSON.parse(raw);
      list = Array.isArray(parsed) ? parsed : raw.split(",");
    } catch (_) {
      list = raw.split(",");
    }
  } else {
    return [];
  }
  const seen = new Set();
  const out = [];
  for (const id of list) {
    const s = String(id || "").trim();
    if (!s || !mongoose.Types.ObjectId.isValid(s) || seen.has(s)) continue;
    seen.add(s);
    out.push(new mongoose.Types.ObjectId(s));
  }
  return out;
};
const Product = require("../product/product.model");

//deleteFiles
const { deleteFile, deleteFiles } = require("../../util/deleteFile");

//private key
const admin = require("../../util/privateKey");

//moment
const moment = require("moment");

const Bull = require("bull");
const manualAuctionQueue = new Bull("manual-auction-queue", {
  redis: { host: "127.0.0.1", port: 6379 },
});

//create product update request by seller to admin or directly product update by seller
exports.updateProductRequest = async (req, res) => {
  try {
    console.log("req.body updateProductRequest: ", req.body);

    if (!req.query.productId || !req.query.sellerId || !req.query.productCode) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const [seller, product] = await Promise.all([
      Seller.findById(req.query.sellerId),
      Product.findOne({
        _id: req.query.productId,
        productCode: req.query.productCode,
        seller: req.query.sellerId,
        createStatus: "Approved",
      }),
    ]);

    if (!seller || !product) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: !seller ? "Seller not found." : "Product not found." });
    }

    const isUpdateRequest = global.settingJSON.isUpdateProductRequest;

    let category = product.category;
    if (req.body.category) {
      const foundCategory = await Category.findById(req.body.category);
      if (!foundCategory) {
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({ status: false, message: "Category not found." });
      }
      category = foundCategory._id;
    }

    let subCategory = product.subCategory;
    if (req.body.subCategory) {
      const foundSubCategory = await SubCategory.findById(req.body.subCategory);
      if (!foundSubCategory) {
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({ status: false, message: "Subcategory not found." });
      }
      subCategory = foundSubCategory._id;
    }

    const auctionFields = {
      enableAuction: req.body.enableAuction === "true",
      scheduleTime: req.body.scheduleTime || product.scheduleTime,
      auctionStartingPrice: req.body.auctionStartingPrice || product.auctionStartingPrice,
      enableReservePrice: req.body.enableReservePrice === "true",
      reservePrice: req.body.reservePrice || product.reservePrice,
      auctionDuration: req.body.auctionDuration || product.auctionDuration,
      auctionStartDate: req.body.auctionStartDate || product.auctionStartDate,
      auctionEndDate: req.body.auctionEndDate || product.auctionEndDate,
    };

    if (isUpdateRequest) {
      if (product.updateStatus === "Approved") {
        product.updateStatus = "Pending";
        await product.save();
      }

      const updateProductrequest = new ProductRequest({
        productName: req.body.productName || product.productName,
        description: req.body.description || product.description,
        productSaleType: Number(req.body.productSaleType) || product.productSaleType,
        price: req.body.price || product.price,
        minimumOfferPrice: req.body.minimumOfferPrice || product.minimumOfferPrice,
        processingTime: req.body.processingTime || product.processingTime,
        recipientAddress: req.body.recipientAddress || product.recipientAddress,
        isImmediatePaymentRequired: req.body.isImmediatePaymentRequired === "true" || product.isImmediatePaymentRequired,
        shippingCharges: req.body.shippingCharges || product.shippingCharges,
        deliveryType: req.body.deliveryType || product.deliveryType,
        category,
        subCategory,
        seller: product.seller,
        productCode: product.productCode,
        // Pending promo-code attachment list. If the seller didn't include
        // promoCodes in the request, we carry over the product's current
        // attachments so an unrelated edit doesn't clear them.
        promoCodes: req.body.promoCodes !== undefined
          ? parsePromoCodeIds(req.body.promoCodes)
          : (product.promoCodes || []),
        updateStatus: "Pending",
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        ...auctionFields,
      });

      if (req.files?.mainImage) {
        updateProductrequest.mainImage = Config.baseURL + req.files.mainImage[0].path;
      } else {
        updateProductrequest.mainImage = product.mainImage;
      }

      if (req.files?.images) {
        updateProductrequest.images = req.files.images.map((file) => Config.baseURL + file.path);
      } else {
        updateProductrequest.images = product.images;
      }

      if (req.body.attributes) {
        try {
          const attributes = typeof req.body.attributes === "string" ? JSON.parse(req.body.attributes) : req.body.attributes;

          for (const attr of attributes) {
            if (!attr.name || typeof attr.name !== "string" || !attr.name.trim()) return res.status(200).json({ status: false, message: `Attribute must have a valid 'name'` });
            if (!Array.isArray(attr.values)) return res.status(200).json({ status: false, message: `Attribute '${attr.name}' must have a 'values' array` });
            const validValues = attr.values.filter((v) => v !== null && v !== "" && v !== undefined);
            if (validValues.length === 0) return res.status(200).json({ status: false, message: `Attribute '${attr.name}' must have at least one valid value` });
            if (!attr.image || typeof attr.image !== "string" || !attr.image.trim()) return res.status(200).json({ status: false, message: `Attribute '${attr.name}' must have a valid 'image'` });
          }

          updateProductrequest.attributes = attributes;
        } catch (e) {
          return res.status(200).json({ status: false, message: "Invalid attributes JSON." });
        }
      } else {
        updateProductrequest.attributes = product.attributes;
      }

      await updateProductrequest.save();

      const populated = await ProductRequest.findById(updateProductrequest._id).populate([
        { path: "seller", select: "firstName lastName businessTag businessName image" },
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
      ]);

      res.status(200).json({
        status: true,
        message: "Product update request submitted.",
        updateProductrequest: populated,
      });

      if (seller.fcmToken !== null) {
        const requestPayload = {
          token: seller.fcmToken,
          notification: {
            title: "📦 Product Request Submitted!",
            body: "Your product update request is under review. ✅⏳",
          },
          data: { type: "PRODUCT_REQUEST_SUBMITTED" },
        };

        try {
          const adminInstance = await admin;
          await adminInstance.messaging().send(requestPayload);
        } catch (err) {
          console.error("Error sending notification:", err);
        }
      }
    } else {
      // Direct update
      Object.assign(product, {
        productName: req.body.productName || product.productName,
        description: req.body.description || product.description,
        price: Number(req.body.price) || product.price,
        productSaleType: Number(req.body.productSaleType) || product.productSaleType,
        processingTime: req.body.processingTime || product.processingTime,
        recipientAddress: req.body.recipientAddress || product.recipientAddress,
        isImmediatePaymentRequired: req.body.isImmediatePaymentRequired === "true" || product.isImmediatePaymentRequired,
        minimumOfferPrice: req.body.minimumOfferPrice || product.minimumOfferPrice,
        shippingCharges: req.body.shippingCharges || product.shippingCharges,
        deliveryType: req.body.deliveryType || product.deliveryType,
        category,
        subCategory,
        promoCodes: req.body.promoCodes !== undefined
          ? parsePromoCodeIds(req.body.promoCodes)
          : (product.promoCodes || []),
        updateStatus: "Approved",
        date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
        ...auctionFields,
      });

      if (req.files?.mainImage) {
        const image = product?.mainImage?.split("storage");
        if (image?.[1] && fs.existsSync("storage" + image[1])) fs.unlinkSync("storage" + image[1]);
        product.mainImage = Config.baseURL + req.files.mainImage[0].path;
      }

      if (req.files?.images) {
        product.images?.forEach((img) => {
          const parts = img.split("storage");
          if (parts[1] && fs.existsSync("storage" + parts[1])) fs.unlinkSync("storage" + parts[1]);
        });
        product.images = req.files.images.map((file) => Config.baseURL + file.path);
      }

      if (req.body.attributes) {
        try {
          const attributes = typeof req.body.attributes === "string" ? JSON.parse(req.body.attributes) : req.body.attributes;

          for (const attr of attributes) {
            if (!attr.name || typeof attr.name !== "string" || !attr.name.trim()) return res.status(200).json({ status: false, message: `Attribute must have a valid 'name'` });
            if (!Array.isArray(attr.values)) return res.status(200).json({ status: false, message: `Attribute '${attr.name}' must have a 'values' array` });
            const validValues = attr.values.filter((v) => v !== null && v !== "" && v !== undefined);
            if (validValues.length === 0) return res.status(200).json({ status: false, message: `Attribute '${attr.name}' must have at least one valid value` });
            if (!attr.image || typeof attr.image !== "string" || !attr.image.trim()) return res.status(200).json({ status: false, message: `Attribute '${attr.name}' must have a valid 'image'` });
          }

          product.attributes = attributes;
        } catch (e) {
          if (req.files) deleteFiles(req.files);
          return res.status(200).json({ status: false, message: "Invalid attributes JSON." });
        }
      }

      await product.save();

      const populatedProduct = await Product.findById(product._id).populate([
        { path: "category", select: "name" },
        { path: "subCategory", select: "name" },
        { path: "seller", select: "firstName lastName businessTag businessName image" },
      ]);

      return res.status(200).json({
        status: true,
        message: "Product updated directly.",
        product: populatedProduct,
      });
    }
  } catch (error) {
    if (req.files) deleteFiles(req.files);
    console.error("Error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//product request accept or decline to update product by admin
exports.acceptUpdateRequest = async (req, res) => {
  try {
    if (!req.query.requestId) {
      return res.status(200).json({ status: false, message: "requestId must be requried." });
    }

    const updateRequest = await ProductRequest.findOne({ _id: req.query.requestId, updateStatus: "Pending" });
    if (!updateRequest) {
      return res.status(200).json({ status: false, message: "product request to update the product does not found." });
    }

    if (updateRequest.updateStatus === "Approved") {
      return res.status(200).json({
        status: false,
        message: "product request already accepted by admin for update that product.",
      });
    }

    if (req.query.type === "Approved") {
      const product = await Product.findOne({
        productCode: updateRequest.productCode,
        createStatus: "Approved",
      });

      if (!product) {
        return res.status(200).json({ status: false, message: "No product Was Found." });
      }

      if (product.mainImage) {
        const image = product?.mainImage?.split("storage");
        if (image) {
          if (fs.existsSync("storage" + image[1])) {
            fs.unlinkSync("storage" + image[1]);
          }
        }
      }

      if (product.images.length > 0) {
        for (var i = 0; i < product.images.length; i++) {
          const images = product.images[i].split("storage");

          if (images) {
            if (fs.existsSync("storage" + images[1])) {
              fs.unlinkSync("storage" + images[1]);
            }
          }
        }
      }

      product.productName = updateRequest.productName;
      product.productCode = updateRequest.productCode;
      product.description = updateRequest.description;
      product.mainImage = updateRequest.mainImage;
      product.images = updateRequest.images;
      product.attributes = updateRequest.attributes;
      product.price = updateRequest.price;
      product.processingTime = updateRequest.processingTime;
      product.recipientAddress = updateRequest.recipientAddress;
      product.isImmediatePaymentRequired = updateRequest.isImmediatePaymentRequired;
      product.shippingCharges = updateRequest.shippingCharges;
      product.deliveryType = updateRequest.deliveryType;
      product.seller = updateRequest.seller;
      product.category = updateRequest.category;
      product.subCategory = updateRequest.subCategory;
      product.promoCodes = updateRequest.promoCodes || product.promoCodes;
      product.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
      product.updateStatus = "Approved";
      product.productSaleType = updateRequest.productSaleType;
      product.allowOffer = updateRequest.allowOffer;
      product.minimumOfferPrice = updateRequest.minimumOfferPrice;
      product.enableAuction = updateRequest.enableAuction;
      product.auctionStartingPrice = updateRequest.auctionStartingPrice;
      product.enableReservePrice = updateRequest.enableReservePrice;
      product.reservePrice = updateRequest.reservePrice;
      product.auctionDuration = updateRequest.auctionDuration;

      let scheduleISO = null;
      let auctionStartISO = null;
      let auctionEndISO = null;

      if (updateRequest.scheduleTime) {
        const m = moment(updateRequest.scheduleTime, moment.ISO_8601, true);
        if (!m.isValid()) {
          if (req.files) deleteFiles(req.files);
          return res.status(200).json({ status: false, message: "Invalid scheduleTime. Expect ISO 8601 date/time." });
        }
        scheduleISO = m.toISOString(); // normalized ISO string (UTC)
      }

      if (scheduleISO) {
        product.scheduleTime = scheduleISO;
      }

      if (product.enableAuction && product.auctionDuration > 0 && product.scheduleTime) {
        const auctionStart = moment(product.scheduleTime); // moment from ISO
        const auctionEnd = auctionStart.clone().add(product.auctionDuration, "days");

        auctionStartISO = auctionStart.toISOString();
        auctionEndISO = auctionEnd.toISOString();

        product.auctionStartDate = auctionStartISO;
        product.auctionEndDate = auctionEndISO;
      }

      updateRequest.updateStatus = "Approved";

      await Promise.all([product.save(), updateRequest.save()]);

      res.status(200).json({
        status: true,
        message: "Product request accepted by the admin for update that product.",
        updateRequest,
      });

      const seller = await Seller.findOne({ _id: product.seller }).select("fcmToken").lean();
      if (seller.fcmToken !== null) {
        const requestPayload = {
          token: seller.fcmToken,
          notification: {
            title: "✅ Product Approved!",
            body: "🎉 Your product has been approved and is now live in the store. Start selling! 🛍️🚀",
          },
          data: {
            type: "PRODUCT_REQUEST_APPROVED",
          },
        };

        try {
          const adminPromise = await admin;
          const response = await adminPromise.messaging().send(requestPayload);
          console.log("Successfully sent approval notification: ", response);
        } catch (error) {
          console.error("Error sending approval notification: ", error);
        }
      }

      if (product.productSaleType === 2 && product.enableAuction && product.auctionEndDate && product.createStatus === "Approved") {
        await manualAuctionQueue.add(
          "closeManualAuction",
          { productId: product._id },
          {
            delay: new Date(product.auctionEndDate).getTime() - Date.now(),
          }
        );
      }
    } else if (req.query.type === "Rejected") {
      const product = await Product.findOne({
        productCode: updateRequest.productCode,
        createStatus: "Approved",
      });

      if (!product) {
        return res.status(200).json({ status: false, message: "No product Was Found." });
      }

      product.updateStatus = "Rejected";

      updateRequest.updateStatus = "Rejected";

      await Promise.all([product.save(), updateRequest.save()]);

      res.status(200).json({
        status: true,
        message: "Product request rejected by admin for update that product.",
        updateRequest,
      });

      if (updateRequest?.mainImage) {
        const image = updateRequest?.mainImage?.split("storage");
        if (image) {
          if (fs.existsSync("storage" + image[1])) {
            fs.unlinkSync("storage" + image[1]);
          }
        }
      }

      if (updateRequest.images.length > 0) {
        for (var i = 0; i < updateRequest.images.length; i++) {
          const images = updateRequest.images[i].split("storage");

          if (images) {
            if (fs.existsSync("storage" + images[1])) {
              fs.unlinkSync("storage" + images[1]);
            }
          }
        }
      }

      const seller = await Seller.findOne({ _id: product.seller }).select("fcmToken").lean();

      if (seller.fcmToken !== null) {
        const requestPayload = {
          token: seller.fcmToken,
          notification: {
            title: "❌ Product Request Declined",
            body: "We’re sorry! 😔 Your product request was not approved. Please review and try again. 📋🔄",
          },
          data: {
            type: "PRODUCT_REQUEST_DECLINED",
          },
        };

        try {
          const adminPromise = await admin;
          const response = await adminPromise.messaging().send(requestPayload);
          console.log("Successfully sent decline notification: ", response);
        } catch (error) {
          console.error("Error sending decline notification: ", error);
        }
      }
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error.!",
    });
  }
};

//get status wise all product requests to update product by admin
exports.updateProductRequestStatusWise = async (req, res) => {
  try {
    if (!req.query.status) {
      return res.status(200).json({ status: true, message: "status must be requried." });
    }

    let statusQuery = {};
    if (req.query.status === "Pending") {
      statusQuery = { updateStatus: "Pending" };
    } else if (req.query.status === "Approved") {
      statusQuery = { updateStatus: "Approved" };
    } else if (req.query.status === "Rejected") {
      statusQuery = { updateStatus: "Rejected" };
    } else if (req.query.status === "All") {
      statusQuery = {
        updateStatus: {
          $in: ["Pending", "Approved", "Rejected"],
        },
      };
    } else {
      return res.status(200).json({ status: false, message: "status must be passed valid" });
    }

    const productRequests = await ProductRequest.find(statusQuery);

    return res.status(200).json({
      status: true,
      message: `Retrive product's request to update the product with status ${req.query.status}`,
      productRequests,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
