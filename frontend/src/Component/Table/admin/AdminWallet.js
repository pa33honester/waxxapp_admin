import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { getAdminWallet } from "../../store/redeem/redeem.action";
import { getRevenueChart } from "../../store/dashboard/dashboard.action";
import dayjs from "dayjs";

import { Line } from "react-chartjs-2";

//datepicker
import DateRangePicker from "react-bootstrap-daterangepicker";
import "bootstrap-daterangepicker/daterangepicker.css";
import { getDefaultCurrency } from "../../store/currency/currency.action";

const AdminWallet = (props) => {
  let label = [];
  let data = [];
  let dataTotal = [];
  let dataWith = [];
  let dataWithOut = [];
  const { adminCommision } = useSelector((state) => state.redeem);
  const { total, withCom, withOut } = useSelector((state) => state.dashboard);
  const { defaultCurrency } = useSelector((state) => state.currency);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getAdminWallet());
  }, [dispatch]);

  var date = new Date();
  var firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);

  var lastDay = new Date();

  const startDate = dayjs(firstDay).format("YYYY-MM-DD");
  const endDate = dayjs(lastDay).format("YYYY-MM-DD");

  const [sDate, setSDate] = useState("All");
  const [eDate, setEDate] = useState("All");
  const [analyticTotal, setAnalyticTotal] = useState([]);
  const [analyticWith, setAnalyticWith] = useState([]);
  const [analyticWithOut, setAnalyticWithOut] = useState([]);


  useEffect(() => {
    dispatch(getRevenueChart(sDate, eDate));
    dispatch(getDefaultCurrency())
  }, [dispatch, sDate, eDate]);

  useEffect(() => {
    setAnalyticTotal(total);
  }, [total]);

  useEffect(() => {
    setAnalyticWith(withCom);
  }, [withCom]);
  useEffect(() => {
    setAnalyticWithOut(withOut);
  }, [withOut]);

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

  const chartData = {
    labels: label,

    datasets: [
      {
        type: "line",
        label: "Total Earning",
        data: dataTotal,
        fill: true,
        backgroundColor: "rgba(185,49,96,0.24)",
        borderColor: "#B93160",
        lineTension: 0.5,
        pointBorderWidth: 2,
      },
      {
        type: "line",
        label: "Earning With Commission",
        data: dataWith,
        fill: true,
        backgroundColor: "rgba(78, 78, 105, 0.3)", //Dark grayish-blue from image. Adjust alpha (0.3) if needed.
        borderColor: "#4E4E69", //Dark grayish-blue from image
        lineTension: 0.5,
        pointBorderWidth: 2,
      },
      {
        type: "line",
        label: "Earning withOut Commission",
        data: dataWithOut,
        fill: true,
        backgroundColor: "rgb(218, 244, 240, 0.3)",
        borderColor: "#B9DBFF",
        lineTension: 0.5,
        pointBorderWidth: 2,
      },
    ],
  };

  const handleApply = (event, picker) => {
    picker.element.val(
      picker.startDate.format("YYYY-MM-DD") +
      " to " +
      picker.endDate.format("YYYY-MM-DD")
    );
    const dayStart = dayjs(picker.startDate).format("YYYY-MM-DD")
      ? dayjs(picker.startDate).format("YYYY-MM-DD")
      : "All";

    const dayEnd = dayjs(picker.endDate).format("YYYY-MM-DD")
      ? dayjs(picker.endDate).format("YYYY-MM-DD")
      : "All";

    setSDate(dayStart);
    setEDate(dayEnd);

    dispatch(getRevenueChart(sDate, eDate));
  };

  //Cancel button function for analytic
  const handleCancel = (event, picker) => {

    setSDate(startDate);
    setEDate(endDate);
    dispatch(getRevenueChart("All", "All"));
  };

  return (
    <>
      <div className="mainSellerProfile">
        <div className="sellerProfile">
          <div className="col-12 headname" style={{ marginLeft: "30px", marginTop: "20px", marginBottom: "0px" }}>Admin Wallet </div>
          <div className="sellerProfileHeader primeHeader">

            <div className="row ">
              <div className="col-xl-4 col-md-6 col-12 mt-3 ">
                <div
                  className="d-flex align-items-center p-3 shadow-sm"
                  style={{
                    background: "#fff5f7",
                    borderRadius: "12px",
                    border: "1px solid #f7dada",
                  }}
                >
                  {/* Icon Circle */}
                  <div
                    className="d-flex align-items-center justify-content-center me-3"
                    style={{
                      backgroundColor: "#f7dada",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    {/* Use Bootstrap Icon */}
                    <i
                      className="bi bi-currency-rupee"
                      style={{ color: "#b93160", fontSize: "24px" }}
                    ></i>
                  </div>

                  {/* Text Block */}
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "#333",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Total Earning With Commission
                    </p>
                    <h1
                      style={{
                        margin: 0,
                        color: "#b93160",
                        fontSize: "24px",
                        fontWeight: "700",
                      }}
                    >
                      {defaultCurrency?.symbol} {adminCommision?.totalEarningWithCommission}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="col-xl-4 col-md-6 col-12 mt-3">
                <div
                  className="d-flex align-items-center p-3 shadow-sm"
                  style={{
                    background: "#fff5f7",
                    borderRadius: "12px",
                    border: "1px solid #f7dada",
                  }}
                >

                  <div
                    className="d-flex align-items-center justify-content-center me-3"
                    style={{
                      backgroundColor: "#f7dada",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                    }}
                  >

                    <i
                      className="bi bi-cash"
                      style={{ color: "#b93160", fontSize: "24px" }}
                    ></i>
                  </div>


                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "#333",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Total Earning Without Commission
                    </p>
                    <h1
                      style={{
                        margin: 0,
                        color: "#b93160",
                        fontSize: "24px",
                        fontWeight: "700",
                      }}
                    >
                      {defaultCurrency?.symbol}{" "}
                      {adminCommision?.totalEarningWithoutCommission}
                    </h1>
                  </div>
                </div>
              </div>


              <div className="col-xl-4 col-md-6 col-12 mt-3">
                <div
                  className="d-flex align-items-center p-3 shadow-sm"
                  style={{
                    background: "#fff5f7",
                    borderRadius: "12px",
                    border: "1px solid #f7dada",
                  }}
                >

                  <div
                    className="d-flex align-items-center justify-content-center me-3"
                    style={{
                      backgroundColor: "#f7dada",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                    }}
                  >

                    <i
                      className="bi bi-percent"
                      style={{ color: "#b93160", fontSize: "24px" }}
                    ></i>
                  </div>


                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "#333",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Total Commission
                    </p>
                    <h1
                      style={{
                        margin: 0,
                        color: "#b93160",
                        fontSize: "24px",
                        fontWeight: "700",
                      }}
                    >
                      {defaultCurrency?.symbol}{" "}
                      {adminCommision?.totalCommission}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="col-xl-4 col-md-6 col-12 mt-3">
                <div
                  className="d-flex align-items-center p-3 shadow-sm"
                  style={{
                    background: "#fff5f7",
                    borderRadius: "12px",
                    border: "1px solid #f7dada",
                  }}
                >

                  <div
                    className="d-flex align-items-center justify-content-center me-3"
                    style={{
                      backgroundColor: "#f7dada",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                    }}
                  >

                    <i
                      className="bi bi-calendar-day"
                      style={{ color: "#b93160", fontSize: "24px" }}
                    ></i>
                  </div>


                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "#333",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Today Earning
                    </p>
                    <h1
                      style={{
                        margin: 0,
                        color: "#b93160",
                        fontSize: "24px",
                        fontWeight: "700",
                      }}
                    >
                      {defaultCurrency?.symbol}{" "}
                      {adminCommision?.todayCommission}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="col-xl-4 col-md-6 col-12 mt-3">
                <div
                  className="d-flex align-items-center p-3 shadow-sm"
                  style={{
                    background: "#fff5f7",
                    borderRadius: "12px",
                    border: "1px solid #f7dada",
                  }}
                >
                  {/* Icon Circle */}
                  <div
                    className="d-flex align-items-center justify-content-center me-3"
                    style={{
                      backgroundColor: "#f7dada",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    {/* Example: Calendar month icon for "Monthly Earning" */}
                    <i
                      className="bi bi-calendar-month"
                      style={{ color: "#b93160", fontSize: "24px" }}
                    ></i>
                  </div>

                  {/* Text Block */}
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "#333",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Monthly Earning
                    </p>
                    <h1
                      style={{
                        margin: 0,
                        color: "#b93160",
                        fontSize: "24px",
                        fontWeight: "700",
                      }}
                    >
                      {defaultCurrency?.symbol}{" "}
                      {adminCommision?.monthlyCommission}
                    </h1>
                  </div>
                </div>
              </div>

              <div className="col-xl-4 col-md-6 col-12 mt-3">
                <div
                  className="d-flex align-items-center p-3 shadow-sm"
                  style={{
                    background: "#fff5f7",
                    borderRadius: "12px",
                    border: "1px solid #f7dada",
                  }}
                >
                  {/* Icon Circle */}
                  <div
                    className="d-flex align-items-center justify-content-center me-3"
                    style={{
                      backgroundColor: "#f7dada",
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                    }}
                  >
                    {/* Example: Calendar month icon for "Monthly Earning" */}
                    <i
                      className="bi bi-calendar-month"
                      style={{ color: "#b93160", fontSize: "24px" }}
                    ></i>
                  </div>

                  {/* Text Block */}
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "#333",
                        fontSize: "16px",
                        fontWeight: "500",
                      }}
                    >
                      Yearly Earning
                    </p>
                    <h1
                      style={{
                        margin: 0,
                        color: "#b93160",
                        fontSize: "24px",
                        fontWeight: "700",
                      }}
                    >
                      {defaultCurrency?.symbol} {""} {adminCommision?.yearlyCommission}
                    </h1>
                  </div>
                </div>
              </div>


            </div>
            <div className="row mt-3">
              <div className="col-12">
                <div className="card">
                  <div className="card-body">
                    <div className="d-flex align-items-center justify-content-end">


                      <style jsx>{`
                        .white-placeholder::placeholder {
                          color: black;
                        }
                      `}</style>

                      <DateRangePicker
                        initialSettings={{
                          applyButtonClasses: "btn-default",
                          autoUpdateInput: false,
                          locale: {
                            cancelLabel: "Clear",
                          },
                          startDate: new Date(
                            new Date().getFullYear(),
                            new Date().getMonth(),
                            1
                          ), // Start of the current month
                          endDate: new Date(
                            new Date().getFullYear(),
                            new Date().getMonth() + 1,
                            0
                          ), // End of the current month
                          maxDate: new Date(),
                        }}
                        onApply={handleApply}
                        onCancel={handleCancel}
                      >
                        <input
                          type="text"
                          className="form-control text-center datedash white-placeholder"
                          placeholder="Select Date"
                          readonly="readonly"
                          style={{
                            width: "15rem",
                            fontWeight: 700,
                            height: 40,
                            cursor: "pointer",
                            fontSize: "15px",
                            color: "black"
                          }}
                        />
                      </DateRangePicker>
                    </div>

                    <div>
                      <Line
                        data={chartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                        }}
                        style={{ height: "500px" }}
                      />
                    </div>
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

export default connect(null, { getAdminWallet, getRevenueChart })(AdminWallet);
