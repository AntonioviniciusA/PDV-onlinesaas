const axios = require("axios");
require("dotenv").config();

const assasConfig = {
  apiKey: process.env.ASSAS_API_KEY,
  baseURL: process.env.ASSAS_BASE_URL || "https://api.asaas.com/v3",
  timeout: 30000,
};

// Cliente HTTP configurado para ASSAS
const assasClient = axios.create({
  baseURL: assasConfig.baseURL,
  timeout: assasConfig.timeout,
  headers: {
    "Content-Type": "application/json",
    access_token: assasConfig.apiKey,
  },
});

// Interceptor para logs em desenvolvimento
if (process.env.NODE_ENV === "development") {
  assasClient.interceptors.request.use((request) => {
    console.log(
      "🚀 Requisição ASSAS:",
      request.method?.toUpperCase(),
      request.url
    );
    return request;
  });

  assasClient.interceptors.response.use(
    (response) => {
      console.log("✅ Resposta ASSAS:", response.status, response.config.url);
      return response;
    },
    (error) => {
      console.error(
        "❌ Erro ASSAS:",
        error.response?.status,
        error.response?.data
      );
      return Promise.reject(error);
    }
  );
}

module.exports = { assasClient, assasConfig };
