import { baseUrl } from "./conection";

export const produtosServices = {
  getProdutos: async () => {
    try {
      const response = await baseUrl.get("/produtos/listar", {
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
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  createProduto: async (produto) => {
    try {
      const response = await baseUrl.post("/produtos/criar", produto, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  updateProduto: async (id, produto) => {
    try {
      const response = await baseUrl.put(`/produtos/atualizar/${id}`, produto, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  deleteProduto: async (id) => {
    try {
      const response = await baseUrl.delete(`/produtos/apagar/${id}`, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};
