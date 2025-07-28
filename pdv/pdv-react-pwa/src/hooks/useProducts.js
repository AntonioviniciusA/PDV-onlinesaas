import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosServices } from "../services/produtosServices";
import { useIsAuthenticated } from "./useAuth";

export const useProdutos = () => {
  const { data: autenticado, isLoading } = useIsAuthenticated();
  return useQuery({
    queryKey: ["produtos"],
    queryFn: async () => {
      const response = await produtosServices.getProdutos();
      console.log("Response from getProdutos:", response);
      return response.produtos || [];
    },
    staleTime: 30 * 60 * 1000, // 30 minutos em milissegundos
    cacheTime: 30 * 60 * 1000, // 30 minutos em milissegundos
    enabled: !!autenticado && !isLoading,
  });
};

export const useCreateProduto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: produtosServices.createProduto,
    onSuccess: () => {
      queryClient.invalidateQueries(["produtos"]);
    },
  });
};

export const useUpdateProduto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => produtosServices.updateProduto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["produtos"]);
    },
  });
};

export const useDeleteProduto = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: produtosServices.deleteProduto,
    onSuccess: () => {
      queryClient.invalidateQueries(["produtos"]);
    },
  });
};
