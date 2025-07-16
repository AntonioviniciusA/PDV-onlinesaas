const axios = require("axios");

class AssasService {
  constructor() {
    this.apiKey = process.env.ASSAS_API_KEY;
    this.baseURL = process.env.ASSAS_BASE_URL;

    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        access_token: this.apiKey,
        "Content-Type": "application/json",
      },
    });
  }

  // Criar cliente na ASSAS
  async createCustomer(userData) {
    try {
      const customerData = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || "",
        mobilePhone: userData.mobilePhone || "",
        cpfCnpj: userData.cpfCnpj || "",
        postalCode: userData.postalCode || "",
        address: userData.address || "",
        addressNumber: userData.addressNumber || "",
        complement: userData.complement || "",
        province: userData.province || "",
        city: userData.city || "",
        state: userData.state || "",
        country: userData.country || "Brasil",
        externalReference: userData.id, // ID do usuário no nosso sistema
        notificationDisabled: false,
        additionalEmails: userData.additionalEmails || "",
        municipalInscription: userData.municipalInscription || "",
        stateInscription: userData.stateInscription || "",
        observations: userData.observations || "",
      };

      const response = await this.api.post("/customers", customerData);
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao criar cliente na ASSAS:",
        error.response?.data || error.message
      );
      throw new Error("Erro ao criar cliente na ASSAS");
    }
  }

  // Criar assinatura na ASSAS
  async createassinaturas(customerId, planData) {
    const assinaturasData = {
      ...planData,
      customer: customerId,
      description: planData.description,
    };
    console.log("assinaturasData", assinaturasData);
    try {
      // Trocar endpoint para /subscriptions
      const response = await this.api.post("/subscriptions", assinaturasData);
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao criar assinatura na ASSAS:",
        error.response?.data || error.message
      );
      throw new Error("Erro ao criar assinatura na ASSAS");
    }
  }

  // Obter assinatura por ID
  async getassinaturas(assinaturasId) {
    try {
      // Trocar endpoint para /subscriptions
      const response = await this.api.get(`/subscriptions/${assinaturasId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao obter assinatura na ASSAS:",
        error.response?.data || error.message
      );
      throw new Error("Erro ao obter assinatura na ASSAS");
    }
  }

  // Cancelar assinatura
  async cancelassinaturas(assinaturasId) {
    try {
      const response = await this.api.delete(`/subscriptions/${assinaturasId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao cancelar assinatura na ASSAS:",
        error.response?.data || error.message
      );
      throw new Error("Erro ao cancelar assinatura na ASSAS");
    }
  }

  // Obter pagamentos de uma assinatura
  async getassinaturasPayments(assinaturasId) {
    try {
      const response = await this.api.get(
        `/assinaturas/${assinaturasId}/payments`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao obter pagamentos na ASSAS:",
        error.response?.data || error.message
      );
      throw new Error("Erro ao obter pagamentos na ASSAS");
    }
  }

  // Criar cobrança única
  async createPayment(paymentData) {
    try {
      const response = await this.api.post("/payments", paymentData);
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao criar pagamento na ASSAS:",
        error.response?.data || error.message
      );
      throw new Error("Erro ao criar pagamento na ASSAS");
    }
  }

  // Obter pagamento por ID
  async getPayment(paymentId) {
    try {
      const response = await this.api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao obter pagamento na ASSAS:",
        error.response?.data || error.message
      );
      throw new Error("Erro ao obter pagamento na ASSAS");
    }
  }

  // Processar webhook da ASSAS
  processWebhook(webhookData) {
    try {
      const { event, payment, assinaturas } = webhookData;

      switch (event) {
        case "PAYMENT_RECEIVED":
          return {
            type: "PAYMENT_RECEIVED",
            payment,
            assinaturas,
            message: "Pagamento recebido com sucesso",
          };

        case "PAYMENT_CONFIRMED":
          return {
            type: "PAYMENT_CONFIRMED",
            payment,
            assinaturas,
            message: "Pagamento confirmado",
          };

        case "PAYMENT_OVERDUE":
          return {
            type: "PAYMENT_OVERDUE",
            payment,
            assinaturas,
            message: "Pagamento em atraso",
          };

        case "assinaturas_CREATED":
          return {
            type: "assinaturas_CREATED",
            assinaturas,
            message: "Assinatura criada",
          };

        case "assinaturas_CANCELLED":
          return {
            type: "assinaturas_CANCELLED",
            assinaturas,
            message: "Assinatura cancelada",
          };

        default:
          return {
            type: "UNKNOWN_EVENT",
            data: webhookData,
            message: "Evento não reconhecido",
          };
      }
    } catch (error) {
      console.error("Erro ao processar webhook da ASSAS:", error);
      throw new Error("Erro ao processar webhook");
    }
  }

  // Listar cobranças de uma assinatura
  async getAssinaturaPayments(assinaturaId) {
    try {
      const response = await this.api.get(
        `/subscriptions/${assinaturaId}/payments`
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao listar cobranças da assinatura na ASSAS:",
        error.response?.data || error.message
      );
      throw new Error("Erro ao listar cobranças da assinatura na ASSAS");
    }
  }

  // Atualizar cartão de crédito da assinatura sem cobrança
  async updateCreditCard(assinaturaId, creditCardData) {
    try {
      // creditCardData deve conter os dados do cartão conforme docs da Asaas
      const response = await this.api.put(
        `/subscriptions/${assinaturaId}/creditCard`,
        creditCardData
      );
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao atualizar cartão de crédito da assinatura na ASSAS:",
        error.response?.data || error.message
      );
      throw new Error(
        "Erro ao atualizar cartão de crédito da assinatura na ASSAS"
      );
    }
  }
}

module.exports = new AssasService();
