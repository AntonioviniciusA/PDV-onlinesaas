import { baseUrl } from "./conection";

export const impressoraService = {
  async listarImpressoras() {
    try {
      const response = await baseUrl.get("/impressora/printers", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Erro ao listar impressoras.",
        error,
      };
    }
  },

  async getImpressoraConfig() {
    try {
      const response = await baseUrl.get("/impressora/config", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Erro ao buscar configuração da impressora.",
        error,
      };
    }
  },

  async setImpressoraConfig(config) {
    try {
      const response = await baseUrl.post("/impressora/select", config, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return {
        success: false,
        message: "Erro ao salvar configuração da impressora.",
        error,
      };
    }
  },
};
