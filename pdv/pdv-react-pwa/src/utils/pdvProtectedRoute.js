import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import RequestAuthorization from "../components/RequestAuthorization";
import { caixaService } from "../services/caixaServices";
import { useIsAuthenticated, useUser } from "../hooks/useAuth";

export default function PdvProtectedRoute({
  children,
  requiredPermissions = [],
}) {
  const { data: autenticado, isLoading: loadingAuth } = useIsAuthenticated();
  const { data: user, isLoading: loadingUser } = useUser();
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
    if (loadingAuth || loadingUser) return;
    if (!autenticado) {
      setHasPermission(false);
      setLoading(false);
      return;
    }
    if (user) {
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
            checkPermissionsOnBackend(user).then((backendPermission) => {
              setHasPermission(backendPermission);
              setLoading(false);
            });
            return;
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
  }, [requiredPermissions, autenticado, user, loadingAuth, loadingUser]);

  if (loading) return null;

  // Se não está autenticado
  if (!autenticado) {
    return <Navigate to="/llogin" replace />;
  }

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
