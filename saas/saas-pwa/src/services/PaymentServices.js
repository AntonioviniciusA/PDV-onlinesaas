import { apiAuth } from "./conection.js";

const PaymentService = {
  // Realiza o pagamento (assinatura, boleto, pix, etc)
  async pagar(body) {
    try {
      const response = await apiAuth.post("/pagamento", body);
      console.log("Resposta da API (pagamento):", response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      console.error("Detalhes do erro:", error.response?.data);
      throw error;
    }
  },

  // Buscar status do pagamento por ID
  async getStatusPagamento(paymentId) {
    try {
      const response = await apiAuth.get(`/pagamento/${paymentId}/status`);
      console.log("Status do pagamento:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar status do pagamento:", error);
      console.error("Detalhes do erro:", error.response?.data);
      throw error;
    }
  },
};

export { PaymentService };
