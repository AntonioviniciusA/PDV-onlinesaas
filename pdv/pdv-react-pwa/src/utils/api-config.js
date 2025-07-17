// Configuração da API
export const API_CONFIG = {
  // URL base da API - ajuste conforme sua configuração
  BASE_URL: process.env.URL_API_PDV,

  // Endpoints
  ENDPOINTS: {
    CUPOM: "/api/cupom",
    PRODUTOS: "/api/produtos",
    VENDAS: "/api/vendas",
    USUARIOS: "/api/usuarios",
    ASSINATURAS: "/api/assinaturas",
  },

  // Timeout para requisições (em ms)
  TIMEOUT: 10000,

  // Headers padrão
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
  },
};

// Função para construir URL completa
export function buildApiUrl(endpoint) {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Função para fazer requisição com timeout
export async function apiRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...API_CONFIG.DEFAULT_HEADERS,
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
