import { baseUrl } from "./conection";

export const produtosServices = {
  getProdutos: async () => {
    try {
      const response = await baseUrl.get("/produtos/listar", {
        params: {
          id_loja: "00000000-0000-0000-0000-000000000000",
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  getProdutoById: async (id) => {
    try {
      const response = await baseUrl.get(`/produtos/listar/${id}`, {
        params: {
          id_loja: "00000000-0000-0000-0000-000000000000",
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createProduto: async (produto) => {
    try {
      const produtoComLoja = {
        ...produto,
        id_loja: "00000000-0000-0000-0000-000000000000",
      };
      const response = await baseUrl.post("/produtos/criar", produtoComLoja, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateProduto: async (id, produto) => {
    try {
      const produtoComLoja = {
        ...produto,
        id_loja: "00000000-0000-0000-0000-000000000000",
      };
      const response = await baseUrl.put(
        `/produtos/atualizar/${id}`,
        produtoComLoja,
        {
          withCredentials: true,
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteProduto: async (id) => {
    try {
      const response = await baseUrl.delete(`/produtos/apagar/${id}`, {
        params: {
          id_loja: "00000000-0000-0000-0000-000000000000",
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
