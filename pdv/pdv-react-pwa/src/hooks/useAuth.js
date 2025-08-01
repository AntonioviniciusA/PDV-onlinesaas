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
    staleTime: 0, // Sempre buscar dados frescos
    cacheTime: 5 * 60 * 1000, // Cache por 5 minutos
    enabled: true,
    refetchOnWindowFocus: true, // Refazer query quando a janela ganhar foco
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
    staleTime: 0, // Sempre buscar dados frescos
    cacheTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: true, // Refazer query quando a janela ganhar foco
  });
};

// Hook que retorna o status do caixa
export const useCaixaStatus = () => {
  return useQuery({
    queryKey: ["caixa", "status"],
    queryFn: async () => {
      // Esta query será gerenciada pelo hook useCaixa
      return null;
    },
    staleTime: 0, // Sempre buscar dados frescos
    cacheTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: true, // Refazer query quando a janela ganhar foco
  });
};

// Função de logout
export const useLogout = () => {
  const queryClient = useQueryClient();
  return async () => {
    await localAuthService.logout?.();
    queryClient.invalidateQueries(["auth"]);
    queryClient.invalidateQueries(["user"]);
    queryClient.invalidateQueries(["caixa"]);
  };
};
