const Cart = require("./cart.model");

//import model
const Product = require("../product/product.model");
const User = require("../user/user.model");
const Seller = require("../seller/seller.model");

//mongoose
const mongoose = require("mongoose");

// Shape B: resolve which delivery option's price to snapshot at the
// cart line. When the product has the new `deliveryOptions[]` array,
// pick the buyer's requested type if it's offered, else default to the
// first option. Legacy products (empty array) fall through to the
// single-cost `shippingCharges` + `deliveryType` pair.
function resolveCartShipping(product, requestedType) {
  const opts = Array.isArray(product.deliveryOptions) ? product.deliveryOptions : [];
  if (opts.length > 0) {
    let chosen = null;
    if (requestedType) {
      const t = String(requestedType).trim().toLowerCase();
      chosen = opts.find((o) => o.type === t);
    }
    if (!chosen) chosen = opts[0];
    return { price: Number(chosen.price) || 0, type: chosen.type };
  }
  return { price: Number(product.shippingCharges) || 0, type: null };
}

//add product to cart for user
exports.addToCart = async (req, res) => {
  try {
    console.log("req.body: ", req.body);

    if (!req.body.userId || !req.body.productId || !req.body.productQuantity || !req.body.attributesArray) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const productId = new mongoose.Types.ObjectId(req.body.productId);

    const [product, user, cart, userIsSeller] = await Promise.all([
      Product.findOne({ _id: productId, createStatus: "Approved" }),
      User.findOne({ _id: userId }),
      Cart.findOne({ userId: userId }),
      Seller.findOne({ userId: userId }),
    ]);

    if (!product) {
      return res.status(200).json({ status: false, message: "Product not found!" });
    }

    if (!user) {
      return res.status(200).json({ status: false, message: "User not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin!" });
    }

    //Check if the user is the seller of the product
    if (userIsSeller && userIsSeller._id.toString() === product?.seller?._id?.toString()) {
      return res.status(200).json({ status: false, message: "Sellers cannot add their own products to the cart!" });
    }

    if (cart) {
      const sellerId = product.seller._id.toString();
      const differentSellerProductsInCart = cart.items.some((item) => item.sellerId.toString() !== sellerId);
      console.log("different Seller's Products In Cart:   ", differentSellerProductsInCart);

      console.log("Cart already exists");

      let itemIndex = cart.items.findIndex((item) => item.productId.toString() === product._id.toString() && JSON.stringify(item.attributesArray) === JSON.stringify(req.body.attributesArray));

      if (itemIndex !== -1) {
        //If the same product with the same attributesArray already exists in the cart, update the productQuantity
        cart.items[itemIndex].productQuantity += parseInt(req.body.productQuantity);
      } else {
        //If the same product with a different attributesArray, or a new product is being added, push a new item to the items array
        const ship = resolveCartShipping(product, req.body.chosenDeliveryType);
        cart.items.push({
          productId: product._id,
          sellerId: product.seller._id,
          productCode: product.productCode,
          productQuantity: parseInt(req.body.productQuantity),
          purchasedTimeProductPrice: product.price,
          purchasedTimeShippingCharges: ship.price,
          chosenDeliveryType: ship.type,
          attributesArray: req.body.attributesArray,
        });
      }

      const productIds = [];
      cart.totalShippingCharges = 0;
      cart.items.map((val) => {
        if (val?.productId) {
          const product = productIds.includes(val.productId.toString());
          if (!product) {
            productIds.push(val.productId.toString());
            cart.totalShippingCharges += val.purchasedTimeShippingCharges;
          }
        }
      });

      cart.subTotal = 0;
      cart.items.map((item) => {
        if (item?.productId) {
          cart.subTotal += item.purchasedTimeProductPrice * parseInt(item.productQuantity);
        }
      });

      cart.totalItems = cart.items.length;
      await cart.save();

      const data = await cart.populate({
        path: "items.productId",
        select: {
          productName: 1,
          mainImage: 1,
          _id: 1,
          // Shape B (v1.0.10): expose the seller's offered options so
          // the buyer cart picker can render the per-item pills, plus
          // legacy shippingCharges + deliveryType so legacy products
          // still show one cost.
          shippingCharges: 1,
          deliveryType: 1,
          deliveryOptions: 1,
        },
      });

      return res.status(200).json({
        status: true,
        message: "Product added to cart.",
        data: data,
      });
    } else {
      console.log("new cart created");

      const ship = resolveCartShipping(product, req.body.chosenDeliveryType);
      const items = [
        {
          productId: product._id,
          sellerId: product.seller._id,
          productQuantity: parseInt(req.body.productQuantity),
          productCode: product.productCode,
          purchasedTimeProductPrice: product.price,
          purchasedTimeShippingCharges: ship.price,
          chosenDeliveryType: ship.type,
          attributesArray: req.body.attributesArray,
        },
      ];

      const subTotal = items[0].purchasedTimeProductPrice * parseInt(items[0].productQuantity);

      const newCart = new Cart();

      newCart.userId = user._id;
      newCart.items = items;
      newCart.totalShippingCharges = items[0].purchasedTimeShippingCharges;
      newCart.subTotal = subTotal;
      newCart.totalItems = items.length;
      await newCart.save();

      const data = await newCart.populate({
        path: "items.productId",
        select: {
          productName: 1,
          mainImage: 1,
          _id: 1,
          // Shape B (v1.0.10): expose the seller's offered options so
          // the buyer cart picker can render the per-item pills, plus
          // legacy shippingCharges + deliveryType so legacy products
          // still show one cost.
          shippingCharges: 1,
          deliveryType: 1,
          deliveryOptions: 1,
        },
      });

      return res.status(200).json({
        status: true,
        message: "Product added to cart.",
        data: data,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//remove product from cart for user
exports.removeFromCart = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.productId || !req.body.productQuantity || !req.body.attributesArray) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const productId = new mongoose.Types.ObjectId(req.body.productId);

    const [product, user, cartByUser] = await Promise.all([Product.findOne({ _id: productId, createStatus: "Approved" }), User.findById(userId), Cart.findOne({ userId: userId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin!" });
    }

    if (!product) {
      return res.status(200).json({ status: false, message: "Product does not found!" });
    }

    if (!cartByUser) {
      return res.status(200).json({ status: false, message: "Cart does not found for this user!" });
    }

    let attributes;
    if (typeof req.body.attributesArray === "string") {
      console.log("attributesArray in body: ", typeof req.body.attributesArray);

      attributes = JSON.parse(req.body.attributesArray);
    } else if (typeof req.body.attributesArray === "object") {
      console.log("attributesArray in body: ", typeof req.body.attributesArray);

      attributes = req.body.attributesArray;
    } else {
      return res.status(200).json({
        status: false,
        message: "Invalid attributes format",
      });
    }

    let result = null;

    if (cartByUser?.items?.length) {
      if (Array.isArray(attributes)) {
        const updateRecordIndex = cartByUser.items.findIndex((item) => item?.productId.toString() === product._id.toString() && JSON.stringify(item?.attributesArray) === JSON.stringify(attributes));
        console.log("updateRecordIndex: ", updateRecordIndex);

        if (updateRecordIndex !== -1) {
          if (cartByUser.items[updateRecordIndex]?.productQuantity >= parseInt(req.body.productQuantity)) {
            const updatedQuan = Number(cartByUser.items[updateRecordIndex].productQuantity) - Number(req?.body?.productQuantity);
            cartByUser.items[updateRecordIndex].productQuantity = updatedQuan;

            var purchasedTimeProductPrice;
            purchasedTimeProductPrice = cartByUser.items[updateRecordIndex].purchasedTimeProductPrice;

            const subTotal = cartByUser.subTotal - purchasedTimeProductPrice * parseInt(req.body.productQuantity);

            result = await Cart.findOneAndUpdate(
              { _id: cartByUser._id },
              {
                items: cartByUser.items,
                subTotal,
              },
              { new: true }
            );
          } else {
            return res.status(200).json({ status: false, message: "Product's productQuantity does not found in the cart." });
          }

          if (result && result.items.some((item) => item.productQuantity === 0)) {
            const filteredItems = result.items.filter((item) => item.productQuantity !== 0);

            const shippingCharges = [...new Set(filteredItems.map((item) => item.purchasedTimeShippingCharges))];

            let updatedTotalShippingCharges = 0;
            for (const value of shippingCharges) {
              updatedTotalShippingCharges += value;
            }

            const subTotal = cartByUser.subTotal - purchasedTimeProductPrice * parseInt(req.body.productQuantity);

            result = await Cart.findOneAndUpdate(
              { _id: cartByUser._id },
              {
                $pull: {
                  items: {
                    productId: product._id,
                    productQuantity: 0,
                  },
                },
                $set: {
                  subTotal,
                  totalItems: result.totalItems - 1,
                  totalShippingCharges: updatedTotalShippingCharges,
                },
              },
              { new: true }
            );
          }

          if (result.totalItems === 0 || result.items.length === 0) {
            await Cart.findByIdAndDelete(result._id); //_id of the cart

            return res.status(200).json({
              status: true,
              message: "Product removed from cart and cart deleted.",
              data: null,
            });
          }
        } else {
          return res.status(200).json({ status: false, message: "Product with specified attributes not found in the cart." });
        }
      } else {
        console.log("req.body.attributesArray is not an array.");
      }
    }

    const data = await Cart.populate(result, {
      path: "items.productId",
      select: {
        productName: 1,
        mainImage: 1,
        _id: 1,
        shippingCharges: 1,
        deliveryType: 1,
        deliveryOptions: 1,
      },
    });

    return res.status(200).json({
      status: true,
      message: "Product removed from the cart!",
      data: data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//get all products added to cart for user
exports.getCartProduct = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, cart] = await Promise.all([User.findById(userId), Cart.findOne({ userId: userId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "You are blocked by the admin!" });
    }

    if (!cart) {
      return res.status(200).json({
        status: false,
        message: "Cart does not found for this user.",
      });
    }

    const populatedCart = await cart.populate({
      path: "items.productId",
      select: {
        productName: 1,
        mainImage: 1,
        attributes: 1,
        productSaleType: 1,
        enableAuction: 1,
        auctionEndDate: 1,
        _id: 1,
        // Shape B: surface the seller's offered options + legacy fields
        // so the buyer cart UI can render the per-item picker.
        shippingCharges: 1,
        deliveryType: 1,
        deliveryOptions: 1,
      },
    });

    if (populatedCart.items.length === 0) {
      return res.status(200).json({
        status: true,
        message: "No products found in the cart.",
      });
    }

    return res.status(200).json({
      status: true,
      message: "Retrive all products added to cart.",
      data: populatedCart,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

// Shape B: buyer flips the chosen delivery option from the cart UI
// without removing the item. Body: { userId, productId, attributesArray,
// chosenDeliveryType }. Looks up the matching cart line, swaps in the
// new option's price as `purchasedTimeShippingCharges`, persists
// `chosenDeliveryType`, and re-aggregates `totalShippingCharges`.
exports.updateDeliveryOption = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.productId || !req.body.chosenDeliveryType) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details." });
    }

    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const productId = new mongoose.Types.ObjectId(req.body.productId);
    const requestedType = String(req.body.chosenDeliveryType).trim().toLowerCase();

    const [product, cart] = await Promise.all([
      Product.findById(productId),
      Cart.findOne({ userId }),
    ]);

    if (!product) {
      return res.status(200).json({ status: false, message: "Product not found!" });
    }
    if (!cart) {
      return res.status(200).json({ status: false, message: "Cart not found!" });
    }

    // Match the cart line on productId + attributesArray (same key used
    // by addToCart's merge logic so multi-variant items stay distinct).
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.productId &&
        item.productId.toString() === product._id.toString() &&
        (req.body.attributesArray === undefined ||
          JSON.stringify(item.attributesArray) === JSON.stringify(req.body.attributesArray))
    );

    if (itemIndex === -1) {
      return res.status(200).json({ status: false, message: "Cart item not found!" });
    }

    const ship = resolveCartShipping(product, requestedType);
    cart.items[itemIndex].chosenDeliveryType = ship.type;
    cart.items[itemIndex].purchasedTimeShippingCharges = ship.price;

    // Re-aggregate totalShippingCharges using the same per-product dedupe
    // the addToCart path uses (charges once per unique product even if
    // there are multiple attribute variants).
    const seenProductIds = new Set();
    cart.totalShippingCharges = 0;
    cart.items.forEach((val) => {
      if (val?.productId && !seenProductIds.has(val.productId.toString())) {
        seenProductIds.add(val.productId.toString());
        cart.totalShippingCharges += val.purchasedTimeShippingCharges || 0;
      }
    });

    await cart.save();

    const data = await cart.populate({
      path: "items.productId",
      select: { productName: 1, mainImage: 1, _id: 1, shippingCharges: 1, deliveryType: 1, deliveryOptions: 1 },
    });

    return res.status(200).json({
      status: true,
      message: "Delivery option updated.",
      data,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: "Internal Server Error" });
  }
};

//delete the cart of particular user
exports.deleteCart = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, cartByUser] = await Promise.all([User.findById(userId), Cart.findOne({ userId: userId })]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!" });
    }

    if (user.isBlock) {
      return res.status(200).json({ status: false, message: "you are blocked by the admin!" });
    }

    if (!cartByUser) {
      return res.status(200).json({ status: false, message: "Cart does not found for this user." });
    }

    await Cart.deleteOne(cartByUser._id);

    return res.status(200).json({ status: true, message: "Remove all products from the cart for this user!" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, message: error.message || "Internal Server Error" });
  }
};
