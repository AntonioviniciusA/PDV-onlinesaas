import { apiNoAuth, apiAuth } from "./conection";

// Cache para estado de autenticação
let authStateCache = {
  isAuthenticated: null,
  user: null,
};

export const AuthService = {
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

  // Login Cliente
  loginCliente: async (loginData, remember = false) => {
    try {
      const response = await apiNoAuth.post("/cliente/login", loginData);
      const { token, user } = response.data;
      AuthService.setAuthData(token, user, remember);
      return { token, user };
    } catch (error) {
      // Se for etapa de verificação de e-mail ou 2FA, retorna o erro para o frontend tratar
      if (error.response && error.response.data && error.response.data.etapa) {
        return { etapa: error.response.data.etapa, ...error.response.data };
      }
      console.error("Erro ao fazer login de cliente:", error);
      throw error;
    }
  },

  // Login Parceiro SaaS
  loginParceiroSaas: async (loginData, remember = false) => {
    try {
      const response = await apiNoAuth.post("/parceiro-saas/login", loginData);
      const { token, user } = response.data;
      AuthService.setAuthData(token, user, remember);
      return { token, user };
    } catch (error) {
      console.error("Erro ao fazer login de parceiro SaaS:", error);
      throw error;
    }
  },

  // Cadastro Cliente
  registerCliente: async (userData) => {
    try {
      const response = await apiNoAuth.post("/cliente/register", userData);
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar cliente:", error);
      throw error;
    }
  },

  // Cadastro Parceiro SaaS
  registerParceiroSaas: async (userData) => {
    try {
      const response = await apiNoAuth.post(
        "/parceiro-saas/register",
        userData
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar parceiro SaaS:", error);
      throw error;
    }
  },
  enviarCodigoEmail: async (destino, metodo) => {
    try {
      const response = await apiNoAuth.post(
        "/cliente/enviar-codigo",
        destino,
        metodo
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao enviar codigo Email para verificacao:", error);
    }
  },
  // Função para verificar o código de verificação do e-mail
  VerificarCodigoEmail: async ({ destino, codigo }) => {
    try {
      // Agora, verifica o código
      const verificaResponse = await apiNoAuth.post(
        "/cliente/verificar-email",
        {
          destino,
          codigo,
        }
      );
      return verificaResponse;
    } catch (error) {
      console.error("Erro ao verificar código de e-mail:", error);
      throw error;
    }
  },

  // Reset Password
  resetPassword: async (email) => {
    try {
      const response = await apiNoAuth.post("/auth/reset-password", { email });
      return response.data;
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      throw error;
    }
  },

  // Update Profile
  updateProfile: async (userData) => {
    try {
      const response = await apiAuth.put("/auth/profile", userData);

      // Atualiza o usuário no storage se necessário
      if (response.data.user) {
        const user = response.data.user;
        const currentUser = AuthService.getUser();

        if (currentUser) {
          const storage = localStorage.getItem("token")
            ? localStorage
            : sessionStorage;
          storage.setItem("user", JSON.stringify(user));
          authStateCache.user = user;
        }
      }

      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    }
  },

  // Change Password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiAuth.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      throw error;
    }
  },
  // Verificar se está autenticado
  isAuthenticated: async () => {
    console.log("[AuthService] authStateCache:", authStateCache);
    if (authStateCache.isAuthenticated !== null) {
      console.log(
        "[AuthService] authStateCache.isAuthenticated:",
        authStateCache.isAuthenticated
      );
      return authStateCache.isAuthenticated;
    }
    console.log("[AuthService] Iniciando verificacao de autenticacao");
    const token = AuthService.getToken();
    console.log("[AuthService] Token encontrado:", token);
    if (!token) {
      authStateCache.isAuthenticated = false;
      return false;
    }

    try {
      const response = await apiAuth.get("/verify-token");
      console.log("[AuthService] Resposta /verify-token:", response);
      authStateCache = {
        isAuthenticated: true,
        user: response.data.user || AuthService.getUser(),
      };
      return true;
    } catch (error) {
      console.error("[AuthService] Erro ao verificar token:", error);
      AuthService.clearAuth();
      console.log("[AuthService] clearAuth chamado, token removido!");
      return false;
    }
  },

  // Obter token
  getToken: () => {
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  },

  // Obter usuário
  getUser: () => {
    const user = localStorage.getItem("user") || sessionStorage.getItem("user");
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
