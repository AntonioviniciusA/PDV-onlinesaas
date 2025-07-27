import { baseUrl } from "./conection";

export const ncmService = {
  // Buscar NCM por código
  buscarNcm: async (codigo) => {
    try {
      const response = await baseUrl.get(`/ncm/${codigo}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar NCM:", error);

      // Se a resposta não for JSON válido, retornar erro específico
      if (error.response && error.response.data) {
        return error.response.data;
      }

      // Se não há resposta ou é um erro de rede
      return {
        ok: false,
        mensagem: "Erro de conexão. Verifique se o servidor está rodando.",
      };
    }
  },

  // Forçar atualização do cache (endpoint administrativo)
  atualizarCache: async () => {
    try {
      const response = await baseUrl.post(
        "/ncm/atualizar-cache",
        {},
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao atualizar cache NCM:", error);
      throw error;
    }
  },
};
