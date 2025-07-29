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
};
