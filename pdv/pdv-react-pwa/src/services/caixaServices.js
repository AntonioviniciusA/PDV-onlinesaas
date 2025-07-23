import { baseUrl } from "./conection";

export const caixaService = {
  autorizarCaixa: async (entrada) => {
    try {
      const response = await baseUrl.post(
        "/caixa/autorizar",
        { entrada },
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao autorizar caixa:", error);
      throw error;
    }
  },
  abrirCaixa: async (amount, usuario, caixa_numero) => {
    try {
      const response = await baseUrl.post(
        "/caixa/abrir",
        {
          amount,
          usuario,
          caixa_numero,
        },
        {
          withCredentials: true,
        }
      );
      console.log("response", response);
      return response.data;
    } catch (error) {
      console.error("Erro ao abrir caixa:", error);
      throw error;
    }
  },
  fecharCaixa: async (amount, usuario, caixa_numero) => {
    try {
      const response = await baseUrl.post(
        "/caixa/fechar",
        {
          amount,
          usuario,
          caixa_numero,
        },
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
      throw error;
    }
  },
  checkAutorizacao: async (usuario) => {
    try {
      const response = await baseUrl.post(
        "/caixa/check-autorizacao",
        {
          usuario: usuario,
        },
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao verificar autorização:", error);
      throw error;
    }
  },
  getHistoricoCaixas: async (caixa, n_venda, data, forma_pagamento) => {
    try {
      const response = await baseUrl.get("/caixa/historico", {
        params: {
          caixa: JSON.stringify(caixa), // muito importante
          n_venda,
          data,
          forma_pagamento,
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("Erro ao obter histórico de caixas:", error);
      throw error;
    }
  },
};
