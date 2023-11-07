import React from "react";
import { Route, Navigate } from "react-router-dom";
import { useAuth } from "../login/Auth";

const PrivateRoute = ({ element }) => {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? element : <Navigate to="/" />;
};

export default PrivateRoute;
