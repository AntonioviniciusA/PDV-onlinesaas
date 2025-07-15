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
  async createSubscription(customerId, planData) {
    try {
      const subscriptionData = {
        customer: customerId,
        billingType: planData.billingType || "CREDIT_CARD", // CREDIT_CARD, BOLETO, PIX, etc.
        value: planData.value,
        nextDueDate: planData.nextDueDate,
        cycle: planData.cycle || "MONTHLY", // MONTHLY, YEARLY, etc.
        description: planData.description || "Assinatura SaaS",
        endDate: planData.endDate,
        maxPayments: planData.maxPayments,
        fine: planData.fine || { value: 2.0 },
        interest: planData.interest || { value: 1.0 },
        discount: planData.discount || { value: 0, dueDateLimitDays: 0 },
        split: planData.split || [],
      };

      const response = await this.api.post("/subscriptions", subscriptionData);
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
  async getSubscription(subscriptionId) {
    try {
      const response = await this.api.get(`/subscriptions/${subscriptionId}`);
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
  async cancelSubscription(subscriptionId) {
    try {
      const response = await this.api.delete(
        `/subscriptions/${subscriptionId}`
      );
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
  async getSubscriptionPayments(subscriptionId) {
    try {
      const response = await this.api.get(
        `/subscriptions/${subscriptionId}/payments`
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
      const { event, payment, subscription } = webhookData;

      switch (event) {
        case "PAYMENT_RECEIVED":
          return {
            type: "PAYMENT_RECEIVED",
            payment,
            subscription,
            message: "Pagamento recebido com sucesso",
          };

        case "PAYMENT_CONFIRMED":
          return {
            type: "PAYMENT_CONFIRMED",
            payment,
            subscription,
            message: "Pagamento confirmado",
          };

        case "PAYMENT_OVERDUE":
          return {
            type: "PAYMENT_OVERDUE",
            payment,
            subscription,
            message: "Pagamento em atraso",
          };

        case "SUBSCRIPTION_CREATED":
          return {
            type: "SUBSCRIPTION_CREATED",
            subscription,
            message: "Assinatura criada",
          };

        case "SUBSCRIPTION_CANCELLED":
          return {
            type: "SUBSCRIPTION_CANCELLED",
            subscription,
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
}

module.exports = new AssasService();
