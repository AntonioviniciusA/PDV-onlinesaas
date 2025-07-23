import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { localAuthService } from "../services/localAuthService";
import RequestAuthorization from "../components/RequestAuthorization";
import { caixaService } from "../services/caixaServices";

export default function PdvProtectedRoute({
  children,
  requiredPermissions = [],
}) {
  const [loading, setLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  // Função para verificar permissões no backend
  const checkPermissionsOnBackend = async (usuario) => {
    try {
      const response = await caixaService.checkAutorizacao(usuario);
      setHasPermission(response.autorizado);
    } catch (error) {
      console.error("Erro ao verificar permissões no backend:", error);
      return false;
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const valid = await localAuthService.isAuthenticated();
      if (!valid) {
        return <Navigate to="/llogin" replace />;
      }
      if (valid) {
        const user = await localAuthService.getUser();
        // Verificar permissões se necessário
        if (requiredPermissions.length > 0) {
          let userPerms = [];
          if (user && Array.isArray(user.permissions)) {
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
          if (userPerms.includes("*") || (user && user.perfil === "admin")) {
            setHasPermission(true);
          } else {
            // Verifica se tem pelo menos uma permissão exigida
            const allowed = requiredPermissions.some((perm) =>
              userPerms.includes(perm)
            );

            if (!allowed) {
              // Se não tem permissão local, verifica no backend
              const backendPermission = await checkPermissionsOnBackend(user);
              setHasPermission(backendPermission);
            } else {
              setHasPermission(true);
            }
          }
        } else {
          setHasPermission(true);
        }
      } else {
        setHasPermission(false);
      }
      setLoading(false);
    };
    checkAuth();
  }, [requiredPermissions]);

  if (loading) return null;

  // Se está autenticado, mas não tem permissão
  if (!hasPermission) {
    return (
      <RequestAuthorization
        open={true}
        onOpenChange={() => {}}
        onSuccess={async (usuario) => {
          checkPermissionsOnBackend(usuario);
        }}
        title="Autorização Necessária"
      />
    );
  }

  // Se está autenticado e tem permissão
  if (hasPermission) {
    return <>{children}</>;
  }

  return null;
}
