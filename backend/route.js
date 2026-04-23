const express = require("express");
const app = express.Router();

//path
const path = require("path");

//Admin Route
const AdminRoute = require("./server/admin/admin.route");
app.use("/admin", AdminRoute);

//User Route
const UserRoute = require("./server/user/user.route");
app.use("/user", UserRoute);

//OTP Route
const OTPRoute = require("./server/otp/otp.route");
app.use("/OTP", OTPRoute);

//Follower Route
const FollowerRoute = require("./server/follower/follower.route");
app.use("/follower", FollowerRoute);

//Category Route
const CategoryRoute = require("./server/category/category.route");
app.use("/category", CategoryRoute);

//Rating Route
const RatingRoute = require("./server/rating/rating.route");
app.use("/rate", RatingRoute);

//Review Route
const ReviewRoute = require("./server/review/review.route");
app.use("/review", ReviewRoute);

//Favorite Route
const FavoriteRoute = require("./server/favorite/favorite.route");
app.use("/favorite", FavoriteRoute);

//Product Route
const ProductRoute = require("./server/product/product.route");
app.use("/product", ProductRoute);

//LiveSeller Route
const LiveSellerRoute = require("./server/liveSeller/liveSeller.route");
app.use("/liveSeller", LiveSellerRoute);

//Location Route
const AddressRoute = require("./server/address/address.route");
app.use("/address", AddressRoute);

//Cart Route
const CartRoute = require("./server/cart/cart.route");
app.use("/cart", CartRoute);

//Order Route
const OrderRoute = require("./server/order/order.route");
app.use("/order", OrderRoute);

//Setting Route
const SettingRoute = require("./server/setting/setting.route");
app.use("/setting", SettingRoute);

//PromoCode Route
const PromoCodeRoute = require("./server/promoCode/promoCode.route");
app.use("/promoCode", PromoCodeRoute);

//FAQ Route
const FAQRoute = require("./server/FAQ/FAQ.route");
app.use("/FAQ", FAQRoute);

//Request Route
const SellerRequestRoute = require("./server/sellerRequest/sellerRequest.route");
app.use("/request", SellerRequestRoute);

//Seller Route
const SellerRoute = require("./server/seller/seller.route");
app.use("/seller", SellerRoute);

//SellerWallet Route
const sellerWalletRoute = require("./server/sellerWallet/sellerWallet.route");
app.use("/sellerWallet", sellerWalletRoute);

//Withdraw Route
const withdrawRoute = require("./server/withdraw/withdraw.route");
app.use("/withdraw", withdrawRoute);

//SubCategory Route
const SubCategoryRoute = require("./server/subCategory/subCategory.route");
app.use("/subCategory", SubCategoryRoute);

//Dashboard Route
const DashboardRoute = require("./server/dashboard/dashboard.route");
app.use("/dashboard", DashboardRoute);

//Attributes Route
const AttributesRoute = require("./server/attributes/attributes.route");
app.use("/attributes", AttributesRoute);

//ProductRequest Route
const ProductRequestRoute = require("./server/productRequest/productRequest.route");
app.use("/productRequest", ProductRequestRoute);

//PromoCodeCheck Route
const PromoCodeCheckRoute = require("./server/promoCodeCheck/promocoCodeCheck.route");
app.use("/promoCodeCheck", PromoCodeCheckRoute);

//Notification route
const NotificationRoute = require("./server/notification/notification.route");
app.use("/notification", NotificationRoute);

//Reel route
const ReelRoute = require("./server/reel/reel.route");
app.use("/reel", ReelRoute);

//ReportToReel route
const ReportToReelRoute = require("./server/reportoReel/reportoReel.route");
app.use("/reportToReel", ReportToReelRoute);

//Bank Route
const BankRoute = require("./server/bank/bank.route");
app.use("/bank", BankRoute);

//Currency Route
const CurrencyRoute = require("./server/currency/currency.route");
app.use("/currency", CurrencyRoute);

//WithdrawRequest Route
const WithdrawRequestRoute = require("./server/withdrawRequest/withdrawRequest.route");
app.use("/withdrawRequest", WithdrawRequestRoute);

//AuctionBid Route
const AuctionBidRoute = require("./server/auctionBid/auctionBid.route");
app.use("/auctionBid", AuctionBidRoute);

//Giveaway Route
const GiveawayRoute = require("./server/giveaway/giveaway.route");
app.use("/giveaway", GiveawayRoute);

//Reportreason Route
const ReportreasonRoute = require("./server/reportReason/reportReason.route");
app.use("/reportReason", ReportreasonRoute);

//Login Route
const LoginRoute = require("./server/login/login.route");
app.use("/", LoginRoute);

module.exports = app;
