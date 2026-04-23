import { combineReducers } from "redux";
import { dialogueReducer } from "./dialogue/dialogue.reducer";
import { adminReducer } from "./admin/admin.reducer";
import { settingReducer } from "./setting/setting.reducer";
import { dashboardReducer } from "./dashboard/dashboard.reducer";
import { userReducer } from "./user/user.reducer";
import { sellerReducer } from "./seller/seller.reducer";
import { sellerRequestReducer } from "./sellerRequest/sellerRequest.reducer";
import { productReducer } from "./product/product.reducer";
import { categoryReducer } from "./category/category.reducer";
import { orderReducer } from "./order/order.reducer";
import promoCodeReducer from "./PromoCode/promoCode.reducer";
import { FaQReducer } from "./FAQ/faq.reducer";
import { subCategoryReducer } from "./subCategory/subCategory.reducer";
import { withdrawReducer } from "./withdraw/withdraw.reducer";
import { attributeReducer } from "./attribute/attribute.reducer";
import redeemReducer from "./redeem/redeem.reducer";
import { fakeSellerReducer } from "./fake Seller/fakeSeller.reducer";
import { reelsReducer } from "./reels/reels.reducers";
import { fakeReelsReducer } from "./fakeReels/fakeReels.reducers";
import { fakeProductReducer } from "./fakeProduct/fakeProduct.reducer";
import { bankReducer } from "./bank/bank.reducer";
import { currencyReducer } from "./currency/currency.reducer";
import { reportReasonReducer } from "../store/reportReason/reportReason.reducer";
import { videoReportReducer } from "../store/videoReport/videoReport.reducer";
import { giveawayReducer } from "./giveaway/giveaway.reducer";


export default combineReducers({
  dialogue: dialogueReducer,
  admin: adminReducer,
  dashboard: dashboardReducer,
  user: userReducer,
  seller: sellerReducer,
  fakeSeller: fakeSellerReducer,
  category: categoryReducer,
  subCategory: subCategoryReducer,
  attribute: attributeReducer,
  order: orderReducer,
  product: productReducer,
  fakeProduct: fakeProductReducer,
  withdraw: withdrawReducer,
  redeem: redeemReducer,
  promoCode: promoCodeReducer,
  setting: settingReducer,
  FaQ: FaQReducer,
  sellerRequest: sellerRequestReducer,
  reels: reelsReducer,
  fakeReels: fakeReelsReducer,
  bank: bankReducer,
  currency: currencyReducer,
  reportReason : reportReasonReducer,
  videoReport : videoReportReducer,
  giveaway: giveawayReducer,


});
