const Favorite = require("./favorite.model");

//import model
const User = require("../user/user.model");
const Product = require("../product/product.model");
const Category = require("../category/category.model");

//mongoose
const mongoose = require("mongoose");

//create Favorite [Only User can do favorite]  [Add product to favorite list]
exports.store = async (req, res) => {
  try {
    if (!req.body.userId || !req.body.productId || !req.body.categoryId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!" });
    }

    const userId = new mongoose.Types.ObjectId(req.body.userId);
    const categoryId = new mongoose.Types.ObjectId(req.body.categoryId);
    const productId = new mongoose.Types.ObjectId(req.body.productId);

    const [user, category, product, favorite] = await Promise.all([
      User.findById(userId),
      Category.findById(categoryId),
      Product.findOne({ _id: productId, category: categoryId }),
      Favorite.findOne({
        userId: userId,
        productId: productId,
        categoryId: categoryId,
      }),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found!!" });
    }

    if (!category) {
      return res.status(200).json({ status: false, message: "No category Was found!!" });
    }

    if (!product) {
      return res.status(200).json({ status: false, message: "No product Was found!!" });
    }

    if (favorite) {
      await Favorite.deleteOne({
        userId: user._id,
        productId: product._id,
        categoryId: category._id,
      });

      return res.status(200).json({
        status: true,
        message: "Unfavorite successfully!",
        isFavorite: false,
      });
    } else {
      const favorite = new Favorite();
      favorite.userId = user._id;
      favorite.productId = product._id;
      favorite.categoryId = category._id;
      await favorite.save();

      return res.status(200).json({
        status: true,
        message: "Favorite successfully!",
        isFavorite: true,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, error: error.message || "Internal Server Error" });
  }
};

//get product's favorite list for user
exports.getFavoriteList = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(200).json({ status: false, message: "Oops ! Invalid details!!" });
    }

    const userId = new mongoose.Types.ObjectId(req.query.userId);

    const [user, favorite] = await Promise.all([
      User.findById(userId),
      Favorite.aggregate([
        {
          $match: {
            userId: { $eq: userId },
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $lookup: {
            from: "products",
            let: {
              productId: "$productId", // $productId is field of favorite table
            },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $eq: ["$$productId", "$_id"], // $_id is field of product table
                  },
                },
              },
              {
                $lookup: {
                  from: "categories",
                  as: "category",
                  localField: "category", // localField - category is field of product table
                  foreignField: "_id",
                },
              },
              {
                $unwind: {
                  path: "$category",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $lookup: {
                  from: "subcategories",
                  as: "subCategory",
                  localField: "subCategory", // localField - category is field of product table
                  foreignField: "_id",
                },
              },
              {
                $unwind: {
                  path: "$subCategory",
                  preserveNullAndEmptyArrays: false,
                },
              },
              {
                $project: {
                  productName: 1,
                  price: 1,
                  size: 1,
                  mainImage: 1,
                  enableAuction: 1,
                  auctionEndDate: 1,
                  productSaleType: 1,
                  category: "$category.name",
                  subCategory: "$subCategory.name",
                },
              },
            ],
            as: "product",
          },
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            __v: 0,
          },
        },
      ]),
    ]);

    if (!user) {
      return res.status(200).json({ status: false, message: "User does not found." });
    }

    return res.status(200).json({ status: true, message: favorite.length > 0 ? "Success" : "No data found!", favorite: favorite.length > 0 ? favorite : [] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal Server Error",
    });
  }
};
