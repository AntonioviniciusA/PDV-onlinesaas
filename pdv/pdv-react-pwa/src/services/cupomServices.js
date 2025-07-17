import { apiAuth } from "./conection";

export const cupomService = {
  printThermalCupom: async (cupom) => {
    try {
      const response = await apiAuth.post("/cupom/print-thermal-cupom", cupom);
      return response.data;
    } catch (error) {
      console.error("Erro ao imprimir cupom:", error);
      throw error;
    }
  },
  printThermalRecibo: async (cupom) => {
    try {
      const response = await apiAuth.post("/cupom/print-thermal-recibo", cupom);
      return response.data;
    } catch (error) {
      console.error("Erro ao imprimir recibo:", error);
      throw error;
    }
  },
};

// Debug logs (opcional)
if (process.env.NODE_ENV !== "production") {
  console.log("CupomService configurado com:");
  console.log("apiAuth base URL:", apiAuth.defaults.baseURL);
  console.log("apiAuth base URL:", apiAuth.defaults.baseURL);
}
