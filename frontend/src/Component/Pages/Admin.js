import { useEffect } from "react";
import {
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Dashboard from "../Table/dashboard/Dashboard";
import User from "../Table/user/User";
import Setting from "../Table/setting/Setting";
import $ from "jquery";

import UserProfile from "../Table/user/UserProfile";
import Seller from "../Table/seller/Seller";
import AdminProfile from "../Table/admin/AdminProfile";
import SellerRequest from "../Table/sellerRequest/SellerRequest";
import SellerProfile from "../Table/seller/SellerProfile";
import AddSeller from "../Table/seller/AddSeller";
import Product from "../Table/Product/Product";
import ProductDetail from "../Table/Product/ProductDetail";
import Category from "../Table/category/Category";
// import Order from "../Table/Order/Order";
import Order from "../Table/Order/Order";
import OrderDetail from "../Table/Order/OrderDetail";
import PromoCode from "../Table/PromoCode/PromoCode";
import FaQ from "../Table/FAQ/Faq";
import Withdraw from "../Table/withdraw/Withdraw";
import Attribute from "../Table/Attribute/Attribute";
import Redeem from "../Table/redeem/Redeem";
import CategoryWiseSubCategory from "../Table/subCategory/CategoryWiseSubCategory";
import PendingProduct from "../Table/Product/PendingProduct";
import ApprovedProduct from "../Table/Product/ApprovedProduct";
import RejectedProduct from "../Table/Product/RejectedProduct";
import AddProduct from "../Table/Product/AddProduct";
import PaymentSetting from "../Table/setting/paymentSetting";
import UpdateRequest from "../Table/Product/UpdateRequest";
import UpdateProducutApproved from "../Table/Product/UpdateProducutApproved";
import UpdateProductRejected from "../Table/Product/UpdateProductRejected";
import SellerOrderDetail from "../Table/seller/Profile/SellerOrderDetail";
import LiveSeller from "../Table/liveSeller/LiveSeller";
import LiveSellerProduct from "../Table/liveSeller/LiveSellerProduct";
import AdminWallet from "../Table/admin/AdminWallet";
// import EditSellerR from "../Table/sellerRequest/EditSellerR";
import EditSellerRequest from "../Table/sellerRequest/EditSellerRequest";
import FakeSeller from "../Table/fakeSeller/FakeSeller";
import Reels from "../Table/reels/Reels";
import FakeReels from "../Table/fakeReels/FakeReels";
import ReelsInfo from "../Table/reels/ReelsInfo";
// import ReportedReels from "../Table/reels/ReportedReels";
import FakeSellerDialogue from "../Table/fakeSeller/FakeSellerDialogue";
import FakeProduct from "../Table/FakeProduct/FakeProduct";
import { useSelector } from "react-redux";
import BankSetting from "../Table/bank/BankSetting";
import CurrencySetting from "../Table/currencySetting/currencySetting";
import AdminEarning from "../Table/admin/AdminEarning";
import AdminWithdrawal from "../Table/AdminWithdrawal/AdminWithdrawal";
import ReportReason from "../Table/reportReason/ReportReason";
import { Video } from "lucide-react";
import VideoReport from "../Table/videoReport/VideoReport";
import Others from "../Table/other/Others";
import Giveaway from "../Table/giveaway/Giveaway";

export const token = sessionStorage.getItem("token");

const Admin = ({ isAuthenticated }) => {
  const navigate = useNavigate();
  const location = useLocation();


  const { isAuth } = useSelector((state) => state.admin);

  useEffect(() => {
    if (
      location.pathname == "/" ||
      location.pathname == "/admin" ||
      location.pathname == "" ||
      location.pathname == "/admin/"
    ) {
      navigate("/admin/dashboard");
    }
  }, []);

  useEffect(() => {
    $(document).ready(function () {
      $(".subMenu").hide();

      $(".mainMenu > li > a").click(function () {
        if ($(this).next(".subMenu").is(":visible")) {
          // If it's open, close it
          $(this).next(".subMenu").slideUp();
          $(this).children("i").removeClass("rotate90");
        } else {
          // If it's closed, close all other submenus and open the clicked one
          $(".subMenu").slideUp();
          $(".mainMenu > li > a").children("i").removeClass("rotate90");
          $(this).next(".subMenu").slideDown();
          $(this).children("i").addClass("rotate90");
        }
      });

      $(".navToggle").click(function () {
        $(".mainNavbar").toggleClass("mobNav webNav");
        $(".sideBar").toggleClass("mobSidebar webSidebar");
        $(".mainAdmin").toggleClass("mobAdmin");
      });
    });
  }, []);

  return (
    <>
      <div className="mainContainer d-flex w-100">
        <div className="containerLeft">
          <Sidebar />
        </div>
        <div className="containerRight w-100">
          <Navbar />
          <div className="mainAdmin">
            <Routes>
              {/* dashboard */}
              <Route path="/dashboard" element={<Dashboard />} />

              {/* user */}

              <Route path="/user" element={<User />} />
              <Route path="/UserProfile" element={<UserProfile />} />
              <Route
                path="/sellerRequestEdit"
                element={<EditSellerRequest />}
              />

              {/* seller */}
              <Route path="/seller" element={<Seller />} />
              <Route path="/fakeSeller" element={<FakeSeller />} />
              <Route path="/addFakeSeller" element={<FakeSellerDialogue />} />
              <Route path="/liveSeller" element={<LiveSeller />} />
              <Route
                path="/liveSellerProduct"
                element={<LiveSellerProduct />}
              />
              <Route path="/sellerProfile" element={<SellerProfile />} />
              <Route path="/addSeller" element={<AddSeller />} />
              <Route
                path="/sellerOrderDetail"
                element={<SellerOrderDetail />}
              />
              {/* seller Request */}
              <Route path="/sellerRequest" element={<SellerRequest />} />

              {/* category  && subCategory */}
              <Route path="/category" element={<Category />} />
              <Route
                path="/category/subCategory"
                element={<CategoryWiseSubCategory />}
              />

              {/* attributes */}
              <Route path="/attribute" element={<Attribute />} />

              {/* Product */}
              <Route path="/product" element={<Product />} />
              <Route path="/addProduct" element={<AddProduct />} />
              <Route path="/fake/addProduct" element={<AddProduct />} />

              <Route path="/productDetail" element={<ProductDetail />} />
              <Route path="/fake/productDetail" element={<ProductDetail />} />

              {/* Fake Product */}
              <Route path="/fakeProduct" element={<FakeProduct />} />

              {/* video Report */}
              <Route path="/videoreport" element={<VideoReport />} />


              {/* create Product Request by App */}
              <Route path="/pendingProduct" element={<PendingProduct />} />
              <Route path="/approvedProduct" element={<ApprovedProduct />} />
              <Route path="/rejectedProduct" element={<RejectedProduct />} />

              {/* update Product Request by App */}

              <Route path="/pendingUpdateRequest" element={<UpdateRequest />} />
              <Route
                path="/approvedUpdateRequest"
                element={<UpdateProducutApproved />}
              />
              <Route
                path="/rejectedUpdateRequest"
                element={<UpdateProductRejected />}
              />

              {/* order */}
              <Route path="/order" element={<Order />} />
              <Route path="/order/orderDetail" element={<OrderDetail />} />

              {/* promoCode */}
              <Route path="/promoCode" element={<PromoCode />} />

              {/* FaQ */}
              <Route path="/faq" element={<FaQ />} />

              {/* Withdraw Methods*/}
              <Route path="/withDraw" element={<Withdraw />} />

              {/* Seller Withdraw */}
              {/* <Route path="/redeem" element={<Redeem />} /> */}

              {/* admin Profile */}
              <Route path="/profilePage" element={<AdminProfile />} />
              {/* <Route path="/wallet" element={<AdminWallet />} /> */}
              <Route path="/adminwithdrawal" element={<AdminWithdrawal />} />
              <Route path="/wallet" element={<AdminEarning />} />

              {/* setting */}
              <Route path="/setting" element={<Setting />} />
              <Route path="/currencySetting" element={<CurrencySetting />} />
              <Route path="/paymentSetting" element={<PaymentSetting />} />
              <Route path="/bankSetting" element={<BankSetting />} />
              <Route path="/reportreason" element={<ReportReason />} />
              <Route path="/others" element={<Others />} />

              {/* reels */}

              <Route path="/reels" element={<Reels />} />
              {/* <Route path="/reportedReels" element={<ReportedReels />} /> */}

              <Route path="/real/reels/details" element={<ReelsInfo />} />

              <Route path="/fake/reels/details" element={<ReelsInfo />} />


              {/* fake reels */}

              <Route path="/fakeReels" element={<FakeReels />} />

              {/* giveaway */}
              <Route path="/giveaway" element={<Giveaway />} />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
};

export default Admin;
