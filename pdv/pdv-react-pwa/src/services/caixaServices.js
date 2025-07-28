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
  getHistoricoVendas: async (
    n_venda,
    data,
    forma_pagamento,
    caixa_operacao
  ) => {
    try {
      const response = await baseUrl.get("/caixa/historico", {
        params: {
          n_venda,
          data,
          forma_pagamento,
          caixa_operacao,
        },
        withCredentials: true,
      });

      return response.data;
    } catch (error) {
      console.error("Erro ao obter histórico de vendas:", error);
      throw error;
    }
  },
};
