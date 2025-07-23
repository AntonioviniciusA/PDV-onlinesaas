import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthService } from "../services/authServices";

export default function PrivateRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const valid = await AuthService.isAuthenticatedSaas();
      setIsAuth(!!valid);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null;

  if (!isAuth) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
