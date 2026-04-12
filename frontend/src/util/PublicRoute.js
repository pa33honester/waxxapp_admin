// src/util/PublicRoute.js
import { Navigate, Outlet, useLocation } from "react-router-dom";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Spinner from "../Component/extra/spinner/Spinner";

const PublicRoute = () => {
  const token = sessionStorage.getItem("token");
  const isAuth = sessionStorage.getItem("isAuth");
  const [isRegistered, setIsRegistered] = useState(null); // true => login-only, false => register-only
  const location = useLocation();

  useEffect(() => {
    let mounted = true;
    axios
      .get("/login")
      .then((res) => mounted && setIsRegistered(Boolean(res.data?.login)))
      .catch(() => mounted && setIsRegistered(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (isRegistered === null) {
    return <Spinner />;
  }

  // Already authenticated? go straight to app
  if (token && isAuth) {
    return <Navigate to="/admin" replace />;
  }

  // Whitelist the public pages depending on registration state
  const allowedWhenRegistered = ["/admin-login", "/forgotPassword", "/changePassword"];
  const allowedWhenUnregistered = ["/register"];

  const allowed = isRegistered ? allowedWhenRegistered : allowedWhenUnregistered;

  // If user tries to access a disallowed public page, push them to the first allowed page
  if (!allowed.includes(location.pathname)) {
    return <Navigate to={allowed[0]} replace />;
  }

  // Otherwise, render the intended public page
  return <Outlet />;
};

export default PublicRoute;
