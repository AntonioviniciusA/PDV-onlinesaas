import { baseUrl } from "./conection";
export const profileService = {
  getClienteProfile: async () => {
    try {
      const response = await baseUrl.get("/cliente/profile");
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao buscar perfil do cliente:",
        error?.response?.data || error.message
      );
      throw new Error("Não foi possível carregar o perfil do cliente.");
    }
  },

  getParceiroProfile: async () => {
    try {
      const response = await baseUrl.get("/parceiro-saas/profile");
      return response.data;
    } catch (error) {
      console.error(
        "Erro ao buscar perfil do parceiro:",
        error?.response?.data || error.message
      );
      throw new Error("Não foi possível carregar o perfil do parceiro.");
    }
  },
};
