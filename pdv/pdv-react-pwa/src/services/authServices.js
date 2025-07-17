import { apiNoAuth, apiAuth, apiSaas } from "./conection";

// Cache para estado de autenticação
let authStateCache = {
  isAuthenticated: null,
  user: null,
};

export const AuthService = {
  login: async (payload) => {
    try {
      const response = await apiNoAuth.post("/saas/login", payload);
      return response.data;
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      throw error;
    }
  },

  // Armazena os dados de autenticação
  setAuthData: (token, user, remember = false) => {
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("token", token);
    storage.setItem("user", JSON.stringify(user));
    authStateCache = { isAuthenticated: true, user };
  },

  // Limpa os dados de autenticação
  clearAuth: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    authStateCache = { isAuthenticated: false, user: null };
  },

  isAuthenticatedSaas: async () => {
    // console.log("authStateCache", authStateCache);
    if (authStateCache.isAuthenticated !== null) {
      // console.log(
      //   "authStateCache.isAuthenticated2",
      //   authStateCache.isAuthenticated
      // );
      return authStateCache.isAuthenticated;
    }
    // console.log("iniciando verificacao de autenticacao");
    const token = AuthService.getTokenSaas();
    if (!token) {
      authStateCache.isAuthenticated = false;
      return false;
    }

    try {
      const response = await apiSaas.get("/verify-token");
      authStateCache = {
        isAuthenticated: true,
        user: response.data.user || AuthService.getUser(),
      };
      return true;
    } catch (error) {
      AuthService.clearAuth();
      return false;
    }
  },

  // Obter token
  getTokenSaas: () => {
    return localStorage.getItem("t") || sessionStorage.getItem("t");
  },

  // Obter usuário
  getUser: () => {
    const user = localStorage.getItem("usd") || sessionStorage.getItem("usd");
    return user ? JSON.parse(user) : null;
  },

  // Obter estado atual de autenticação (síncrono)
  getAuthState: () => {
    return { ...authStateCache };
  },
};

// Debug logs (opcional)
if (process.env.NODE_ENV !== "production") {
  console.log("AuthService configurado com:");
  console.log("apiNoAuth base URL:", apiNoAuth.defaults.baseURL);
  console.log("apiAuth base URL:", apiAuth.defaults.baseURL);
}
