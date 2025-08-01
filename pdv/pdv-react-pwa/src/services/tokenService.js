import { baseUrl } from "./conection";

class TokenService {
  // Salvar token nas configurações do sistema
  async salvarToken(token, expiracao = null) {
    try {
      const response = await baseUrl.post("/configuracoes_sistema/token", {
        token_acesso: token,
        token_expiracao: expiracao,
      });
      return response.data;
    } catch (error) {
      console.error("Erro ao salvar token:", error);
      throw error;
    }
  }

  // Buscar token das configurações do sistema
  async buscarToken() {
    try {
      const response = await baseUrl.get("/configuracoes_sistema/token");
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar token:", error);
      throw error;
    }
  }

  // Verificar se o token está válido (não expirou)
  async verificarTokenValido() {
    try {
      const response = await baseUrl.get(
        "/configuracoes_sistema/token/verificar"
      );
      return response.data;
    } catch (error) {
      console.error("Erro ao verificar token:", error);
      throw error;
    }
  }

  // Limpar token das configurações
  async limparToken() {
    try {
      const response = await baseUrl.delete("/configuracoes_sistema/token");
      return response.data;
    } catch (error) {
      console.error("Erro ao limpar token:", error);
      throw error;
    }
  }
}

export const tokenService = new TokenService();
