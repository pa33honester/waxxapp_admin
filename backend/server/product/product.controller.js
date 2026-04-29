const Product = require("./product.model");

//mongoose
const mongoose = require("mongoose");

//fs
const fs = require("fs");

//import model
const Category = require("../category/category.model");
const User = require("../user/user.model");
const Rating = require("../rating/rating.model");
const Seller = require("../seller/seller.model");
const SubCategory = require("../subCategory/subCategory.model");
const ProductRequest = require("../productRequest/productRequest.model");
const Reel = require("../reel/reel.model");
const Cart = require("../cart/cart.model");
const Order = require("../order/order.model");
const Favorite = require("../favorite/favorite.model");
const Review = require("../review/review.model");
const Notification = require("../notification/notification.model");
const LikeHistoryOfReel = require("../likeHistoryOfReel/likeHistoryOfReel.model");
const Attributes = require("../attributes/attributes.model");
const AuctionBid = require("../auctionBid/auctionBid.model");
const ReportReel = require("../reportoReel/reportoReel.model");
const SellerWallet = require("../sellerWallet/sellerWallet.model");

//deleteFiles
const { deleteFiles } = require("../../util/deleteFile");

//import config
const Config = require("../../config");
const admin = require("../../util/privateKey");

//email
const { sendTransactionalEmail, templates } = require("../../util/emailSender");

//moment
const moment = require("moment");

const Bull = require("bull");
const manualAuctionQueue = new Bull("manual-auction-queue", {
  redis: { host: "127.0.0.1", port: 6379 },
});

// Accepts the `promoCodes` field on a product create/update request in
// either CSV form (multipart/form-data sends "id1,id2,id3" as a string)
// or array form (JSON sends ["id1", "id2"]). Returns a deduped array of
// valid ObjectIds — IDs that don't parse are silently dropped.
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

const getValidToken = (token) => {
  if (typeof token !== "string") return null;
  const trimmedToken = token.trim();
  return trimmedToken.length > 0 ? trimmedToken : null;
};

const sendCreateRequestDecisionNotification = async ({ product, decision, reason }) => {
  const deliveries = { push: "no_token", email: "no_email" };
  try {
    const seller = await Seller.findById(product.seller).select("fcmToken userId firstName email").lean();
    if (!seller) return deliveries;

    const tokens = new Set();
    const sellerToken = getValidToken(seller.fcmToken);
    if (sellerToken) tokens.add(sellerToken);

    // Also send to the owning User so if the seller app is uninstalled but the
    // buyer app isn't, the message still lands.
    let owningUser = null;
    if (seller.userId) {
      owningUser = await User.findById(seller.userId).select("fcmToken email firstName").lean();
      const userToken = getValidToken(owningUser?.fcmToken);
      if (userToken) tokens.add(userToken);
    }

    const isApproved = decision === "Approved";
    const title = isApproved ? "Product Request Approved" : "Product Request Rejected";
    const body = isApproved
      ? "Your product request has been approved and is now live."
      : reason
        ? `Your product was rejected. Reason: ${reason}`
        : "Your product request was rejected. Please review and submit again.";

    const notification = new Notification();
    notification.userId = seller.userId || null;
    notification.sellerId = seller._id;
    notification.productId = product._id;
    notification.title = title;
    notification.message = body;
    notification.notificationType = isApproved ? 5 : 6;
    notification.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    await notification.save();

    if (tokens.size) {
      const adminPromise = await admin;
      const results = await Promise.allSettled(
        [...tokens].map((token) =>
          adminPromise.messaging().send({
            token,
            notification: { title, body },
            data: {
              type: isApproved ? "PRODUCT_CREATE_REQUEST_APPROVED" : "PRODUCT_CREATE_REQUEST_REJECTED",
              productId: product._id.toString(),
              reason: reason || "",
            },
          })
        )
      );
      const anyOk = results.some((r) => r.status === "fulfilled");
      const anyFail = results.some((r) => r.status === "rejected");
      if (anyFail) results.filter((r) => r.status === "rejected").forEach((r) => console.error("Product decision push failed:", r.reason));
      deliveries.push = anyOk ? "sent" : "failed";
    }

    const recipientEmail = (seller.email || owningUser?.email || "").trim();
    if (recipientEmail) {
      const firstName = seller.firstName || owningUser?.firstName;
      const result = await sendTransactionalEmail({
        to: recipientEmail,
        subject: isApproved ? "Your product is live" : "Your product wasn't approved",
        html: isApproved
          ? templates.productApproved({ firstName, productName: product.productName })
          : templates.productRejected({ firstName, productName: product.productName, reason }),
      });
      deliveries.email = result.ok ? "sent" : result.reason || "failed";
    }
  } catch (error) {
    console.error("Error preparing product create request decision notification:", error);
  }
  return deliveries;
};

