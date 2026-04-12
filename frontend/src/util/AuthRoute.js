import React, { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import axios from "axios";

const AuthRoute = () => {
  const [login, setLogin] = useState(null); // null = not checked yet
  const isAuth = sessionStorage.getItem("isAuth");
  const token = sessionStorage.getItem("token");
  const location = useLocation();

  useEffect(() => {
    axios
      .get("/login")
      .then((res) => {
        setLogin(res.data.login);
      })
      .catch((err) => {
        console.log(err);
        setLogin(false);
      });
  }, []);

  // While login status is being checked, avoid rendering anything or show loader
  if (login === null) {
    return null; // or a spinner/loading indicator
  }

  // Case 1: If token and isAuth exist, user is authenticated, render the protected routes
  if (token && isAuth) {
    return <Outlet />;
  }

  // Case 2: User not logged in, redirect accordingly
  // If user is already registered (login=true), redirect to login page
  if (login) {
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  // If user is not registered (login=false), redirect to registration page
  return <Navigate to="/register" state={{ from: location }} replace />;
};

export default AuthRoute;
