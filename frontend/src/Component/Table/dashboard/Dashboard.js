import { useEffect, useRef, useState } from "react";

import {
  getDashboard,
  getTopSellingProduct,
  getTopSellingSeller,
  getTopUser,
  getPopularProduct,
  getRecenetOrder,
  getUser,
  getOrder,
  getUserChart,
  getRevenueChart,
} from "../../store/dashboard/dashboard.action";
import { connect, useDispatch, useSelector } from "react-redux";

// chart
import { Chart as ChartJS, registerables } from "chart.js";
import { Line } from "react-chartjs-2";

import Table from "../../extra/Table";
import Table2 from "../../extra/Table2";
import { useNavigate } from "react-router-dom";
import { DateRangePicker } from "react-date-range";

import DateRangePicker1 from "react-bootstrap-daterangepicker";
import DateRangePicker2 from "react-bootstrap-daterangepicker";
import "bootstrap-daterangepicker/daterangepicker.css";
//Calendar Css
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css";

import dayjs from "dayjs";
import { getDefaultCurrency } from "../../store/currency/currency.action";
import { getAdminEarning } from "../../store/redeem/redeem.action";
import { getCategory } from "../../store/category/category.action";
import { getAllSubcategory } from "../../store/attribute/attribute.action";
import formatImageUrl from "../../extra/functions";
import defaultImage from "../../../assets/images/default.jpg";
import { getProfile } from "../../store/admin/admin.action";

