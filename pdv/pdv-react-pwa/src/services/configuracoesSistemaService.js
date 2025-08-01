import { baseUrl } from "./conection";

export const configuracoesSistemaService = {
  // Buscar configurações do sistema
  async getConfiguracoes() {
    try {
      const response = await baseUrl.get("/configuracoes_sistema/", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erro no serviço de configurações:", error);
      throw error;
    }
  },

  // Atualizar configurações do sistema
  async updateConfiguracoes(configuracoes) {
    try {
      const response = await baseUrl.put(
        "/configuracoes_sistema/",
        configuracoes,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro no serviço de configurações:", error);
      throw error;
    }
  },

  // Listar timezones disponíveis
  async getTimezones() {
    try {
      const response = await baseUrl.get("/configuracoes_sistema/timezones", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erro no serviço de timezones:", error);
      throw error;
    }
  },

  // Listar permissões disponíveis
  async getPermissoes() {
    try {
      const response = await baseUrl.get("/configuracoes_sistema/permissoes", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erro no serviço de permissões:", error);
      throw error;
    }
  },

  // Gerenciamento de usuários
  async getUsuarios() {
    try {
      const response = await baseUrl.get("/configuracoes_sistema/usuarios", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      throw error;
    }
  },

  async createUsuario(userData) {
    try {
      const response = await baseUrl.post(
        "/configuracoes_sistema/usuarios",
        userData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw error;
    }
  },

  async updateUsuario(userId, userData) {
    try {
      const response = await baseUrl.put(
        `/configuracoes_sistema/usuarios/${userId}`,
        userData,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      throw error;
    }
  },

  async deleteUsuario(userId) {
    try {
      const response = await baseUrl.delete(
        `/configuracoes_sistema/usuarios/${userId}`,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      throw error;
    }
  },
};
