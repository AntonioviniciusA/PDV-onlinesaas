import { apiNoAuth } from "./conection";

export const localAuthService = {
  async login({ entrada }) {
    try {
      const response = await apiNoAuth.post("/auth/login", { entrada });
      return response.data;
    } catch (error) {
      // Retorna um objeto de erro padronizado
      return {
        success: false,
        message: "Erro ao realizar login. Verifique suas credenciais.",
        error,
      };
    }
  },
  setAuthData: (token, user, remember = false) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  },
  isAuthenticated: async () => {
    const token = await localAuthService.getToken();
    return !!token;
  },
  getToken: () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  },
  getUser: () => {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },
};