const Dashboard = (props) => {
  let label = [];
  let label1 = [];
  let dataUser = [];
  let data = [];
  let dataTotal = [];
  let dataWith = [];
  let dataWithOut = [];
  const {
    dashboard,
    product,
    seller,
    user,
    orderData,
    popularProduct,
    recentOrders,
    userCount,
    userChart,
    total,
    withCom,
    withOut,
  } = useSelector((state) => state.dashboard);

  const { adminTotalEarnings } = useSelector((state) => state.redeem);

  const { category } = useSelector((state) => state.category);
  const { subcategory } = useSelector((state) => state.attribute);



  useEffect(() => {
    dispatch(getAdminEarning("1", "10", "All", "All"));
    dispatch(getCategory());
    dispatch(getAllSubcategory());
  }, [])



  const [type, setType] = useState("Product");
  const [order, setOrder] = useState([]);

  const [page, setPage] = useState(1);

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateRangerShowType, setDateRangerShowType] = useState({
    toggle: false,
    type: "",
  });
  const dispatch = useDispatch();
  const [date, setDate] = useState([]);
  const [sDate, setsDate] = useState("All");
  const [eDate, seteDate] = useState("All");

  const [date2, setDate2] = useState([]);

  const [sDate3, setSDate3] = useState("All");
  const [eDate3, setEDate3] = useState("All");

  const [sDate2, setsDate2] = useState("All");
  const [eDate2, seteDate2] = useState("All");

  const startDateFormat = (startDate) => {
    return startDate && dayjs(startDate).isValid()
      ? dayjs(startDate).format("YYYY-MM-DD")
      : dayjs().subtract(7, "day").format("YYYY-MM-DD");
  };
  const endDateFormat = (endDate) => {
    return endDate && dayjs(endDate).isValid()
      ? dayjs(endDate).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");
  };

  const startDateData = startDateFormat(sDate);
  const endDateData = endDateFormat(eDate);

  const { defaultCurrency } = useSelector((state) => state.currency);

  const [userChartData, setUserChartData] = useState();

  // chart

  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");

  const [sDate1, setSDate1] = useState("All");
  const [eDate1, setEDate1] = useState("All");


  const startDateFormat1 = (startDate) => {
    return startDate && dayjs(startDate).isValid()
      ? dayjs(startDate).format("YYYY-MM-DD")
      : dayjs().subtract(7, "day").format("YYYY-MM-DD");
  };
  const endDateFormat1 = (endDate) => {
    return endDate && dayjs(endDate).isValid()
      ? dayjs(endDate).format("YYYY-MM-DD")
      : dayjs().format("YYYY-MM-DD");
  };

  // const startDateData1 = startDateFormat1(sDate1);
  // console.log("startDateData1", startDateData1);

  // const endDateData1 = endDateFormat1(eDate1);
  // console.log("endDateData1", endDateData1);
  const startDateData1 = sDate1 === 'All' ? 'All' : dayjs(sDate1).format('YYYY-MM-DD');
  console.log("startDateData1", startDateData1);

  const endDateData1 = eDate1 === 'All' ? 'All' : dayjs(eDate1).format('YYYY-MM-DD');
  console.log("endDateData1", endDateData1);




  const [analyticTotal, setAnalyticTotal] = useState([]);
  const [analyticWith, setAnalyticWith] = useState([]);
  const [analyticWithOut, setAnalyticWithOut] = useState([]);
  const dateRangePickerRef = useRef();
  const dateRangePickerRef1 = useRef();

  useEffect(() => {
    dispatch(getProfile());
  }, [])

  useEffect(() => {
    dispatch(getDefaultCurrency())
  }, [dispatch])

  useEffect(() => {
    setAnalyticTotal(total);

  }, [total]);

  useEffect(() => {
    setAnalyticWith(withCom);
  }, [withCom]);
  useEffect(() => {
    setAnalyticWithOut(withOut);
  }, [withOut]);

  var dateAnalytic = new Date();
  var firstDay = new Date(
    dateAnalytic?.getFullYear(),
    dateAnalytic?.getMonth() - 1,
    1
  );

  const maxDate = new Date();

  const navigate = useNavigate();

  useEffect(() => {
    dispatch(getDashboard());
    dispatch(getTopSellingProduct());
    dispatch(getTopSellingSeller());
    dispatch(getTopUser());
    dispatch(getPopularProduct());
    dispatch(getRecenetOrder());
    dispatch(getOrder(startDate, endDate));
  }, [dispatch, startDate, endDate]);

  useEffect(() => {
    dispatch(getUserChart(startDateData, endDateData));
  }, [dispatch, startDateData, endDateData]);

  useEffect(() => {
    dispatch(getRevenueChart(startDateData1, endDateData1));
  }, [dispatch, startDateData1, endDateData1]);

  useEffect(() => {
    if (sDate3 === "All" && eDate3 === "All") {

      dispatch(getUser(sDate1, eDate1));
    }
  }, [dispatch, sDate3, eDate3]);

  useEffect(() => {
    setOrder(recentOrders);
    // setUserData(userCount);
    // setOrderDate(orderData);
    setUserChartData(userChart);
  }, [recentOrders, userChart]);

  const collapsedDatePicker = (type) => {
    if (type === "dateRangeOne") {
      setDateRangerShowType({
        type: "dateRangeOne",
        toggle: !dateRangerShowType.toggle,
      });
    } else {
      setDateRangerShowType({
        type: "dateRangeTwo",
        toggle: !dateRangerShowType.toggle,
      });
    }
  };

  const handleCloseDateRange = () => {
    setDateRangerShowType({
      type: "",
      toggle: false,
    });
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dateRangePickerRef.current &&
        !dateRangePickerRef.current.contains(event.target) &&
        dateRangePickerRef1.current &&
        !dateRangePickerRef1.current.contains(event.target)
      ) {
        handleCloseDateRange();
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  // Display the label name based on the startDatee
  useEffect(() => {
    if (date.length === 0) {
      setDate([
        {
          startDate: new Date(),
          endDate: new Date(),

          key: "selection",
        },
      ]);
    }
  }, [date]);

  useEffect(() => {
    if (date2.length === 0) {
      setDate2([
        {
          startDate: new Date(),
          endDate: new Date(),

          key: "selection",
        },
      ]);
    }
  }, [date2]);

  const handleOpen = (id) => {
    navigate("/admin/order/orderDetail", {
      state: id,
    });
  };

  // CHART

  if (userChartData?.length > 0) {
    userChartData.map((data_) => {
      const newDate = data_._id;

      var date;
      if (newDate._id) {
        data = dayjs(newDate?._id).format("DD MMM YYYY");
      } else {
        date = dayjs(newDate).format("DD MMM YYYY");
      }

      date?.length > 0 && label1.push(date);

      dataUser.push(data_.count);
    });
  }

  const chartData = {
    labels: label1,

    datasets: [
      {
        type: "line",
        label: "User",
        data: dataUser,
        fill: false,
        backgroundColor: "rgba(185,49,96,0.24)",
        borderColor: "#B93160",
        lineTension: 0.5,
        pointBorderWidth: 2,
      },
    ],
  };

  const handleApply = (event, picker) => {
    picker.element.val(
      picker.startDate.format("YYYY-MM-DD") +
      " / " +
      picker.endDate.format("YYYY-MM-DD")
    );
    const dayStart = dayjs(picker.startDate).format("YYYY-MM-DD");

    const dayEnd = dayjs(picker.endDate).format("YYYY-MM-DD");

    setsDate(dayStart);
    seteDate(dayEnd);

    dispatch(getUserChart(dayStart, dayEnd));
  };

  //Cancel button function for analytic
  const handleCancel = (event, picker) => {
    picker.element.val("");
    setsDate("All");
    seteDate("All");
    dispatch(getUserChart("All", "All"));
  };

  // revenue chart

  if (
    analyticTotal?.length > 0 ||
    analyticWith?.length > 0 ||
    analyticWithOut?.length > 0
  ) {
    analyticTotal.map((data_) => {
      const newDate = data_._id;

      var date;
      if (newDate._id) {
        data = dayjs(newDate?._id).format("DD MMM YYYY");
      } else {
        date = dayjs(newDate).format("DD MMM YYYY");
      }

      date?.length > 0 && label.push(date);

      dataTotal.push(data_?.totalCommission);
    });
  }

  if (analyticWith?.length > 0 || analyticWithOut?.length > 0) {
    analyticWith.map((data_, index) => {
      const newDate = data_._id;

      var date;
      if (newDate._id) {
        date = newDate?._id.split("T");
      } else {
        date = newDate.split("T");
      }

      dataWith.push(data_?.totalEarningWithCommission);
    });
  }

  if (analyticWithOut?.length > 0) {
    analyticWithOut.map((data_, index) => {
      const newDate = data_._id;

      var date;
      if (newDate._id) {
        date = newDate?._id.split("T");
      } else {
        date = newDate.split("T");
      }

      dataWithOut.push(data_?.totalEarningWithoutCommission);
    });
  }



  const chartData1 = {
    labels: label,
    datasets: [
      {
        type: "line",
        label: "Total Earning",
        data: dataTotal,
        fill: false,
        backgroundColor: "rgba(185,49,96,0.24)",
        borderColor: "#B93160",
        lineTension: 0.5,
        pointBorderWidth: 2,
      },
      {
        type: "line",
        label: "Earning With Commission",
        data: dataWith,
        fill: false,
        backgroundColor: "rgba(78, 78, 105, 0.3)",
        borderColor: "#4E4E69",
        lineTension: 0.5,
        pointBorderWidth: 2,
      },
      {
        type: "line",
        label: "Earning WithOut Commission",
        data: dataWithOut,
        fill: false,
        backgroundColor: "rgb(218, 244, 240,0.3)",
        borderColor: "#B9DBFF",
        lineTension: 0.5,
        pointBorderWidth: 2,

      },
    ],
  };



  const handleApply1 = (event, picker) => {
    picker.element.val(
      picker.startDate.format("YYYY-MM-DD") +
      " / " +
      picker.endDate.format("YYYY-MM-DD")
    );
    const dayStart = dayjs(picker.startDate).format("YYYY-MM-DD");

    const dayEnd = dayjs(picker.endDate).format("YYYY-MM-DD");

    setSDate1(dayStart);
    setEDate1(dayEnd);

    dispatch(getRevenueChart(dayStart, dayEnd));
  };

  //Cancel button function for analytic
  const handleCancel1 = (event, picker) => {
    picker.element.val("");
    // setSDate1(sDate1);
    // setEDate1(eDate1);
    // dispatch(getRevenueChart(sDate1, eDate1));
    setSDate1("All");
    setEDate1("All");
    dispatch(getRevenueChart("All", "All"));
  };

  // Order Table Data
  const mapData = [
    {
      Header: "No",
      width: "60px",
      Cell: ({ index }) => <span className="py-4 text-white fw-normal">{index + 1}</span>,
    },

    {
      Header: "Order Id",
      body: "orderId",
      Cell: ({ row }) => (
        <span
          className="tableBoldFont orderIdText py-4"
          style={{
            cursor: "pointer",
            color: "#0B5ED7",
          }}
          onClick={() => handleOpen(row._id)}
        >
          <b className="fw-normal text-white">{row?.orderId}</b>
        </span>
      ),
    },

    {
      Header: "User",
      body: "user",
      Cell: ({ row }) => (
        <div>
          <span className="tableBoldFont py-4">
            <b className="fw-normal text-white">
              {row?.userId?.firstName
                ? row?.userId?.firstName + " "
                : "EraShop" + " "}
              {row?.userId?.lastName ? row?.userId?.lastName : "User"}
            </b>
          </span>
        </div>
      ),
    },
    {
      Header: "PaymentGateway",
      body: "paymentGateway",
      Cell: ({ row }) => <span className="py-4 text-white fw-normal">{row?.paymentGateway}</span>,
    },
    {
      Header: `Total (${defaultCurrency?.symbol})`,
      body: "totalPrice",
      Cell: ({ row }) => (
        <>
          <span className="py-4 text-white fw-normal">{row?.subTotal}</span>
        </>
      ),
    },

    // add more columns as needed
  ];

  const mapData1 = [
    {
      Header: "No",
      width: "60px",
      Cell: ({ index }) => <span className="text-white fw-normal">{index + 1}</span>,
    },
    {
      Header: "User",
      body: "firstName",
      Cell: ({ row }) => (
        <div
          className="d-flex"
          onClick={() => navigate("/admin/userProfile", { state: row._id })}
          style={{ cursor: "pointer" }}
        >
          <div className="">
            <img
              src={formatImageUrl(row?.image)}
              style={{ borderRadius: "10px" }}
              height={50}
              width={50}
              alt=""
              onError={(e) => {
                e.target.error = null;
                e.target.src = defaultImage;
              }}
            />
          </div>
          <span
            className="fw-bold d-flex align-items-center text-start"
            style={{ paddingLeft: "10px" }}
          >
            <b className="fw-normal text-capitalize text-white" >
              {row.firstName + " " + row.lastName}
            </b>
          </span>
        </div>
      ),
    },

    {
      Header: "Country",
      body: "location",
      Cell: ({ row }) => {
        return (
          <>
            <div className="">
              <span className="fw-normal text-uppercase">
                <p className="mb-0 text-uppercase fw-normal text-white">{row?.location}</p>
              </span>
            </div>
          </>
        );
      },
    },
    {
      Header: "Total Order",
      body: "orderCount",
      Cell: ({ row }) => (
        <span className="mb-0 fw-normal text-white">
          {row.orderCount ? row.orderCount : 0}
        </span>
      ),
    },

    // add more columns as needed
  ];
  const mapData2 = [
    {
      Header: "No",
      width: "60px",
      Cell: ({ index }) => <span className="text-white fw-normal">{index + 1}</span>,
    },
    {
      Header: "Seller",
      body: "firstName",
      Cell: ({ row }) => (
        <div
          className="d-flex"
          onClick={() => navigate("/admin/sellerProfile", { state: row._id })}
          style={{ cursor: "pointer" }}
        >
          <div className="position-relative">
            <img
              src={row?.image}
              style={{ borderRadius: "10px" }}
              height={50}
              width={50}
              alt=""
            />
          </div>
          <span
            className="d-flex align-items-center text-start text-white fw-normal"
            style={{ paddingLeft: "30px" }}
          >
            <b className=" fw-normal">{row?.firstName + " " + row?.lastName}</b>
          </span>
        </div>
      ),
    },

    {
      Header: "Total Product",
      body: "totalProduct",
      Cell: ({ row }) => (
        <span
          className="mb-0 fw-normal text-dark"
          style={{
            backgroundColor: "#c6e7ff",
            color: "#000",
            padding: "10px 15px",
            borderRadius: "5px",
          }}
        >
          {row.totalProduct ? row.totalProduct : 0}
        </span>
      ),
    },

    {
      Header: "Total Sold Product",
      body: "totalSales",
      Cell: ({ row }) => (
        <span className="mb-0 text-white fw-normal">
          {row.totalProductsSold ? row.totalProductsSold : "0"}
        </span>
      ),
    },

    // add more columns as needed
  ];
  const mapData3 = [
    {
      Header: "No",
      width: "60px",
      Cell: ({ index }) => <span className="text-white fw-normal">{parseInt(index) + 1}</span>,
    },
    {
      Header: "Product",
      body: "images",
      Cell: ({ row }) => (
        <div
          className="d-flex"
          onClick={() => navigate("/admin/productDetail", { state: row?._id })}
          style={{ cursor: "pointer" }}
        >
          <div className="">
            <img
              src={row?.mainImage}
              height={50}
              width={50}
              style={{ borderRadius: "10px" }}
              alt=""
            />
          </div>
          <span className=" boxCenter ms-3 text-white fw-normal">
            {row?.productName}
          </span>
        </div>
      ),
    },

    {
      Header: "Sold",
      Cell: ({ row }) => (
        <span className="tableBoldFont">
          <b className="fw-normal text-white">{row?.sold}</b>
        </span>
      ),
    },
    {
      Header: "Rating",
      Cell: ({ row }) => (
        <span className="tableBoldFont">
          <i className="bi bi-star-fill text-white"></i>
          <b className="fw-normal text-white">{"(" + row?.rating + ")"}</b>
        </span>
      ),
    },
  ];

  const mapData4 = [
    {
      Header: "No",
      width: "60px",
      Cell: ({ index }) => <span className="text-white fw-normal">{parseInt(index) + 1}</span>,
    },
    {
      Header: "Product",
      body: "images",
      Cell: ({ row }) => (
        <div
          className="d-flex"
          onClick={() => navigate("/admin/productDetail", { state: row?._id })}
          style={{ cursor: "pointer" }}
        >
          <div className="">
            <img
              src={row?.mainImage}
              height={50}
              width={50}
              style={{ borderRadius: "10px" }}
              alt=""
            />
          </div>
          <span className="fw-normal boxCenter" style={{ paddingLeft: "30px" }}>
            <b className="fw-normal text-white">{row?.productName}</b>
          </span>
        </div>
      ),
    },

    {
      Header: "Category",
      Cell: ({ row }) => (
        <span className="tableBoldFont">
          <p className="mb-0 fw-normal text-white">{row?.categoryName}</p>
        </span>
      ),
    },

    {
      Header: "Rating",
      Cell: ({ row }) => (
        <span className="tableBoldFont">
          <i className="bi bi-star-fill fw-normal text-white"></i>
          <b className="fw-normal text-white">{"(" + row?.rating + ")"}</b>
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="mainDashboard">
        <div className="dashboard">
          <div className="row ">
            <div
              className="col-xl-3 col-lg-4 col-md-6 col-12 mb-4"
              style={{ cursor: "pointer" }}
            >
              <div
                className="wow-card4 p-4 d-flex flex-column justify-content-between h-100"
                onClick={() => navigate("/admin/user")}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 metric-title4">Total Users</p>
                    <h2 className="mb-0 metric-value4">
                      {sDate3 === "Today" ? userCount?.todayUsers : userCount?.totalUsers}
                    </h2>
                  </div>
                  <div className="metric-icon4">
                    <i className="bi bi-people-fill"></i>
                  </div>
                </div>
                <div className="border-top mt-3">
                  <span className="metric-link4">View All Details</span>
                </div>
              </div>

              <style jsx>{`
    .wow-card4 {
      background: linear-gradient(145deg, #ffffff,rgb(231, 245, 252));
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .wow-card4:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    }

    .metric-title4 {
      font-size: 14px;
      color: #6b7280; /* Gray-500 */
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .metric-value4 {
      font-size: 30px;
      font-weight: 500;
      color: #2f2b3de6; /* Gray-900 */
    }

    .metric-icon4 {
      background: radial-gradient(circle at 30% 30%,rgb(71, 165, 228), #3b82f6);
      border-radius: 30%;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 26px;
    }

    .metric-link4 {
      font-size: 14px;
      color: #B93160; /* Blue-500 */
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .metric-link4:hover {
      color: #1d4ed8; /* Blue-700 */
    }
  `}</style>
            </div>

            <div
              className="col-xl-3 col-lg-4 col-md-6 col-12 mb-4"
              style={{ cursor: "pointer" }}
            >
              <div
                className="wow-card2 p-4 d-flex flex-column justify-content-between h-100"
                onClick={() => navigate("/admin/order")}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 metric-title2">Total Orders</p>
                    <h2 className="mb-0 metric-value2">
                      {orderData?.totalOrders}
                    </h2>
                  </div>
                  <div className="metric-icon2">
                    <i className="bi bi-bag-fill"></i>
                  </div>
                </div>
                <div className="border-top mt-3">
                  <span className="metric-link2">View All Details</span>
                </div>
              </div>

              <style jsx>{`
    .wow-card2 {
      background: linear-gradient(145deg, #ffffff,rgb(253, 251, 236));
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .wow-card2:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    }

    .metric-title2 {
      font-size: 14px;
      color: #6b7280; /* Gray-500 */
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .metric-value2 {
     font-size: 30px;
      font-weight: 500;
      color: #2f2b3de6; /* Gray-900 */
    }

    .metric-icon2 {
      background: radial-gradient(circle at 30% 30%, #f59e0b, #fbbf24);
      border-radius: 30%;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 26px;
    }

    .metric-link2 {
      font-size: 14px;
      color: #B93160; /* Amber-500 */
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .metric-link2:hover {
      color: #f59e0b; /* Amber-700 */
    }
  `}</style>
            </div>

            <div
              className="col-xl-3 col-lg-4 col-md-6 col-12 mb-4"
              style={{ cursor: "pointer" }}
            >
              <div
                className="wow-card1 p-4 d-flex flex-column justify-content-between h-100"
                onClick={() => navigate("/admin/liveSeller")}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 metric-title1">Live Sellers</p>
                    <h2 className="mb-0 metric-value1">
                      {dashboard?.totalLiveSeller}
                    </h2>
                  </div>
                  <div className="metric-icon1">
                    <i className="bi bi-broadcast"></i>
                  </div>
                </div>
                <div className="border-top mt-3">
                  <span className="metric-link1">View All Details</span>
                </div>
              </div>

              <style jsx>{`
    .wow-card1 {
     background: linear-gradient(145deg, #ffffff,rgb(255, 234, 230));
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .wow-card1:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    }

    .metric-title1 {
      font-size: 14px;
      color: #6b7280; /* Gray-500 */
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .metric-value1 {
     font-size: 30px;
      font-weight: 500;
      color: #2f2b3de6; /* Gray-900 */
    }

    .metric-icon1 {
      background: radial-gradient(circle at 30% 30%, #ef4444, #f87171);
      border-radius: 30%;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 26px;
    }

    .metric-link1 {
      font-size: 14px;
      color: #B93160; /* Red-500 */
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .metric-link1:hover {
      color: #b91c1c; /* Red-700 */
    }
  `}</style>
            </div>


            <div
              className="col-xl-3 col-lg-4 col-md-6 col-12 mb-4"
              style={{ cursor: "pointer" }}
            >
              <div
                className="wow-card3 p-4 d-flex flex-column justify-content-between h-100"
                onClick={() => navigate("/admin/product")}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 metric-title3">Total Products</p>
                    <h2 className="mb-0 metric-value3">
                      {dashboard?.totalProducts}
                    </h2>
                  </div>
                  <div className="metric-icon3">
                    <i className="bi bi-box-seam"></i>
                  </div>
                </div>
                <div className="border-top mt-3">
                  <span className="metric-link3">View All Details</span>
                </div>
              </div>

              <style jsx>{`
    .wow-card3 {
      background: linear-gradient(145deg, #ffffff, #fff7ed);
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .wow-card3:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    }

    .metric-title3 {
      font-size: 14px;
      color: #6b7280; 
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .metric-value3 {
     font-size: 30px;
      font-weight: 500;
      color: #2f2b3de6; /* Gray-900 */
    }

    .metric-icon3 {
      background: radial-gradient(circle at 30% 30%, #f97316, #fb923c);
      border-radius: 30%;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 26px;
    }

    .metric-link3 {
      font-size: 14px;
      color: #B93160; /* Orange-500 */
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .metric-link3:hover {
      color: #c2410c; /* Orange-700 */
    }
  `}</style>
            </div>
            {/* category */}
            <div
              className="col-xl-3 col-lg-4 col-md-6 col-12 mb-4"
              style={{ cursor: "pointer" }}
            >
              <div
                className="wow-card-category p-4 d-flex flex-column justify-content-between h-100"
                onClick={() => navigate("/admin/category")}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 metric-title-category">Total Categories</p>
                    <h2 className="mb-0 metric-value-category">
                      {category?.length}
                    </h2>
                  </div>
                  <div className="metric-icon-category">
                    <i className="bi bi-grid-3x3-gap-fill"></i>
                  </div>
                </div>
                <div className="border-top mt-3">
                  <span className="metric-link-category">View All Details</span>
                </div>
              </div>

              <style jsx>{`
    .wow-card-category {
      background: linear-gradient(145deg, #ffffff, rgb(252, 231, 243));
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .wow-card-category:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    }

    .metric-title-category {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .metric-value-category {
      font-size: 30px;
      font-weight: 500;
      color: #2f2b3de6;
    }

    .metric-icon-category {
      background: radial-gradient(circle at 30% 30%, rgb(228, 71, 165), #e91e63);
      border-radius: 30%;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 26px;
    }

    .metric-link-category {
      font-size: 14px;
      color: #B93160;
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .metric-link-category:hover {
      color: #1d4ed8;
    }
  `}</style>
            </div>
            {/* subCategory */}
            <div
              className="col-xl-3 col-lg-4 col-md-6 col-12 mb-4"
              style={{ cursor: "pointer" }}
            >
              <div
                className="wow-card-subcategory p-4 d-flex flex-column justify-content-between h-100"
                onClick={() => navigate("/admin/category/subCategory")}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 metric-title-subcategory">Total Sub Categories</p>
                    <h2 className="mb-0 metric-value-subcategory">
                      {subcategory?.length}
                    </h2>
                  </div>
                  <div className="metric-icon-subcategory">
                    <i className="bi bi-list-nested"></i>
                  </div>
                </div>
                <div className="border-top mt-3">
                  <span className="metric-link-subcategory">View All Details</span>
                </div>
              </div>

              <style jsx>{`
    .wow-card-subcategory {
      background: linear-gradient(145deg, #ffffff, rgb(231, 252, 239));
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .wow-card-subcategory:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    }

    .metric-title-subcategory {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .metric-value-subcategory {
      font-size: 30px;
      font-weight: 500;
      color: #2f2b3de6;
    }

    .metric-icon-subcategory {
      background: radial-gradient(circle at 30% 30%, rgb(71, 228, 131), #10b981);
      border-radius: 30%;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 26px;
    }

    .metric-link-subcategory {
      font-size: 14px;
      color: #B93160;
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .metric-link-subcategory:hover {
      color: #1d4ed8;
    }
  `}</style>
            </div>
            {/* totalAdminCommission */}
            <div
              className="col-xl-3 col-lg-4 col-md-6 col-12 mb-4"
              style={{ cursor: "pointer" }}
            >
              <div
                className="wow-card-commission p-4 d-flex flex-column justify-content-between h-100"
                onClick={() => navigate("/admin/wallet")}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <p className="mb-1 metric-title-commission">Admin Commission</p>
                    <h2 className="mb-0 metric-value-commission">
                      {adminTotalEarnings}
                    </h2>
                  </div>
                  <div className="metric-icon-commission">
                    <i className="bi bi-currency-rupee"></i>
                  </div>
                </div>
                <div className="border-top mt-3">
                  <span className="metric-link-commission">View All Details</span>
                </div>
              </div>

              <style jsx>{`
    .wow-card-commission {
      background: linear-gradient(145deg, #ffffff, rgb(252, 243, 231));
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
    }

    .wow-card-commission:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
    }

    .metric-title-commission {
      font-size: 14px;
      color: #6b7280;
      font-weight: 500;
      letter-spacing: 0.5px;
    }

    .metric-value-commission {
      font-size: 30px;
      font-weight: 500;
      color: #2f2b3de6;
    }

    .metric-icon-commission {
      background: radial-gradient(circle at 30% 30%, rgb(228, 165, 71), #f59e0b);
      border-radius: 30%;
      width: 56px;
      height: 56px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #ffffff;
      font-size: 26px;
    }

    .metric-link-commission {
      font-size: 14px;
      color: #B93160;
      text-decoration: none;
      font-weight: 500;
      cursor: pointer;
      transition: color 0.2s ease;
    }

    .metric-link-commission:hover {
      color: #1d4ed8;
    }
  `}</style>
            </div>



          </div>

          <div className="row">
            <div className="col-xl-6 col-12"  >
              <div
                className="card"
                style={{
                  borderRadius: "5px 5px 5px 5px",
                  border: "none",
                  // background: "#FFF",

                  // minHeight: "670px",

                }}
              >
                <div
                  className="heading "
                  style={{
                    borderRadius: "5px 5px 0px 0px",
                    border: "none",
                    background: "#fff",
                    marginBottom: "-2px",
                    //  maxHeight: "450px",
                  }}
                >
                  <div className="sellerMenuHeader mt-0">
                    <ul
                      className="dashboardMen d-flex justify-content-between"
                      style={{ overflowX: "scroll" }}
                    >
                      <li
                        className={`pb-0 ${type === "Product" && "activeLineDashf "
                          }`}
                      >
                        <a
                          className={`profileDash mb-0  ${type === "Product" && "activeLineDashd "
                            }`}
                          style={{ color: "#2f2b3de6", fontWeight: "400", fontSize: "18px" }}
                          onClick={() => {
                            setType("Product");
                          }}
                        >
                          Top Selling Product
                        </a>
                      </li>

                      <li
                        className={`pb-0 ${type === "Popular" && "activeLineDashf "
                          }`}
                      >
                        <a
                          className={`profileDash mb-0 ${type === "Popular" && "activeLineDashd "
                            }`}
                          style={{ color: "#2f2b3de6", fontWeight: "400", fontSize: "18px" }}
                          onClick={() => {
                            setType("Popular");
                          }}
                        >
                          Most Popular Product
                        </a>
                      </li>
                      <li
                        className={`pb-0 ${type === "Seller" && "activeLineDashf "
                          }`}
                      >
                        <a
                          className={`profileDash mb-0 ${type === "Seller" && "activeLineDashd "
                            }`}
                          style={{ color: "#2f2b3de6", fontWeight: "400", fontSize: "18px" }}
                          onClick={() => {
                            setType("Seller");
                          }}
                        >
                          Top Seller
                        </a>
                      </li>

                      <li
                        className={`pb-0 ${type === "Customer" && "activeLineDashf "
                          }`}
                      >
                        <a
                          className={`profileDash mb-0 ${type === "Customer" && "activeLineDashd "
                            }`}
                          style={{ color: "#2f2b3de6", fontWeight: "400", fontSize: "18px" }}
                          onClick={() => {
                            setType("Customer");
                          }}
                        >
                          Top Buyer
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="card-body p-0"
                  style={{
                    backgroundColor: "#0B101D",
                    borderRadius: "9px"
                  }}
                >
                  <div className="p-0 dashBoardTable ">
                    <div className="tableMain m-0">
                      {type === "Customer" && (
                        <>
                          <Table2
                            data={user}
                            mapData={mapData1}
                            serverPerPage={rowsPerPage}
                            serverPage={page}
                            type={"server"}

                          />
                        </>
                      )}
                      {type === "Seller" && (
                        <>
                          <Table2
                            data={seller}
                            mapData={mapData2}
                            serverPerPage={rowsPerPage}
                            serverPage={page}
                            type={"server"}
                          />
                        </>
                      )}
                      {type === "Product" && (
                        <>
                          <Table2
                            data={product}
                            mapData={mapData3}
                            serverPerPage={rowsPerPage}
                            serverPage={page}
                            type={"server"}
                          />
                        </>
                      )}
                      {type === "Popular" && (
                        <>
                          <Table2
                            data={popularProduct}
                            mapData={mapData4}
                            serverPerPage={rowsPerPage}
                            serverPage={page}
                            type={"server"}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-12 mt-xl-0 mt-md-3 mt-2">
              <div
                className="card"
                style={{
                  borderRadius: "5px 5px 0px 0px",
                  border: "",

                  background: "#fff",

                  // minHeight: "670px",

                }}
              >
                <div
                  className="heading"
                  style={{
                    borderRadius: "5px 5px 0px 0px",
                    border: "none",
                    background: "#fff",

                  }}
                >
                  <div className="sellerMenuHeader  mt-2 mb-2 mx-1 p-1 " style={{}}>
                    <ul className="d-flex align-items-center">
                      <li className="d-flex align-items-center">
                        <a
                          className={` fw-medium mb-0 `}
                          style={{ color: "#2f2b3de6", fontWeight: "400", fontSize: "18px" }}
                        >
                          Recent Order
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div className="card-body p-0"
                  style={{
                    backgroundColor: "#0B101D",
                    borderRadius: "9px"
                  }}
                >
                  <div className="p-0 dashBoardTable ">
                    <div className="tableMain m-0">
                      <Table2
                        data={order}
                        mapData={mapData}
                        serverPerPage={rowsPerPage}
                        serverPage={page}
                        type={"server"}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="row ">
            <div className="col-xl-6 col-12 mt-4">
              <div className="bcard">
                <div className="card-body py-0">
                  <div className="d-flex align-items-center justify-content-between my-2">
                    <div className="d-flex align-iems-center">
                      {/* <i className="bi bi-graph-up-arrow text-era" ></i> */}
                      <h6 className="ms-1 mt-1 text-white"
                        style={{ fontSize: "20px", fontWeight: "600" }}
                      >User</h6>
                    </div>
                    <div className="px-3">

                      <DateRangePicker1
                        initialSettings={{
                          applyButtonClasses: "btn-default",
                          autoUpdateInput: false,
                          locale: {
                            cancelLabel: "Clear",
                          },

                          maxDate: new Date(),
                        }}
                        onApply={handleApply}
                        onCancel={handleCancel}
                      >
                        <input
                          type="text"
                          className="form-control text-center datedash my-1 white-placeholder"
                          placeholder="Select Date"
                          readonly="readonly"
                          style={{
                            width: "13rem",
                            fontWeight: 500,

                            cursor: "pointer",
                            fontSize: "14px",
                            backgroundColor: "#fff"

                          }}
                        />
                      </DateRangePicker1>
                    </div>
                  </div>
                  <div style={{ height: "518px" }}>
                    <Line
                      data={chartData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="col-xl-6 col-12 mt-4">
              <div className="bcard">
                <div className="card-body py-0">
                  <div className="d-flex align-items-center justify-content-between my-2">
                    <div className="d-flex align-iems-center">
                      {/* <i className="bi bi-graph-up-arrow text-era"></i> */}
                      <h6 className="ms-1 mt-1 text-white"
                        style={{ fontSize: "20px", fontWeight: "600" }}
                      >Admin Revenue</h6>
                    </div>
                    <div className="px-3">
                      <style jsx>{`
                        .white-placeholder::placeholder {
                          color: black;
                          
                        }
                      `}</style>
                      <DateRangePicker2
                        initialSettings={{
                          applyButtonClasses: "btn-default",
                          autoUpdateInput: false,
                          locale: {
                            cancelLabel: "Clear",
                          },

                          maxDate: new Date(),
                        }}
                        onApply={handleApply1}
                        onCancel={handleCancel1}
                      >
                        <input
                          type="text"
                          className="form-control text-center datedash my-1 white-placeholder"
                          placeholder="Select Date"
                          readonly="readonly"
                          style={{
                            width: "13rem",
                            fontWeight: 500,
                            fontSize: "14px",

                            cursor: "pointer",
                            backgroundColor: "#fff"
                          }}
                        />
                      </DateRangePicker2>
                    </div>
                  </div>
                  <div style={{ height: "518px" }}>
                    <Line
                      data={chartData1}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,

                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
ChartJS.register(...registerables);

export default connect(null, {
  getDashboard,
  getTopSellingProduct,
  getTopSellingSeller,
  getTopUser,
  getUser,
  getOrder,
  getPopularProduct,
  getRecenetOrder,
  getUserChart,
  getRevenueChart,
})(Dashboard);
