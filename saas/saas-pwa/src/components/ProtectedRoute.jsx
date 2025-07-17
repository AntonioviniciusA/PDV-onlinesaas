import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthService } from "../services/authServices";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AuthService.getToken();
      setHasToken(!!token);
      if (token) {
        const valid = await AuthService.isAuthenticated();
        setIsAuth(!!valid);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null;

  if (!hasToken || !isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
