import { apiNoAuth, apiAuth } from "./conection";

export const CupomService = {
  // Imprimir cupom
  imprimir: async (cupom) => {
    try {
      const response = await apiNoAuth.post("/cupom/imprimir", cupom);
      return response.data;
    } catch (error) {
      console.error("Erro ao imprimir cupom:", error);
      throw error;
    }
  },

  // Buscar cupons (exemplo futuro)
  buscarCupons: async () => {
    try {
      const response = await apiAuth.get("/cupom");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar cupons:", error);
      throw error;
    }
  },

  // Buscar cupom por ID (exemplo futuro)
  buscarCupomPorId: async (id) => {
    try {
      const response = await apiAuth.get(`/cupom/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar cupom por ID:", error);
      throw error;
    }
  },
};

// Debug logs (opcional)
if (process.env.NODE_ENV !== "production") {
  console.log("CupomService configurado com:");
  console.log("apiNoAuth base URL:", apiNoAuth.defaults.baseURL);
  console.log("apiAuth base URL:", apiAuth.defaults.baseURL);
}
