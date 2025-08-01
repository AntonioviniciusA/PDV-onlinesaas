import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { caixaService } from "../services/caixaServices";

export const useCaixa = () => {
  const queryClient = useQueryClient();

  // Query para verificar se há um caixa aberto
  const {
    data: cashSession,
    isLoading: loading,
    error,
    refetch: verificarCaixaAberto,
  } = useQuery({
    queryKey: ["caixa", "status"],
    queryFn: async () => {
      const response = await caixaService.verificaCaixaAberto();
      return response.sucesso ? response.caixa : null;
    },
    staleTime: 0, // Sempre buscar dados frescos
    cacheTime: 5 * 60 * 1000, // Cache por 5 minutos
    refetchOnWindowFocus: true, // Refazer query quando a janela ganhar foco
  });

  // Função para invalidar queries relacionadas ao caixa
  const invalidateCaixaQueries = () => {
    queryClient.invalidateQueries(["caixa"]);
  };

  // Mutation para abrir caixa
  const abrirCaixaMutation = useMutation({
    mutationFn: async ({ amount, usuario }) => {
      return await caixaService.abrirCaixa(amount, usuario);
    },
    onSuccess: (response) => {
      if (response.sucesso) {
        // Atualizar o cache com os dados do caixa
        queryClient.setQueryData(["caixa", "status"], response.caixa);
        // Invalidar queries para atualizar outros componentes
        invalidateCaixaQueries();
      }
    },
    onError: (error) => {
      console.error("Erro ao abrir caixa:", error);
    },
  });

  // Mutation para fechar caixa
  const fecharCaixaMutation = useMutation({
    mutationFn: async ({ amount, usuario }) => {
      return await caixaService.fecharCaixa(amount, usuario);
    },
    onSuccess: (response) => {
      if (response.sucesso) {
        // Limpar o cache do caixa
        queryClient.setQueryData(["caixa", "status"], null);
        // Invalidar queries para atualizar outros componentes
        invalidateCaixaQueries();
      }
    },
    onError: (error) => {
      console.error("Erro ao fechar caixa:", error);
    },
  });

  // Função para abrir caixa
  const abrirCaixa = async (amount, usuario) => {
    try {
      const response = await abrirCaixaMutation.mutateAsync({
        amount,
        usuario,
      });

      if (response.sucesso && response.caixa) {
        return response;
      } else {
        throw new Error(response.mensagem || "Erro ao abrir caixa");
      }
    } catch (error) {
      throw error;
    }
  };

  // Função para fechar caixa
  const fecharCaixa = async (amount, usuario) => {
    try {
      const response = await fecharCaixaMutation.mutateAsync({
        amount,
        usuario,
      });

      if (response.sucesso) {
        return response;
      } else {
        throw new Error(response.mensagem || "Erro ao fechar caixa");
      }
    } catch (error) {
      throw error;
    }
  };

  // Função para limpar dados do caixa (logout, etc.)
  const limparCaixa = () => {
    queryClient.setQueryData(["caixa", "status"], null);
    invalidateCaixaQueries();
  };

  return {
    cashSession,
    loading:
      loading || abrirCaixaMutation.isLoading || fecharCaixaMutation.isLoading,
    error: error || abrirCaixaMutation.error || fecharCaixaMutation.error,
    abrirCaixa,
    fecharCaixa,
    verificarCaixaAberto,
    limparCaixa,
  };
};