//get category , subcategory , attributes
exports.fetchCatSubcatAttrData = async (req, res) => {
  try {
    const [categories, subCategories, attributes] = await Promise.all([
      Category.find().select("_id name").lean(),
      SubCategory.find().select("_id name category").lean(),
      Attributes.aggregate([
        {
          $project: {
            subCategory: 1,
            attributes: {
              $filter: {
                input: "$attributes",
                as: "attr",
                cond: { $eq: ["$$attr.isActive", true] },
              },
            },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      status: true,
      message: "Categories, subcategories, and attributes retrieved successfully.",
      categories,
      subCategories,
      attributes,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//add product by seller
exports.createProduct = async (req, res) => {
  try {
    console.log("req.body: ", req.body);
    console.log("req.files: ", req.files);

    const requiredFields = ["productName", "description", "price", "category", "subCategory", "sellerId", "shippingCharges", "productCode", "attributes", "productSaleType"];

    for (const field of requiredFields) {
      if (!req.body[field]) {
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({ status: false, message: `Missing field: ${field}` });
      }
    }

    if (!req.files?.mainImage) {
      return res.status(200).json({ status: false, message: "Main image is required." });
    }

    const [category, subCategory, seller, existProduct] = await Promise.all([
      Category.findById(req.body.category),
      SubCategory.findById(req.body.subCategory),
      Seller.findById(req.body.sellerId),
      Product.findOne({
        seller: req.body.sellerId,
        productName: req.body.productName,
        productCode: req.body.productCode,
      }),
    ]);

    if (!category || !subCategory || !seller) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Invalid category, subCategory, or seller." });
    }

    if (existProduct) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({
        status: false,
        message: existProduct.createStatus === "Pending" ? "Product request already sent to admin." : "Product with the same name already exists.",
        createStatus: existProduct.createStatus,
        request: existProduct,
      });
    }

    let attributes;
    if (typeof req.body.attributes === "string") {
      console.log("attributes in body: ", typeof req.body.attributes);

      attributes = JSON.parse(req.body.attributes);
    } else if (typeof req.body.attributes === "object") {
      console.log("attributes in body: ", typeof req.body.attributes);

      attributes = req.body.attributes;
    } else {
      return res.status(200).json({
        status: false,
        message: "Invalid attributes format",
      });
    }

    const product = new Product();

    product.productName = req.body.productName.trim();
    product.description = req.body.description.trim();
    product.price = parseFloat(req.body.price) || 0;
    product.category = category._id;
    product.subCategory = subCategory._id;
    product.seller = seller._id;
    product.shippingCharges = parseFloat(req.body.shippingCharges) || 0;
    // Optional delivery scope; null when seller skipped the picker.
    product.deliveryType = req.body.deliveryType || null;
    product.productCode = req.body.productCode;
    product.productSaleType = Number(req.body.productSaleType);
    product.attributes = attributes;

    product.processingTime = req.body.processingTime || "";
    product.recipientAddress = req.body.recipientAddress || "";
    product.isImmediatePaymentRequired = req.body.isImmediatePaymentRequired === "true";

    product.allowOffer = req.body.allowOffer === "true";
    product.minimumOfferPrice = Number(req.body.minimumOfferPrice) || 0;
    product.enableAuction = req.body.enableAuction === "true";
    product.auctionStartingPrice = Number(req.body.auctionStartingPrice) || 0;
    product.enableReservePrice = req.body.enableReservePrice === "true";
    product.reservePrice = Number(req.body.reservePrice) || 0;
    product.auctionDuration = Number(req.body.auctionDuration) || 0;

    // Optional global promo codes the seller opted into. Multipart sends
    // this as a CSV string ("id1,id2,id3"); JSON sends an array. Accept
    // either; ignore IDs that don't parse.
    product.promoCodes = parsePromoCodeIds(req.body.promoCodes);

    let scheduleISO = null;
    let auctionStartISO = null;
    let auctionEndISO = null;

    if (req.body.scheduleTime !== undefined && req.body.scheduleTime !== null && `${req.body.scheduleTime}`.trim() !== "") {
      const m = moment(req.body.scheduleTime, moment.ISO_8601, true);
      if (!m.isValid()) {
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({ status: false, message: "Invalid scheduleTime. Expect ISO 8601 date/time." });
      }
      scheduleISO = m.toISOString(); // normalized ISO string (UTC)
    }

    product.scheduleTime = scheduleISO;

    if (product.enableAuction && product.auctionDuration > 0 && product.scheduleTime) {
      const auctionStart = moment(product.scheduleTime); // moment from ISO
      const auctionEnd = auctionStart.clone().add(product.auctionDuration, "days");

      auctionStartISO = auctionStart.toISOString();
      auctionEndISO = auctionEnd.toISOString();

      product.auctionStartDate = auctionStartISO;
      product.auctionEndDate = auctionEndISO;
    }

    product.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });

    product.createStatus = global.settingJSON.isAddProductRequest ? "Pending" : "Approved";

    if (req.files.mainImage) {
      product.mainImage = Config.baseURL + req.files.mainImage[0].path;
    }

    if (req.files.images) {
      product.images = req.files.images.map((img) => Config.baseURL + img.path);
    }

    await product.save();

    const populated = await Product.findById(product._id).populate([
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
      {
        path: "seller",
        select: "firstName lastName businessTag businessName image",
      },
    ]);

    res.status(200).json({
      status: true,
      message: product.createStatus === "Pending" ? "Product request created by seller to admin." : "Product added directly by seller.",
      product: populated,
    });

    if (product.productSaleType === 2 && product.enableAuction && product.auctionEndDate && product.createStatus === "Approved") {
      await manualAuctionQueue.add(
        "closeManualAuction",
        { productId: product._id },
        {
          delay: new Date(product.auctionEndDate).getTime() - Date.now(),
        }
      );
    }
  } catch (error) {
    if (req.files) deleteFiles(req.files);
    console.error("createProduct error:", error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//create product request accept or decline by admin
exports.acceptCreateRequest = async (req, res) => {
  try {
    if (!req.query.productId) {
      return res.status(200).json({ status: false, message: "productId must be requried." });
    }

    const product = await Product.findById(req.query.productId);
    if (!product) {
      return res.status(200).json({ status: false, message: "product does not found." });
    }

    if (product.createStatus === "Approved") {
      return res.status(200).json({
        status: false,
        message: "product request already accepted by the admin for create the product.",
      });
    }

    if (req.query.type === "Approved") {
      product.createStatus = "Approved";
      await product.save();

      const deliveries = await sendCreateRequestDecisionNotification({ product, decision: "Approved" });

      if (product.productSaleType === 2 && product.enableAuction && product.auctionEndDate && product.createStatus === "Approved") {
        await manualAuctionQueue.add(
          "closeManualAuction",
          { productId: product._id },
          {
            delay: new Date(product.auctionEndDate).getTime() - Date.now(),
          }
        );
      }

      return res.status(200).json({
        status: true,
        message: "Product request accepted by the admin.",
        product,
        deliveries,
      });
    } else if (req.query.type === "Rejected") {
      product.createStatus = "Rejected";
      await product.save();

      const reason = (req.body && req.body.rejectionReason) ? String(req.body.rejectionReason).trim() : "";
      const deliveries = await sendCreateRequestDecisionNotification({ product, decision: "Rejected", reason });

      return res.status(200).json({
        status: true,
        message: "Product request rejected by the admin for create the product.",
        product,
        deliveries,
      });
    } else {
      return res.status(200).json({ status: false, message: "type must be passed valid." });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get status wise all product requests to create product for admin
exports.createProductRequestStatusWise = async (req, res) => {
  try {
    if (!req.query.status) {
      return res.status(200).json({ status: true, message: "Oops ! Invalid details." });
    }

    let statusQuery = {};
    if (req.query.status === "Pending") {
      statusQuery = { createStatus: "Pending" };
    } else if (req.query.status === "Approved") {
      statusQuery = { createStatus: "Approved" };
    } else if (req.query.status === "Rejected") {
      statusQuery = { createStatus: "Rejected" };
    } else if (req.query.status === "All") {
      statusQuery = {
        createStatus: {
          $in: ["Pending", "Approved", "Rejected"],
        },
      };
    } else {
      return res.status(200).json({ status: false, message: "status must be passed valid" });
    }

    const products = await Product.find(statusQuery);

    return res.status(200).json({
      status: true,
      message: `Retrive products with status ${req.query.status}`,
      products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//add product by admin
exports.createProductByAdmin = async (req, res) => {
  try {
    const requiredFields = ["productName", "description", "price", "category", "subCategory", "sellerId", "shippingCharges", "productCode", "attributes"];

    for (let field of requiredFields) {
      if (!req.body[field]) {
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({ status: false, message: `Missing required field: ${field}` });
      }
    }

    if (!req.files || !req.files.mainImage) {
      return res.status(200).json({ status: false, message: "Main image is required" });
    }

    const [category, subCategory, seller] = await Promise.all([Category.findById(req.body.category), SubCategory.findById(req.body.subCategory), Seller.findById(req.body.sellerId)]);

    if (!category) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Category not found" });
    }

    if (!subCategory) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "SubCategory not found" });
    }

    if (!seller) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Seller not found" });
    }

    const existProduct = await Product.findOne({
      seller: seller._id,
      productCode: req.body.productCode,
    });

    if (existProduct) {
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({
        status: false,
        message: "Product with this product code already exists",
        product: existProduct,
      });
    }

    const product = new Product({
      productName: req.body.productName,
      description: req.body.description,
      price: parseFloat(req.body.price) || 0,
      category: category._id,
      subCategory: subCategory._id,
      seller: seller._id,
      createStatus: "Approved",
      isAddByAdmin: true,
      shippingCharges: parseFloat(req.body.shippingCharges) || 0,
      deliveryType: req.body.deliveryType || null,
      productCode: req.body.productCode,
      date: new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }),
    });

    if (req.files.mainImage) {
      product.mainImage = Config.baseURL + req.files.mainImage[0].path;
    }

    if (req.files.images) {
      product.images = req.files.images.map((img) => Config.baseURL + img.path);
    }

    let attributes;
    if (typeof req.body.attributes === "string") {
      console.log("attributes in body: ", typeof req.body.attributes);

      attributes = JSON.parse(req.body.attributes);
    } else if (typeof req.body.attributes === "object") {
      console.log("attributes in body: ", typeof req.body.attributes);

      attributes = req.body.attributes;
    } else {
      return res.status(200).json({ status: false, message: "Invalid attributes format" });
    }

    console.log("req.body : ", req.body);

    for (const attr of attributes) {
      if (!attr.name || typeof attr.name !== "string" || !attr.name.trim()) {
        return res.status(200).json({ status: false, message: `Attribute must have a valid 'name'` });
      }

      if (!Array.isArray(attr.values)) {
        return res.status(200).json({ status: false, message: `Attribute '${attr.name}' must have a 'values' array` });
      }

      const validValues = attr.values.filter((v) => v !== null && v !== "" && v !== undefined);
      if (validValues.length === 0) {
        return res.status(200).json({ status: false, message: `Attribute '${attr.name}' must have at least one valid value in 'values'` });
      }

      if (!attr.image || typeof attr.image !== "string" || !attr.image.trim()) {
        return res.status(200).json({ status: false, message: `Attribute '${attr.name}' must have a valid 'image'` });
      }
    }

    product.attributes = attributes;

    await product.save();

    const populatedProduct = await Product.findById(product._id).populate([
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
      {
        path: "seller",
        select: "firstName lastName businessTag businessName image",
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Product added successfully",
      product: populatedProduct,
    });
  } catch (error) {
    if (req.files) deleteFiles(req.files);
    console.error("Create product error:", error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//update product by admin
exports.updateProduct = async (req, res) => {
  try {
    const { productId, sellerId, productCode } = req.query;

    if (!productId || !sellerId || !productCode) {
      console.warn("❌ Missing required query parameters.");
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const productObjectId = new mongoose.Types.ObjectId(productId);
    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);

    const [seller, product] = await Promise.all([
      Seller.findById(sellerObjectId),
      Product.findOne({
        _id: productObjectId,
        productCode: productCode.trim(),
        seller: sellerObjectId,
        createStatus: "Approved",
      }),
    ]);

    if (!seller) {
      console.warn("❌ Seller not found.");
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Seller not found!" });
    }

    if (!product) {
      console.warn("❌ Product not found.");
      if (req.files) deleteFiles(req.files);
      return res.status(200).json({ status: false, message: "Product not found!" });
    }

    let category = null;
    if (req.body.category) {
      category = await Category.findById(req.body.category);
      if (!category) {
        console.warn("❌ Invalid category ID.");
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({ status: false, message: "Category not found." });
      }
    }

    let subCategory = null;
    if (req.body.subCategory) {
      subCategory = await SubCategory.findById(req.body.subCategory);
      if (!subCategory) {
        console.warn("❌ Invalid subCategory ID.");
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({ status: false, message: "SubCategory not found." });
      }
    }

    product.productName = req.body.productName || product.productName;
    product.description = req.body.description || product.description;
    product.price = req.body.price || product.price;
    product.shippingCharges = req.body.shippingCharges || product.shippingCharges;
    // Preserve-on-empty: omitting deliveryType on edit doesn't wipe a saved value.
    product.deliveryType = req.body.deliveryType || product.deliveryType;
    product.category = category ? category._id : product.category;
    product.subCategory = subCategory ? subCategory._id : product.subCategory;
    if (req.body.promoCodes !== undefined) {
      product.promoCodes = parsePromoCodeIds(req.body.promoCodes);
    }
    product.date = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    product.updateStatus = "Approved";
    product.isUpdateByAdmin = true;

    if (req.files?.mainImage?.length) {
      console.log("📷 Updating mainImage...");

      const currentMainImage = product.mainImage?.split("storage")[1];
      if (currentMainImage && fs.existsSync("storage" + currentMainImage)) {
        fs.unlinkSync("storage" + currentMainImage);
        console.log(`🧹 Deleted old mainImage: ${currentMainImage}`);
      }

      product.mainImage = Config.baseURL + req.files.mainImage[0].path;
      console.log(`✅ New mainImage set: ${product.mainImage}`);
    }

    let removeIndexes = req.body.removeImageIndexes;
    if (typeof removeIndexes === "string") {
      try {
        removeIndexes = JSON.parse(removeIndexes);
      } catch (e) {
        console.error("❌ Failed to parse removeImageIndexes JSON:", e.message);
        if (req.files) deleteFiles(req.files);
        return res.status(200).json({ status: false, message: "Invalid removeImageIndexes format." });
      }
    }

    if (Array.isArray(removeIndexes) && removeIndexes.length > 0) {
      console.log("🗑️ Removing images at indexes:", removeIndexes);

      removeIndexes = removeIndexes.map(Number).sort((a, b) => b - a);
      for (let index of removeIndexes) {
        if (index >= 0 && index < product.images.length) {
          const imagePath = product.images[index]?.split("storage")[1];
          if (imagePath && fs.existsSync("storage" + imagePath)) {
            fs.unlinkSync("storage" + imagePath);
            console.log(`🧹 Deleted image at index ${index}: ${imagePath}`);
          }
          product.images.splice(index, 1);
        }
      }
    }

    if (req.files?.images) {
      const newImages = req.files.images.map((img) => Config.baseURL + img.path);
      product.images = [...product.images, ...newImages];
      console.log(`📸 Added ${newImages.length} new images.`);
    }

    if (req.body.attributes) {
      let attributes;
      if (typeof req.body.attributes === "string") {
        try {
          attributes = JSON.parse(req.body.attributes);
        } catch (e) {
          console.error("❌ Invalid JSON for attributes:", e.message);
          return res.status(200).json({ status: false, message: "Invalid attributes JSON format." });
        }
      } else if (typeof req.body.attributes === "object") {
        attributes = req.body.attributes;
      } else {
        return res.status(200).json({ status: false, message: "Invalid attributes format." });
      }

      for (const attr of attributes) {
        if (!attr.name || typeof attr.name !== "string" || !attr.name.trim()) {
          return res.status(200).json({ status: false, message: `Attribute must have a valid 'name'.` });
        }
        if (!Array.isArray(attr.values)) {
          return res.status(200).json({ status: false, message: `Attribute '${attr.name}' must have a 'values' array.` });
        }
        const validValues = attr.values.filter((v) => v !== null && v !== "" && v !== undefined);
        if (validValues.length === 0) {
          return res.status(200).json({ status: false, message: `Attribute '${attr.name}' must have at least one valid value.` });
        }
        if (!attr.image || typeof attr.image !== "string" || !attr.image.trim()) {
          return res.status(200).json({ status: false, message: `Attribute '${attr.name}' must have a valid 'image'.` });
        }
      }

      product.attributes = attributes;
      console.log("✅ Attributes validated and updated.");
    }

    await product.save();

    const populatedProduct = await Product.findById(product._id).populate([
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
      {
        path: "seller",
        select: "firstName lastName businessTag businessName image",
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Product updated successfully.",
      product: populatedProduct,
    });
  } catch (error) {
    console.error("❌ Exception occurred during update:", error);
    if (req.files) deleteFiles(req.files);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get product details for seller
exports.detailforSeller = async (req, res) => {
  try {
    if (!req.query.productId || !req.query.sellerId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details." });
    }

    const [product, seller] = await Promise.all([Product.findById(req.query.productId), Seller.findById(req.query.sellerId)]);

    if (!product) {
      return res.status(200).json({
        status: false,
        message: "No product was found!",
      });
    }

    if (!seller) {
      return res.status(200).json({ status: false, message: "seller does not found!" });
    }

    const productData = await Product.find({ _id: product._id, seller: seller._id }).populate([
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
      {
        path: "seller",
        select: "firstName lastName businessTag businessName image",
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrive product details for the seller!",
      product: productData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//delete product by seller and admin
exports.deleteProduct = async (req, res) => {
  try {
    if (!req.query.productId) {
      return res.status(200).json({ status: false, message: "productId must be requried!" });
    }

    const productId = new mongoose.Types.ObjectId(req.query.productId);

    const product = await Product.findOne({ _id: productId });
    if (!product) {
      return res.status(200).json({ status: false, message: "Product does not found!" });
    }

    res.status(200).json({
      status: true,
      message: "Product has been deleted.",
    });

    if (product.mainImage) {
      const image = product?.mainImage?.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }
    }

    if (product.images) {
      if (product.images.length > 0) {
        for (var i = 0; i < product?.images?.length; i++) {
          const images = product?.images[i]?.split("storage");
          if (images) {
            if (fs.existsSync("storage" + images[1])) {
              fs.unlinkSync("storage" + images[1]);
            }
          }
        }
      }
    }

    const [cart, order, favorite, review, rating, productRequest, reels] = await Promise.all([
      Cart.deleteMany({ "items.productId": productId }),
      Order.deleteMany({ "items.productId": productId }),
      Favorite.deleteMany({ productId: productId }),
      Review.deleteMany({ productId: productId }),
      Rating.deleteMany({ productId: productId }),
      ProductRequest.find({ productCode: product?.productCode }),
      Reel.find({ productId: productId }),
      SellerWallet.deleteMany({ productId: product?._id }),
    ]);

    if (productRequest.length > 0) {
      await productRequest.forEach(async (product) => {
        if (product.mainImage) {
          const image = product?.mainImage?.split("storage");
          if (image) {
            if (fs.existsSync("storage" + image[1])) {
              fs.unlinkSync("storage" + image[1]);
            }
          }
        }

        if (product.images) {
          if (product.images.length > 0) {
            for (var i = 0; i < product?.images?.length; i++) {
              const images = product?.images[i]?.split("storage");
              if (images) {
                if (fs.existsSync("storage" + images[1])) {
                  fs.unlinkSync("storage" + images[1]);
                }
              }
            }
          }
        }
      });
    }

    if (reels.length > 0) {
      await reels.forEach(async (reel) => {
        if (reel.video) {
          const video = reel?.video?.split("storage");
          if (video) {
            if (fs.existsSync("storage" + video[1])) {
              fs.unlinkSync("storage" + video[1]);
            }
          }
        }

        if (reel.thumbnail) {
          const thumbnail = reel?.thumbnail?.split("storage");
          if (thumbnail) {
            if (fs.existsSync("storage" + thumbnail[1])) {
              fs.unlinkSync("storage" + thumbnail[1]);
            }
          }
        }

        await Promise.all([LikeHistoryOfReel.deleteMany({ reelId: reel?._id }), ReportReel.deleteMany({ reelId: reel?._id })]);
      });
    }

    await Promise.all([AuctionBid.deleteMany({ productId: product?._id }), ProductRequest.deleteMany({ productCode: product?.productCode }), Reel.deleteMany({ productId: product?._id })]);
    await product.deleteOne();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get all products for seller
exports.getAll = async (req, res) => {
  try {
    const { start = 1, limit = 10, sellerId, search = "", saleType } = req.query;

    if (!sellerId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const sellerObjectId = new mongoose.Types.ObjectId(sellerId);
    const skip = (parseInt(start) - 1) * parseInt(limit);

    const query = [
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
      {
        path: "seller",
        select: "firstName lastName businessTag businessName image",
      },
    ];

    const conditions = {
      seller: sellerObjectId,
      isOutOfStock: false,
    };

    if (search && search !== "All" && search.trim() !== "") {
      conditions.$or = [{ productName: { $regex: search.trim(), $options: "i" } }, { description: { $regex: search.trim(), $options: "i" } }];
    }

    if (saleType && saleType !== "All" && saleType !== "") {
      conditions.productSaleType = Number(saleType);
    }

    const [seller, products] = await Promise.all([Seller.findById(sellerObjectId), Product.find(conditions).populate(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit))]);

    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Retrieved products for the seller",
      products: products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//handle the product is selected or not
exports.selectedOrNot = async (req, res) => {
  try {
    if (!req.query.productId) {
      return res.status(200).json({ status: false, massage: "productId must be requried!" });
    }

    const product = await Product.findById(req.query.productId);
    if (!product) {
      return res.status(200).json({ status: false, message: "product does not found!" });
    }

    product.isSelect = !product.isSelect;
    await product.save();

    return res.status(200).json({
      status: true,
      message: "Success",
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

//get all products selected for seller when seller going for live
exports.getSelectedProducts = async (req, res) => {
  try {
    if (!req.query.sellerId) {
      return res.status(200).json({ status: false, message: "sellerId must be requried!" });
    }

    const sellerId = new mongoose.Types.ObjectId(req.query.sellerId);

    const [seller, totalSelectedProducts, selectedProducts, liveSeller] = await Promise.all([
      Seller.findById(sellerId),
      Product.countDocuments({ isSelect: true, seller: sellerId }),
      Product.find({ isSelect: true, isOutOfStock: false, seller: sellerId }).select("mainImage productName price seller isSelect").sort({ createdAt: -1 }),
      Seller.aggregate([
        {
          $match: {
            _id: sellerId,
            isBlock: false,
            isLive: true,
          },
        },
        {
          $lookup: {
            from: "livesellers",
            let: { liveSellerId: "$_id" },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$liveSellerId", "$sellerId"],
                  },
                },
              },
            ],
            as: "liveseller",
          },
        },
        {
          $unwind: {
            path: "$liveseller",
            preserveNullAndEmptyArrays: false,
          },
        },
        {
          $project: {
            liveSellingHistoryId: {
              $cond: [{ $eq: ["$isLive", true] }, "$liveseller.liveSellingHistoryId", null],
            },
          },
        },
      ]),
    ]);

    if (!seller) {
      return res.status(200).json({ status: false, message: "seller does not found." });
    }

    return res.status(200).json({
      status: true,
      message: "when seller going for live then finally, get all products selected by the seller!",
      totalSelectedProducts: totalSelectedProducts ? totalSelectedProducts : 0,
      SelectedProducts: selectedProducts.length > 0 ? selectedProducts : [],
      liveSellingHistoryId: liveSeller[0]?.liveSellingHistoryId ? liveSeller[0].liveSellingHistoryId : null,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get product details for user
exports.productDetail = async (req, res) => {
  try {
    if (!req.query.productId || !req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const productId = new mongoose.Types.ObjectId(req.query.productId);
    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [product, user, ratingExist] = await Promise.all([
      Product.findOne({ _id: productId, createStatus: "Approved" }),
      User.findOne({ _id: userId, isBlock: false }),
      Rating.findOne({ userId: userId, productId: productId }),
    ]);

    if (!product) {
      return res.status(200).json({ status: false, message: "No product was found." });
    }

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found." });
    }

    const seller = await Seller.findById(product.seller);
    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller not found." });
    }

    const productDetails = await Product.aggregate([
      { $match: { _id: product._id } },
      { $addFields: { isRating: !!ratingExist } },
      {
        $lookup: {
          from: "ratings",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$productId", "$$productId"] } } },
            {
              $group: {
                _id: "$productId",
                totalUser: { $sum: 1 },
                avgRating: { $avg: "$rating" },
              },
            },
          ],
          as: "rating",
        },
      },
      {
        $lookup: {
          from: "followers",
          let: { sellerId: seller._id, viewerId: user._id },
          // Per-viewer filter — without the userId guard this returns
          // `true` whenever ANY user follows this seller, so every
          // buyer ended up seeing "Following" on a popular seller's
          // product page even though they hadn't followed.
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$sellerId", "$$sellerId"] },
                    { $eq: ["$userId", "$$viewerId"] },
                  ],
                },
              },
            },
            { $limit: 1 },
          ],
          as: "isFollow",
        },
      },
      {
        $lookup: {
          from: "followers",
          let: { sellerId: seller._id },
          // Followers count stays room-wide (no userId filter) — that's
          // the total number of followers shown on the "About this seller"
          // row, not a per-viewer flag.
          pipeline: [{ $match: { $expr: { $eq: ["$sellerId", "$$sellerId"] } } }, { $count: "count" }],
          as: "followerCountArr",
        },
      },
      {
        $addFields: {
          followerCount: {
            $cond: {
              if: { $gt: [{ $size: "$followerCountArr" }, 0] },
              then: { $arrayElemAt: ["$followerCountArr.count", 0] },
              else: 0,
            },
          },
        },
      },
      {
        $lookup: {
          from: "favorites",
          let: { productId: "$_id", userId: user._id },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$productId", "$$productId"] }, { $eq: ["$userId", "$$userId"] }],
                },
              },
            },
          ],
          as: "isFavorite",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: { path: "$category", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategory",
          foreignField: "_id",
          as: "subCategory",
        },
      },
      { $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "sellers",
          localField: "seller",
          foreignField: "_id",
          as: "seller",
        },
      },
      { $unwind: { path: "$seller", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "auctionbids",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$productId", "$$productId"] }, { $eq: ["$mode", 2] }],
                },
              },
            },
            { $sort: { currentBid: -1 } },
            { $limit: 1 },
            { $project: { _id: 0, currentBid: 1 } },
          ],
          as: "latestBid",
        },
      },
      {
        $addFields: {
          latestBidPrice: {
            $cond: [{ $gt: [{ $size: "$latestBid" }, 0] }, { $arrayElemAt: ["$latestBid.currentBid", 0] }, null],
          },
        },
      },
      {
        $project: {
          _id: 1,
          mainImage: 1,
          images: 1,
          price: 1,
          shippingCharges: 1,
          productName: 1,
          productCode: 1,
          attributes: 1,
          location: 1,
          sold: 1,
          review: 1,
          isOutOfStock: 1,
          isNewCollection: 1,
          description: 1,
          rating: 1,
          createStatus: 1,
          updateStatus: 1,
          productSaleType: 1,
          allowOffer: 1,
          minimumOfferPrice: 1,
          enableAuction: 1,
          auctionStartingPrice: 1,
          enableReservePrice: 1,
          auctionDuration: 1,
          scheduleTime: 1,
          reservePrice: 1,
          auctionEndDate: 1,
          latestBidPrice: 1,
          followerCount: 1,
          category: { _id: 1, name: 1 },
          subCategory: { _id: 1, name: 1 },
          seller: {
            _id: 1,
            firstName: 1,
            lastName: 1,
            businessTag: 1,
            businessName: 1,
            image: 1,
            "address.city": 1,
            "address.state": 1,
            "address.country": 1,
          },
          isFollow: { $cond: [{ $eq: [{ $size: "$isFollow" }, 0] }, false, true] },
          isFavorite: { $cond: [{ $eq: [{ $size: "$isFavorite" }, 0] }, false, true] },
        },
      },
    ]);

    return res.status(200).json({
      status: true,
      message: "Product details retrieved successfully.",
      product: productDetails,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get product details for admin
exports.productDetails = async (req, res) => {
  try {
    if (!req.query.productId) {
      return res.status(200).json({ status: true, message: "Oops ! Invalid details!!" });
    }

    const product = await Product.findById(req.query.productId);
    if (!product) {
      return res.status(500).json({ status: false, message: "No product was found." });
    }

    const [seller, data] = await Promise.all([
      Seller.findById(product.seller),
      Product.aggregate([
        { $match: { _id: product._id } },
        {
          $lookup: {
            from: "ratings",
            let: {
              product: product._id,
            },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$product", "$productId"] },
                },
              },
              {
                $group: {
                  _id: "$productId",
                  totalUser: { $sum: 1 }, //totalRating by user
                  avgRating: { $avg: "$rating" },
                },
              },
            ],
            as: "rating",
          },
        },
        {
          $lookup: {
            from: "categories",
            localField: "category",
            foreignField: "_id",
            as: "category",
          },
        },
        {
          $unwind: { path: "$category", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "subcategories",
            localField: "subCategory",
            foreignField: "_id",
            as: "subCategory",
          },
        },
        {
          $unwind: { path: "$subCategory", preserveNullAndEmptyArrays: true },
        },
        {
          $lookup: {
            from: "sellers",
            localField: "seller",
            foreignField: "_id",
            as: "seller",
          },
        },
        {
          $unwind: { path: "$seller", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            mainImage: 1,
            images: 1,
            price: 1,
            shippingCharges: 1,
            productName: 1,
            location: 1,
            sold: 1,
            review: 1,
            isOutOfStock: 1,
            description: 1,
            rating: 1,
            createStatus: 1,
            updateStatus: 1,
            productCode: 1,
            attributes: 1,
            category: {
              _id: 1,
              name: 1,
            },
            subCategory: {
              _id: 1,
              name: 1,
            },
            seller: {
              _id: 1,
              firstName: 1,
              lastName: 1,
              businessTag: 1,
              businessName: 1,
              image: 1,
            },
          },
        },
      ]),
    ]);

    if (!seller) {
      return res.status(200).json({ status: false, message: "seller of this product does not found." });
    }

    return res.status(200).json({
      status: true,
      message: "Product details Retrive Successfully.",
      product: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get category wise all products for user (gallery page)
exports.getProductsForUser = async (req, res) => {
  try {
    if (!req.query.userId || !req.query.categoryId || !req.query.start || !req.query.limit) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const categoryId = new mongoose.Types.ObjectId(req.query.categoryId);

    const [user, category, data] = await Promise.all([
      User.findById(userId),
      Category.findById(categoryId),
      Product.aggregate([
        {
          $match: {
            category: categoryId,
            createStatus: "Approved",
            isOutOfStock: false,
          },
        },
        {
          $lookup: {
            from: "ratings",
            let: {
              product: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$product", "$productId"] },
                },
              },
              {
                $group: {
                  _id: "$productId",
                  totalUser: { $sum: 1 }, //totalRating by user
                  avgRating: { $avg: "$rating" },
                },
              },
            ],
            as: "rating",
          },
        },
        {
          $lookup: {
            from: "favorites",
            let: { productId: "$_id", userId: userId },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$productId", "$$productId"] }, { $eq: ["$userId", "$$userId"] }],
                  },
                },
              },
            ],
            as: "isFavorite",
          },
        },
        {
          $project: {
            seller: 1,
            productName: 1,
            productCode: 1,
            description: 1,
            price: 1,
            review: 1,
            mainImage: 1,
            images: 1,
            shippingCharges: 1,
            quantity: 1,
            sold: 1,
            isOutOfStock: 1,
            category: 1,
            subCategory: 1,
            rating: 1,
            auctionEndDate: 1,
            productSaleType: 1,
            createStatus: 1,
            updateStatus: 1,
            rating: 1,
            isFavorite: {
              $cond: [{ $eq: [{ $size: "$isFavorite" }, 0] }, false, true],
            },
          },
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            __v: 0,
          },
        },
        { $sort: { createdAt: -1 } },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (!category) {
      return res.status(200).json({ status: false, message: "category does not found." });
    }

    const data_ = await Product.populate(data, [
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrive category wise products Successfully.",
      product: data_ || [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: true, error: error.message || "Internal Server Error" });
  }
};

//search products for user
exports.search = async (req, res) => {
  try {
    if (!req.query.productName || !req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const populatePaths = [
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
    ];

    const q = String(req.query.productName || "").trim();

    if (q === "") {
      return res.status(200).json({ status: true, message: "No data found.", products: [] });
    }

    const baseMatch = {
      createStatus: "Approved",
      productName: { $regex: q, $options: "i" },
      isOutOfStock: false,
    };

    const [response] = await Promise.all([
      Product.find(baseMatch).sort({ scheduleTime: 1 }).populate(populatePaths).lean(),
      Product.updateMany(baseMatch, {
        $inc: { searchCount: 1 },
        $currentDate: { lastSearchedAt: true },
      }),
    ]);

    return res.status(200).json({ status: true, message: "Success", products: response || [] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//previous search products for user
exports.searchProduct = async (req, res) => {
  try {
    const matchQuery = { createStatus: "Approved", isOutOfStock: false };

    const [lastSearchedProducts, popularSearchedProducts] = await Promise.all([
      Product.find(matchQuery).select("-attributes").sort({ lastSearchedAt: -1 }).limit(5),
      Product.find(matchQuery)
        .select("-attributes")
        .sort({ searchCount: -1 }) //Sort by searchCount
        .limit(5),
    ]);

    return res.status(200).json({
      status: true,
      message: "Success",
      products: {
        lastSearchedProducts,
        popularSearchedProducts,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get all products filterWise for user
exports.filterWiseProduct = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: true, message: "userId must be requried." });
    }

    if (!req.body.category || !req.body.subCategory || !req.body.minPrice || !req.body.maxPrice)
      return res.status(200).json({
        status: false,
        message: "OOps ! Invalid details.",
      });

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    //category filter
    let categoryArray = [];
    if (req.body?.category) {
      if (Array.isArray(req.body.category)) {
        categoryArray = req.body.category.map((id) => new mongoose.Types.ObjectId(id));
      } else {
        categoryArray = [new mongoose.Types.ObjectId(req.body.category)];
      }
    }

    const categoryQuery = categoryArray?.length > 0 ? { category: { $in: categoryArray } } : {};

    //subCategory filter
    let subCategoryArray = [];
    if (req.body?.subCategory) {
      if (Array.isArray(req.body.subCategory)) {
        subCategoryArray = req.body.subCategory.map((id) => new mongoose.Types.ObjectId(id));
      } else {
        subCategoryArray = [new mongoose.Types.ObjectId(req.body.subCategory)];
      }
    }

    const subCategoryQuery = subCategoryArray?.length > 0 ? { subCategory: { $in: subCategoryArray } } : {};

    //priceQuery filter
    const priceQuery = {};
    if (req.body.minPrice) {
      priceQuery.price = { $gte: req.body.minPrice };
    }

    if (req.body.maxPrice) {
      priceQuery.price = {
        ...priceQuery.price,
        $lte: req.body.maxPrice,
      };
    }

    const query = {
      $and: [categoryQuery, subCategoryQuery, priceQuery],
    };

    const matchQuery = { createStatus: "Approved", isOutOfStock: false };

    const [user, userIsSeller, product] = await Promise.all([
      User.findOne({ _id: userId, isBlock: false }),
      Seller.findOne({ userId: userId }).lean(),
      Product.aggregate([
        {
          $match: {
            $and: [matchQuery, ...query.$and],
          },
        },
        {
          $lookup: {
            from: "favorites",
            let: {
              productId: "$_id",
              userId: userId,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$productId", "$$productId"] }, { $eq: ["$userId", userId] }],
                  },
                },
              },
            ],
            as: "isFavorite",
          },
        },
        {
          $lookup: {
            from: "ratings",
            localField: "_id",
            foreignField: "productId",
            as: "productRating",
          },
        },
        {
          $project: {
            _id: 1,
            mainImage: 1,
            images: 1,
            price: 1,
            shippingCharges: 1,
            productName: 1,
            productCode: 1,
            location: 1,
            sold: 1,
            review: 1,
            isOutOfStock: 1,
            description: 1,
            category: 1,
            seller: 1,
            createStatus: 1,
            auctionEndDate: 1,
            productSaleType: 1,
            isFavorite: {
              $cond: [{ $eq: [{ $size: "$isFavorite" }, 0] }, false, true],
            },
            ratingAverage: {
              $cond: {
                if: { $eq: [{ $avg: "$productRating.rating" }, null] },
                then: { $avg: 0 },
                else: { $avg: "$productRating.rating" },
              },
            },
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    const filteredProducts = product.filter((product) => !userIsSeller || product.seller.toString() !== userIsSeller._id.toString());

    return res.status(200).json({
      status: true,
      message: "Retrive Filter wise products Successfully!",
      product: filteredProducts.length > 0 ? filteredProducts : [],
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
    });
  }
};

//handle the isOutofStock or not for admin
exports.isOutOfStock = async (req, res) => {
  try {
    if (!req.query.productId) {
      return res.status(200).json({ status: false, massage: "productId must be requried!" });
    }

    const product = await Product.findById(req.query.productId).populate("seller", "firstName lastName image").populate("category", "name").populate("subCategory", "name");
    if (!product) {
      return res.status(200).json({ status: false, message: "product does not found!" });
    }

    product.isOutOfStock = !product.isOutOfStock;
    await product.save();

    return res.status(200).json({
      status: true,
      message: "Success",
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error!",
    });
  }
};

//handle the isNewCollection or not for admin
exports.isNewCollection = async (req, res) => {
  try {
    if (!req.query.productId) {
      return res.status(200).json({ status: false, massage: "productId must be requried!!" });
    }

    const product = await Product.findById(req.query.productId).populate("seller", "firstName lastName image").populate("category", "name").populate("subCategory", "name");
    if (!product) {
      return res.status(200).json({ status: false, message: "product does not found!!" });
    }

    product.isNewCollection = !product.isNewCollection;
    await product.save();

    return res.status(200).json({
      status: true,
      message: "Success",
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get all new collection for user (home page)
exports.getAllisNewCollection = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, products] = await Promise.all([
      User.findById(userId),
      Product.aggregate([
        {
          $match: {
            isNewCollection: true,
            isOutOfStock: false,
          },
        },
        {
          $lookup: {
            from: "favorites",
            let: {
              productId: "$_id",
              userId: userId,
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [{ $eq: ["$productId", "$$productId"] }, { $eq: ["$userId", userId] }],
                  },
                },
              },
            ],
            as: "isFavorite",
          },
        },
        {
          $project: {
            seller: 1,
            mainImage: 1,
            images: 1,
            price: 1,
            shippingCharges: 1,
            productName: 1,
            location: 1,
            sold: 1,
            review: 1,
            isOutOfStock: 1,
            isNewCollection: 1,
            description: 1,
            category: 1,
            seller: 1,
            rating: 1,
            status: 1,
            isApproved: 1,
            productCode: 1,
            attributes: 1,
            auctionEndDate: 1,
            productSaleType: 1,
            isFavorite: {
              $cond: [{ $eq: [{ $size: "$isFavorite" }, 0] }, false, true],
            },
          },
        },
        { $sort: { createdAt: -1 } },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by admin!" });
    }

    return res.status(200).json({
      status: true,
      message: "Success",
      products: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get real products for admin
exports.getRealProducts = async (req, res) => {
  try {
    if (!req.query.start || !req.query.limit) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const query = [
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
      {
        path: "seller",
        select: "firstName lastName businessTag businessName image",
      },
    ];

    const [totalProducts, product] = await Promise.all([
      Product.countDocuments({ isAddByAdmin: false }),
      Product.find({ isAddByAdmin: false })
        .populate(query)
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit),
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrive the products.",
      totalProducts: totalProducts,
      product: product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get fake products for admin
exports.getFakeProducts = async (req, res) => {
  try {
    if (!req.query.start || !req.query.limit) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const query = [
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
      {
        path: "seller",
        select: "firstName lastName businessTag businessName image",
      },
    ];

    const [totalProducts, product] = await Promise.all([
      Product.countDocuments({ isAddByAdmin: true }),
      Product.find({ isAddByAdmin: true })
        .populate(query)
        .sort({ createdAt: -1 })
        .skip((start - 1) * limit)
        .limit(limit),
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrive the products.",
      totalProducts: totalProducts,
      product: product,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get seller wise all products for admin
exports.getSellerWise = async (req, res) => {
  try {
    // Accept either sellerId (direct) or userId (resolve via reverse ref).
    // The User → Seller link on the User doc isn't reliably populated on
    // older rows, so admin callers prefer userId to avoid that footgun.
    let seller = null;
    if (req.query.sellerId) {
      seller = await Seller.findById(req.query.sellerId);
    } else if (req.query.userId) {
      seller = await Seller.findOne({ userId: req.query.userId });
    } else {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    if (!seller) {
      return res.status(200).json({ status: false, message: "Seller does not found." });
    }

    const query = [
      { path: "category", select: "name" },
      { path: "subCategory", select: "name" },
      {
        path: "seller",
        select: "firstName lastName businessTag businessName image",
      },
    ];

    const product = await Product.find({ seller: seller._id }).populate(query).sort({ createdAt: -1 });

    return res.status(200).json({
      status: true,
      message: "Retrive products for the seller.",
      product,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get top selling products for admin (dashboard)
exports.topSellingProducts = async (req, res) => {
  try {
    //const products = await Product.find().sort({ sold: -1 }).limit(10);

    const products = await Product.aggregate([
      {
        $match: { createStatus: "Approved" },
      },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "productId",
          as: "rating",
        },
      },
      {
        $project: {
          mainImage: 1,
          productName: 1,
          productCode: 1,
          productCode: 1,
          sold: 1,
          rating: {
            $cond: {
              if: { $eq: [{ $avg: "$rating.rating" }, null] },
              then: { $avg: 0 },
              else: { $avg: "$rating.rating" },
            },
          },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 10 },
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrive top selling products.",
      products: products,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get most popular products for admin (dashboard)
exports.popularProducts = async (req, res) => {
  try {
    const popularProducts = await Product.aggregate([
      {
        $match: { createStatus: "Approved" },
      },
      {
        $lookup: {
          from: "ratings",
          localField: "_id",
          foreignField: "productId",
          as: "rating",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          mainImage: 1,
          productName: 1,
          productCode: 1,
          rating: {
            $cond: {
              if: { $eq: [{ $avg: "$rating.rating" }, null] },
              then: { $avg: 0 },
              else: { $avg: "$rating.rating" },
            },
          },
          categoryName: { $arrayElemAt: ["$category.name", 0] },
        },
      },
      {
        $sort: { rating: -1 },
      },
      { $limit: 10 },
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrive popular products.",
      popularProducts: popularProducts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get just for you products for user (home page)
exports.justForYou = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, justForYouProducts] = await Promise.all([
      User.findById(userId),
      Product.aggregate([
        {
          $match: {
            createStatus: "Approved",
            isOutOfStock: false,
          },
        },
        {
          $lookup: {
            from: "ratings",
            let: {
              product: "$_id",
            },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$$product", "$productId"] },
                },
              },
              {
                $group: {
                  _id: "$productId",
                  totalUser: { $sum: 1 }, //totalRating by user
                  avgRating: { $avg: "$rating" },
                },
              },
            ],
            as: "rating",
          },
        },
        {
          $project: {
            seller: 1,
            mainImage: 1,
            productName: 1,
            review: 1,
            price: 1,
            sold: 1,
            attributes: 1,
            auctionEndDate: 1,
            productSaleType: 1,
            createStatus: 1,
            rating: 1,
          },
        },
        {
          $sort: {
            review: -1,
            rating: -1,
          },
        },
        { $limit: 10 },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by admin!" });
    }

    return res.status(200).json({
      status: true,
      message: "Retrieve just for you products!",
      justForYouProducts: justForYouProducts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get auction products for user (home page)
exports.getAuctionProducts = async (req, res) => {
  try {
    const start = req.query.start ? parseInt(req.query.start) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;

    const [auctionProducts] = await Promise.all([
      Product.aggregate([
        {
          $match: {
            createStatus: "Approved",
            isOutOfStock: false,
            productSaleType: 2, // Auction type
          },
        },
        {
          $project: {
            productName: 1,
            description: 1,
            productCode: 1,
            mainImage: 1,
            price: 1,
            createStatus: 1,
            auctionEndDate: 1,
            productSaleType: 1,
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        { $skip: (start - 1) * limit },
        { $limit: limit },
      ]),
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrieved auction products successfully!",
      auctionProducts: auctionProducts,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};

//get most popular products for user (home page)
exports.featuredProducts = async (req, res) => {
  try {
    const popularProducts = await Product.aggregate([
      {
        $match: {
          isOutOfStock: false,
          createStatus: "Approved",
        },
      },
      {
        $lookup: {
          from: "ratings",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$productId", "$$productId"] } } },
            {
              $group: {
                _id: "$productId",
                totalUser: { $sum: 1 },
                avgRating: { $avg: "$rating" },
              },
            },
          ],
          as: "rating",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          mainImage: 1,
          productName: 1,
          productCode: 1,
          description: 1,
          price: 1,
          shippingCharges: 1,
          auctionEndDate: 1,
          productSaleType: 1,
          rating: 1,
          categoryName: { $arrayElemAt: ["$category.name", 0] },
        },
      },
      {
        $sort: { rating: -1 },
      },
      { $limit: 10 },
    ]);

    return res.status(200).json({
      status: true,
      message: "Retrive popular products.",
      data: popularProducts,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};

//get related products for user
exports.getRelatedProductsByCategory = async (req, res) => {
  try {
    if (!req.query.productId || !req.query.userId || !req.query.categoryId) {
      return res.status(200).json({
        status: false,
        message: "Missing productId, userId, or categoryId in query parameters.",
      });
    }

    const productId = new mongoose.Types.ObjectId(req.query.productId);
    const userId = new mongoose.Types.ObjectId(req.query.userId);
    const categoryId = new mongoose.Types.ObjectId(req.query.categoryId);
    const limit = parseInt(req.query.limit) || 10;

    const relatedProducts = await Product.aggregate([
      {
        $match: {
          _id: { $ne: productId },
          category: categoryId,
          createStatus: "Approved",
          isOutOfStock: false,
        },
      },
      {
        $lookup: {
          from: "ratings",
          let: { productId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$productId", "$$productId"] } } },
            {
              $group: {
                _id: "$productId",
                totalUser: { $sum: 1 },
                avgRating: { $avg: "$rating" },
              },
            },
          ],
          as: "rating",
        },
      },
      {
        $lookup: {
          from: "favorites",
          let: { productId: "$_id", userId: userId },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$productId", "$$productId"] }, { $eq: ["$userId", "$$userId"] }],
                },
              },
            },
          ],
          as: "isFavorite",
        },
      },
      {
        $addFields: {
          isFavorite: { $gt: [{ $size: "$isFavorite" }, 0] },
        },
      },
      {
        $project: {
          _id: 1,
          productCode: 1,
          productName: 1,
          price: 1,
          shippingCharges: 1,
          auctionEndDate: 1,
          mainImage: 1,
          images: 1,
          description: 1,
          seller: 1,
          productSaleType: 1,
          rating: 1,
          isFavorite: 1,
        },
      },
      { $limit: limit },
    ]);

    return res.status(200).json({
      status: true,
      message: "Related products fetched successfully based on category.",
      relatedProducts,
    });
  } catch (error) {
    console.error("Error in getRelatedProductsByCategory:", error);
    return res.status(500).json({
      status: false,
      message: "Failed to fetch related products.",
      error: error.message,
    });
  }
};
