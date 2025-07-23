import { baseUrl } from "./conection";

export const produtosServices = {
  getProdutos: async (id_loja) => {
    const response = await baseUrl.get("/produtos/listar", {
      withCredentials: true,
    });
    return response.data;
  },
  getProdutoById: async (id, id_loja) => {
    const response = await baseUrl.get(`/produtos/listar/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },
  createProduto: async (produto) => {
    const response = await baseUrl.post("/produtos/criar", produto, {
      withCredentials: true,
    });
    return response.data;
  },
  updateProduto: async (id, produto) => {
    const response = await baseUrl.put(`/produtos/atualizar/${id}`, produto, {
      withCredentials: true,
    });
    return response.data;
  },
  deleteProduto: async (id, id_loja) => {
    const response = await baseUrl.delete(`/produtos/apagar/${id}`, {
      withCredentials: true,
    });
    return response.data;
  },
};
