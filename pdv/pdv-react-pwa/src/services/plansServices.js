import { baseUrl } from "./conection.js";

const planosService = {
  // Buscar todos os planos
  async getAllPlans() {
    try {
      const response = await baseUrl.get("/plano");
      console.log("Resposta da API:", response.data);
      return response.data.data || [];
    } catch (error) {
      console.error("Erro ao buscar planos:", error);
      console.error("Detalhes do erro:", error.response?.data);
      throw error;
    }
  },

  // Buscar planos por ciclo de cobrança
  async getPlansByBillingCycle(billingCycle) {
    try {
      const response = await baseUrl.get(`/plano/ciclo/${billingCycle}`);
      console.log(response);
      console.log(`Resposta da API para ${billingCycle}:`, response.data);
      return response.data.data || [];
    } catch (error) {
      console.error(`Erro ao buscar planos ${billingCycle}:`, error);
      console.error("Detalhes do erro:", error.response?.data);
      throw error;
    }
  },

  // Buscar planos mensais
  async getMonthlyPlans() {
    return this.getPlansByBillingCycle("monthly");
  },

  // Buscar planos anuais
  async getAnnuallyPlans() {
    return this.getPlansByBillingCycle("yearly");
  },

  // Buscar plano por ID
  async getPlanById(id) {
    try {
      const response = await baseUrl.get(`/plano/${id}`);
      console.log("Resposta da API para plano por ID:", response.data);
      return response.data.data;
    } catch (error) {
      console.error("Erro ao buscar plano:", error);
      console.error("Detalhes do erro:", error.response?.data);
      throw error;
    }
  },
};

export default planosService;
