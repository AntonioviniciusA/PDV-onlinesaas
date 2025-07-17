import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { localAuthService } from "../services/localAuthService";

export default function PdvProtectedRoute({
  children,
  requiredPermissions = [],
}) {
  const [loading, setLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await localAuthService.getToken();
      setHasToken(!!token);
      let user = localAuthService.getUser();
      if (token) {
        const valid = await localAuthService.isAuthenticated();
        setIsAuth(!!valid);
        // Verificar permissões se necessário
        if (requiredPermissions.length > 0) {
          let userPerms = [];
          if (user && Array.isArray(user.permissions)) {
            // Suporta permissões como ["modulo.acao"] ou [{module, actions}]
            if (typeof user.permissions[0] === "string") {
              userPerms = user.permissions;
            } else if (typeof user.permissions[0] === "object") {
              userPerms = user.permissions.flatMap((p) =>
                p.actions && p.module
                  ? p.actions.map((a) => `${p.module}.${a}`)
                  : []
              );
            }
          }
          // Admin sempre tem acesso
          if (userPerms.includes("*") || (user && user.role === "admin")) {
            setHasPermission(true);
          } else {
            // Pelo menos uma permissão exigida
            const allowed = requiredPermissions.some((perm) =>
              userPerms.includes(perm)
            );
            setHasPermission(allowed);
          }
        } else {
          setHasPermission(true);
        }
      } else {
        setIsAuth(false);
        setHasPermission(false);
      }
      setLoading(false);
    };
    checkAuth();
  }, [requiredPermissions]);

  if (loading) return null;

  if (!hasToken || !isAuth || !hasPermission) {
    return <Navigate to="/" replace />;
  }

  return children;
}
