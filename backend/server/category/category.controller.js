const Category = require("./category.model");

//import model
const SubCategory = require("../subCategory/subCategory.model");
const Product = require("../product/product.model");
const Reel = require("../reel/reel.model");
const Cart = require("../cart/cart.model");
const Order = require("../order/order.model");
const Favorite = require("../favorite/favorite.model");
const Review = require("../review/review.model");
const LikeHistoryOfReel = require("../likeHistoryOfReel/likeHistoryOfReel.model");
const Rating = require("../rating/rating.model");
const ProductRequest = require("../productRequest/productRequest.model");
const AuctionBid = require("../auctionBid/auctionBid.model");
const ReportReel = require("../reportoReel/reportoReel.model");
const SellerWallet = require("../sellerWallet/sellerWallet.model");

//config
const config = require("../../config");

//fs
const fs = require("fs");

//mongoose
const mongoose = require("mongoose");

//deletefile
const { deleteFile } = require("../../util/deleteFile");

//create category
exports.store = async (req, res) => {
  try {
    if (!req.body.name.trim()) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const category = new Category();

    category.name = req.body.name.trim();
    category.image = config.baseURL + req?.file?.path;
    await category.save();

    return res.status(200).json({ status: true, message: "Category has been Created by the admin.", category: category });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server error",
    });
  }
};

//update category
exports.update = async (req, res) => {
  try {
    if (!req.query.categoryId) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "category Id is required!!" });
    }

    const category = await Category.findById(req.query.categoryId).populate("subCategory", "name image");
    if (!category) {
      if (req.file) deleteFile(req.file);
      return res.status(200).json({ status: false, message: "category does not found!" });
    }

    if (req?.file) {
      const image = category?.image?.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }

      category.image = config.baseURL + req?.file?.path;
    }

    category.name = req.body.name.trim() ? req.body.name.trim() : category.name.trim();
    await category.save();

    return res.status(200).json({ status: true, message: "category has been Updated by the admin.", category: category });
  } catch (error) {
    if (req.file) deleteFile(req.file);
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//delete category
exports.destroy = async (req, res) => {
  try {
    if (!req.query.categoryId) {
      return res.status(200).json({ status: false, message: "categoryId must be required!" });
    }

    const categoryId = new mongoose.Types.ObjectId(req.query.categoryId);

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(200).json({ status: false, message: "category does not found!" });
    }

    res.status(200).json({ status: true, message: "Success" });

    const [products, subcategories, deleteToProdRequest] = await Promise.all([
      Product.find({ category: categoryId }),
      SubCategory.find({ category: categoryId }),
      ProductRequest.deleteMany({ category: categoryId }),
    ]);

    if (subcategories.length > 0) {
      await subcategories.map(async (subcategory) => {
        const subcategoryImage = subcategory?.image.split("storage");
        if (subcategoryImage) {
          if (fs.existsSync("storage" + subcategoryImage[1])) {
            fs.unlinkSync("storage" + subcategoryImage[1]);
          }
        }

        await SubCategory.findByIdAndDelete(subcategory._id);
      });
    }

    if (products.length > 0) {
      await products.forEach(async (product) => {
        if (product.mainImage) {
          const image = product?.mainImage?.split("storage");
          if (image) {
            if (fs.existsSync("storage" + image[1])) {
              fs.unlinkSync("storage" + image[1]);
            }
          }
        }

        if (product.images) {
          if (product?.images?.length > 0) {
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
          Cart.deleteMany({ "items.productId": product?._id }),
          Order.deleteMany({ "items.productId": product?._id }),
          Favorite.deleteMany({ productId: product?._id }),
          Review.deleteMany({ productId: product?._id }),
          Rating.deleteMany({ productId: product?._id }),
          ProductRequest.find({ productCode: product?.productCode }),
          Reel.find({ productId: product?._id }),
          AuctionBid.deleteMany({ productId: product?._id }),
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
            await reel?.deleteOne();
          });
        }

        await product.deleteOne();
      });
    }

    if (category?.image) {
      const image = category?.image?.split("storage");
      if (image) {
        if (fs.existsSync("storage" + image[1])) {
          fs.unlinkSync("storage" + image[1]);
        }
      }
    }

    await category.deleteOne();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};

//get all category with subCategory for seller
exports.get = async (req, res) => {
  try {
    const category = await Category.find().populate("subCategory", "name image").sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      status: true,
      message: "Retrive categories by the seller.",
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};

//get all category for admin
exports.getCategory = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 }).lean();

    if (categories.length === 0) {
      return res.status(200).json({
        status: true,
        message: "Successfully retrieved all Categories by the admin.",
        category: [],
      });
    }

    const categoryPromises = categories?.map(async (category) => {
      const categoryId = category._id;

      const [categoryProductCount, totalSubcategoryCount] = await Promise.all([Product.countDocuments({ category: categoryId }), category.subCategory.length]);

      const modifiedCategory = {
        _id: category._id,
        name: category.name,
        image: category.image,
        categoryProduct: categoryProductCount,
        totalSubcategory: totalSubcategoryCount,
      };

      return modifiedCategory;
    });

    const modifiedCategories = await Promise.all(categoryPromises);

    return res.status(200).json({
      status: true,
      message: "Successfully retrieved all Categories by the admin.",
      category: modifiedCategories,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server error" });
  }
};
