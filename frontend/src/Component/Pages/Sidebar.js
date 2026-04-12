import $ from "jquery";
import { useNavigate } from "react-router-dom";
import Eralogo22 from "../../assets/images/Eralogo22.png";
import Navigator from "../extra/Navigator";
import { warning } from "../../util/Alert";
import { useDispatch } from "react-redux";
import { LOGOUT_ADMIN } from "../store/admin/admin.type";
import { projectName } from "../../util/config";

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    const data = warning();
    data
      .then((logout) => {
        if (logout) {
          dispatch({ type: LOGOUT_ADMIN });
          navigate("/");
        }
      })
      .catch((err) => console.log(err));
  };

  const handleCloseSideBar = () => {
    if (window.innerWidth <= 992) {
      $(".sideBar").toggleClass("mobSidebar webSidebar");
    }
  };

  const navBarArray = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      iconName: "LayoutDashboard",
      onClick: handleCloseSideBar,
    },

    { sectionTitle: "Product Management" },

    {
      name: "Attribute",
      path: "/admin/attribute",
      iconName: "Key",
      onClick: handleCloseSideBar,
    },
    {
      name: "Category",
      path: "/admin/category",
      path2: "/admin/category/subCategory",
      iconName: "Grid",
      onClick: handleCloseSideBar,
    },
    {
      name: "PromoCode",
      path: "/admin/promocode",
      iconName: "Percent",
      onClick: handleCloseSideBar,
    },
    {
      name: "Product Request",
      iconName: "ShoppingCart",
      subMenu: [
        {
          subName: "Pending Requests",
          subPath: "/admin/pendingProduct",
          onClick2: handleCloseSideBar,
        },
        {
          subName: "Approved Requests",
          subPath: "/admin/approvedProduct",
          onClick2: handleCloseSideBar,
        },
        {
          subName: "Reject Requests",
          subPath: "/admin/rejectedProduct",
          onClick2: handleCloseSideBar,
        },
      ],
    },
    {
      name: "Product",
      // path: "/admin/product",
      iconName: "ShoppingBasket",
      subMenu: [
        {
          subName: "Real",
          subPath: "/admin/product",
          subPath2: "/admin/productDetail",
          subPath3: "/admin/addProduct",
          onClick2: handleCloseSideBar,
        },
        {
          subName: "Fake",
          subPath: "/admin/fakeproduct",
          subPath2: "/admin/fake/productDetail",
          subPath3: "/admin/fake/addProduct",
          // subPath4: "/admin/addProduct",
          // subPath4: "/admin/addProduct",
          onClick2: handleCloseSideBar,
        },
      ],
    },
    {
      name: "Reels",
      iconName: "Film",
      subMenu: [
        {
          subName: "Real",
          subPath: "/admin/reels",
          subPath2: "/admin/real/reels/details",
          onClick2: handleCloseSideBar,
        },
        {
          subName: "Fake",
          subPath: "/admin/fakereels",
          subPath2: "/admin/fake/reels/details",
          onClick2: handleCloseSideBar,
        },
      ],
    },

    { sectionTitle: "Report Management" },

    {
      name: "Reels Report",
      path: "/admin/videoreport",
      iconName: "FileText",
      onClick: handleCloseSideBar,
    },

    {
      name: "Report Reason",
      path: "/admin/reportreason",
      iconName: "TicketsPlane",
      onClick: handleCloseSideBar,
    },


    { sectionTitle: "Order & Seller" },

    {
      name: "Seller",
      iconName: "Store",
      subMenu: [
        {
          subName: "Pending Request",
          subPath: "/admin/sellerRequest",
          onClick2: handleCloseSideBar,
        },
        {
          subName: "Real Seller",
          subPath: "/admin/seller",
          subPath2: "/admin/sellerProfile",
          subPath3: "/admin/addSeller",
          onClick2: handleCloseSideBar,
        },
        {
          subName: "Fake Seller",
          subPath: "/admin/fakeSeller",

          subPath3: "/admin/addFakeSeller",
          onClick2: handleCloseSideBar,
        },
      ],
    },
    {
      name: "Live Seller",
      path: "/admin/liveseller",
      path2: "/admin/liveSellerProduct",
      iconName: "Radio",
      onClick: handleCloseSideBar,
    },
    {
      name: "Order",
      path: "/admin/order",
      path2: "/admin/order/orderDetail",
      iconName: "PackageCheck",
      onClick: handleCloseSideBar,
    },

    { sectionTitle: "User Management" },

    {
      name: "User",
      path: "/admin/user",

      path2: "/admin/UserProfile",
      iconName: "Users",
      onClick: handleCloseSideBar,
    },
    // {
    //   name: "Seller Withdraw",
    //   path: "/admin/redeem",
    //   iconName: "Wallet",
    //   onClick: handleCloseSideBar,
    // },

    { sectionTitle: "Finance" },

    {
      name: "Seller Withdrawal",
      path: "/admin/adminwithdrawal",
      iconName: "Wallet",
      onClick: handleCloseSideBar,
    },

    {
      name: "Admin Earning",
      path: "/admin/wallet",
      iconName: "CreditCard",
      onClick: handleCloseSideBar,
    },

    { sectionTitle: "Help & Settings" },

    {
      name: "FAQ",
      path: "/admin/faq",
      iconName: "HelpCircle",
      onClick: handleCloseSideBar,
    },

    {
      name: "Setting",
      iconName: "Settings",
      subMenu: [
        {
          subName: "App Setting",
          subPath: "/admin/setting",
          onClick2: handleCloseSideBar,
        },
        {
          subName: "Payment Setting",
          subPath: "/admin/paymentSetting",
          onClick2: handleCloseSideBar,
        },
        {
          subName: "Withdraw Setting",
          subPath: "/admin/withDraw",
          onClick2: handleCloseSideBar,
        },
        {
          subName: "Bank Setting",
          subPath: "/admin/bankSetting",
          onClick2: handleCloseSideBar,
        },
        {
          subName: "Currency Setting",
          subPath: "/admin/currencySetting",
          onClick2: handleCloseSideBar,
        },
        {
          subName: "Other Setting",
          subPath: "/admin/others",
          onClick2: handleCloseSideBar,
        },
      ],
    },
    {
      name: "Profile",
      path: "/admin/profilePage",
      iconName: "User",
      onClick: handleCloseSideBar,
    },
    {
      name: "LogOut",
      iconName: "LogOut",
      onClick: handleLogout,
    },
  ];



  return (
    <>
      <div className="mainSidebar border-end " >
        <div className="sideBar webSidebar">
          <div
            className="sideBarLogo "
            onClick={() => navigate("/admin/dashboard")}
          >
            <img src={Eralogo22} alt="" width={"50px"} className="me-2" style={{ color: "#b93160" }} />
            <span className="fs-3 fw-bold" style={{ color: "#b93160", fontSize: "22px", fontWeight: "700" }}>
              {projectName}
            </span>
          </div>
          {/* ======= Navigation ======= */}
          <div className="navigation">
            <nav>
              {navBarArray.map((item, idx) => {
                if (item.sectionTitle) {
                  return (
                    <p
                      key={`section-${idx}`}
                      className="p-6 mb-1  mt-1 text-secondary  "
                      style={{ fontWeight: "300", fontSize: "15px", textTransform: "uppercase" }}
                    >
                      {item.sectionTitle}
                    </p>
                  );
                }

                return (
                  <Navigator
                    key={`nav-${idx}`}
                    name={item.name}
                    path={item.path}
                    path2={item.path2}
                    subPath3={item.path3}
                    iconName={item.iconName}
                    onClick={item.onClick}
                  >
                    {item.subMenu &&
                      item.subMenu.map((sub, subIdx) => (
                        <Navigator
                          key={`sub-${idx}-${subIdx}`}
                          subName={sub.subName}
                          subPath={sub.subPath}
                          subPath2={sub.subPath2}
                          subPath3={sub.subPath3}
                          onClick2={sub.onClick2}
                        />
                      ))}
                  </Navigator>

                );
              })}
            </nav>


          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
