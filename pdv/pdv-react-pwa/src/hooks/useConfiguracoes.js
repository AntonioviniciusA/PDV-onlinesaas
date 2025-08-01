import { useState, useEffect } from "react";
import { configuracoesSistemaService } from "../services/configuracoesSistemaService";

export const useConfiguracoes = () => {
  const [configuracoes, setConfiguracoes] = useState({
    numero_caixa: 1,
    id_loja: null,
    timezone: "America/Sao_Paulo",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadConfiguracoes = async () => {
    try {
      setLoading(true);
      const response = await configuracoesSistemaService.getConfiguracoes();
      if (response.sucesso && response.configuracoes) {
        setConfiguracoes({
          numero_caixa: response.configuracoes.numero_caixa || 1,
          id_loja: response.configuracoes.id_loja,
          timezone: response.configuracoes.timezone || "America/Sao_Paulo",
        });
      }
    } catch (err) {
      setError(err.message);
      console.error("Erro ao carregar configurações:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfiguracoes();
  }, []);

  const updateConfiguracoes = async (novasConfiguracoes) => {
    try {
      const response = await configuracoesSistemaService.updateConfiguracoes(
        novasConfiguracoes
      );
      if (response.sucesso) {
        setConfiguracoes((prev) => ({
          ...prev,
          ...novasConfiguracoes,
        }));
        return { sucesso: true };
      }
      return { sucesso: false, erro: response.mensagem };
    } catch (err) {
      setError(err.message);
      return { sucesso: false, erro: err.message };
    }
  };

  return {
    configuracoes,
    loading,
    error,
    loadConfiguracoes,
    updateConfiguracoes,
  };
};
