const Rating = require("../rating/rating.model");

//import model
const User = require("../user/user.model");
const Product = require("../product/product.model");

//create rating
exports.addRating = async (req, res) => {
  try {
    if (!req.query.productId || !req.query.userId || !req.query.rating) {
      return res.status(200).json({ status: false, message: "Oops! Invalid details!!" });
    }

    const [user, product, ratingExist] = await Promise.all([
      User.findById(req.query.userId),
      Product.findById(req.query.productId),
      Rating.findOne({ userId: req.query.userId, productId: req.query.productId }),
    ]);

    if (!user) return res.status(200).json({ status: false, message: "User does not found!!" });

    if (!product) return res.status(200).json({ status: false, message: "No product Was Found!!" });

    if (ratingExist) {
      return res.status(200).json({
        status: false,
        message: "You don't have right to give rate because you have already rated on this product!!",
      });
    }

    const rating = new Rating();

    rating.userId = user._id;
    rating.productId = product._id;
    rating.rating = req.query.rating;
    await rating.save();

    return res.status(200).json({
      status: true,
      message: "Rating given by this user for this product!",
      rating,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error!!",
    });
  }
};

//get rating
exports.getRating = async (req, res) => {
  try {
    const totalRating = await Rating.aggregate([
      {
        $group: {
          _id: "$productId",
          totalUser: { $sum: 1 }, //totalRating by user
          avgRating: { $avg: "$rating" },
        },
      },
      { $sort: { avgRating: -1 } },
    ]);

    return res.status(200).json({ status: true, message: "Success", totalRating });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: error.message || "Internal Server Error",
    });
  }
};
