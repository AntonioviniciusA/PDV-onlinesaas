import { apiAuth } from "./conection.js";

const AssinaturaService = {
  // Realiza o pagamento (assinatura, boleto, pix, etc)
  async assinar(body) {
    try {
      const response = await apiAuth.post("/assinaturas/create", body);
      console.log("Resposta da API (assinaturas):", response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao processar assinatura:", error);
      console.error("Detalhes do erro:", error.response?.data);
      throw error;
    }
  },
  async listarAssinaturas() {
    try {
      const response = await apiAuth.get("/assinaturas/assinaturas");
      console.log("Resposta da API (assinaturas):", response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao listar assinaturas:", error);
      throw error;
    }
  },

  // Buscar status do pagamento por ID
  async getStatusPagamento(paymentId) {
    try {
      const response = await apiAuth.get(`/assinaturas/status/${paymentId}`);
      console.log("Status da assinatura:", response.data);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar status da assinatura:", error);
      console.error("Detalhes do erro:", error.response?.data);
      throw error;
    }
  },
  async cancelarAssinatura(id) {
    try {
      const response = await apiAuth.post(`/assinaturas/cancel/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error);
      throw error;
    }
  },
};

export { AssinaturaService };
