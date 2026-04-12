import React from "react";

import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute = () => {
  const isAuth = sessionStorage.getItem("isAuth");
  const token = sessionStorage.getItem("token");

  return token && isAuth ? <Outlet /> : <Navigate to="/admin-login" />;
};

export default PrivateRoute;
