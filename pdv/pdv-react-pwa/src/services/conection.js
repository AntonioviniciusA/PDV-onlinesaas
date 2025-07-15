import axios from "axios";

export const apiNoAuth = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/saas`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiAuth = axios.create({
  baseURL: `${process.env.REACT_APP_API_URL}/saas`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para injetar token a TODAS as requisições
apiAuth.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Interceptor para tratar respostas (exemplo para 401)
apiAuth.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.error("Token expirado ou inválido");
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// Interceptor para tratamento de erros (exemplo para conexões)
const handleError = (error) => {
  if (error.code === "ERR_NETWORK") {
    console.error("Erro de conexão: Servidor não está respondendo");
    return Promise.reject(
      new Error(
        "Servidor não está respondendo. Verifique se o backend está rodando.",
      ),
    );
  }
  if (error.code === "ECONNABORTED") {
    console.error("Timeout na requisição");
    return Promise.reject(
      new Error("A requisição demorou muito para responder."),
    );
  }
  const message = error.response?.data?.message || "Erro na requisição";
  console.error("API Error:", message);
  return Promise.reject(error);
};

apiAuth.interceptors.response.use((response) => response, handleError);

apiNoAuth.interceptors.response.use((response) => response, handleError);
