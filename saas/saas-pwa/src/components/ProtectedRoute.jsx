import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthService } from "../services/authServices";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // Tenta obter o token (ajuste conforme seu AuthService)
      const token = await (AuthService.getToken?.() ||
        localStorage.getItem("token"));
      setHasToken(!!token);
      if (token) {
        // Se tem token, verifica se está autenticado
        const valid = await AuthService.isAuthenticated();
        setIsAuth(!!valid);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null; // ou um spinner

  // Se tem token e não está autenticado, redireciona para login
  if (hasToken && !isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
