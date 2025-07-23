import { baseUrl } from "./conection";

export const cupomService = {
  printThermalCupom: async (cupom) => {
    try {
      const response = await baseUrl.post("/cupom/print-thermal-cupom", cupom, {
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao imprimir cupom:", error);
      throw error;
    }
  },
  printThermalRecibo: async (cupom) => {
    try {
      const response = await baseUrl.post(
        "/cupom/print-thermal-recibo",
        cupom,
        {
          withCredentials: true,
        }
      );
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
  console.log("baseUrl base URL:", baseUrl.defaults.baseURL);
  console.log("baseUrl base URL:", baseUrl.defaults.baseURL);
}
