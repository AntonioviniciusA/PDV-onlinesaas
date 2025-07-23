import { baseUrl } from "./conection";

export const AuthService = {
  login: async (payload) => {
    try {
      const response = await baseUrl.post("/saas/login", payload, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Limpa os dados de autenticação
  clearAuth: async () => {
    await baseUrl.post("/saas/logout", {}, { withCredentials: true });
    window.location.reload();
  },

  isAuthenticatedSaas: async () => {
    try {
      const response = await baseUrl.get("/saas/me", {
        withCredentials: true,
      });
      return !!response.data.user;
    } catch {
      return false;
    }
  },

  // Obter usuário
  getUser: async () => {
    try {
      const response = await baseUrl.get("/saas/me", {
        withCredentials: true,
      });
      return response.data.user;
    } catch {
      return null;
    }
  },
};

// Debug logs (opcional)
if (process.env.NODE_ENV !== "production") {
  console.log("AuthService configurado com:");
  console.log("baseUrl base URL:", baseUrl.defaults.baseURL);
  console.log("baseUrl base URL:", baseUrl.defaults.baseURL);
}
