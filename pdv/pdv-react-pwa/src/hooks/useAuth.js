// src/hooks/useAuth.js
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { localAuthService } from "../services/localAuthService.js";

// Hook que retorna se o usuário está autenticado
export const useIsAuthenticated = () => {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const autenticado = await localAuthService.isAuthenticated();
      return autenticado;
    },
    staleTime: 20 * 60 * 1000,
    cacheTime: 20 * 60 * 1000,
  });
};

// Hook que retorna os dados do usuário
export const useUser = () => {
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const user = await localAuthService.getUser?.();
      return user;
    },
    staleTime: 20 * 60 * 1000,
    cacheTime: 20 * 60 * 1000,
  });
};

// Função de logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  return async () => {
    await localAuthService.logout?.();
    queryClient.invalidateQueries(["auth"]);
    queryClient.invalidateQueries(["user"]);
  };
};
