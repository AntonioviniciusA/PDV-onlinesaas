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
  abrirCaixa: async (amount, usuario) => {
    try {
      const response = await baseUrl.post(
        "/caixa/abrir",
        {
          amount,
          usuario,
        },
        {
          withCredentials: true,
        }
      );
      // console.log("response", response);
      return response.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  fecharCaixa: async (amount, usuario) => {
    try {
      // Primeiro buscar o caixa aberto
      const caixaResponse = await baseUrl.get("/caixa/verifica-aberto", {
        withCredentials: true,
      });

      if (!caixaResponse.data.sucesso || !caixaResponse.data.caixa) {
        throw new Error("Nenhum caixa aberto encontrado");
      }

      const caixa = caixaResponse.data.caixa;

      const response = await baseUrl.post(
        "/caixa/fechar",
        {
          amount,
          usuario,
          id_caixa: caixa.id,
          id_loja: usuario.id_loja,
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
        { usuario },
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
  getCaixasAbertos: async () => {
    try {
      const response = await baseUrl.get("/caixa/abertos", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar caixas abertos:", error);
      throw error;
    }
  },
  getCaixasFechados: async () => {
    try {
      const response = await baseUrl.get("/caixa/fechados", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar caixas fechados:", error);
      throw error;
    }
  },
  verificaCaixaAberto: async () => {
    try {
      const response = await baseUrl.get("/caixa/verifica-aberto", {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao verificar caixa aberto:", error);
      throw error;
    }
  },
  finalizarVenda: async (cupomData) => {
    try {
      const response = await baseUrl.post("/caixa/finalizar-venda", cupomData, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      throw error;
    }
  },
};
