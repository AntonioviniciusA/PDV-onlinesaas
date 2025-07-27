import { baseUrl } from "./conection";

export const localAuthService = {
  async login({ entrada }) {
    try {
      const response = await baseUrl.post(
        "/auth/login",
        { entrada },
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Erro ao realizar login. Verifique suas credenciais.",
        error,
      };
    }
  },
  clearAuth: async () => {
    await baseUrl.post("/auth/logout", {}, { withCredentials: true });
    window.location.reload();
  },
  isAuthenticated: async () => {
    try {
      const response = await baseUrl.get("/auth/me", {
        withCredentials: true,
      });
      return !!response.data.user;
    } catch {
      return false;
    }
  },
  getUser: async () => {
    try {
      const response = await baseUrl.get("/auth/me", {
        withCredentials: true,
      });
      return response.data.user;
    } catch {
      return null;
    }
  },
};
