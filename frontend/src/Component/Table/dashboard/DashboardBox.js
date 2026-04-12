import React from "react";
import { Link, useNavigate } from "react-router-dom";

const DashboardBox = (props) => {
  const {
    title,
    icon,
    value,
    link,
    background,
    color,
    fontColor,
    backgroundcolor,
    border,
    iconImg,
  } = props;

  const navigate = useNavigate();

  return (
    <>
      <div
        className="col-xl-3 col-lg-4 col-md-6 col-12 mb-4 dashboardBoxImage"
        onClick={() => navigate(`${link}`)}
        style={{ cursor: "pointer" }}
      >
        <div
          className="dashboardBox"
          style={{
            background: `${background}`,
            color: `${color}`,
            border: `${border}`,
          }}
        >
          <div className="d-flex justify-content-between py-3">
            <div className="dashCount fw-bold ms-3 ">
              <span className="dName">{title}</span> <br />
              <span className="dCount">{value}</span>
            </div>
            <div
              className="dashIcon boxCenter"
              style={{
                background: `${backgroundcolor}`,
                color: `${fontColor}`,
                position: "relative",
                zIndex: "999",
              }}
            >
              {icon ? (
                <>
                  <i className={icon}></i>
                </>
              ) : (
                <>
                  <img src={iconImg} />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardBox;
