import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { produtosServices } from "../services/produtosServices";
import { useIsAuthenticated } from "./useAuth";

export const useProdutos = () => {
  const { data: autenticado, isLoading } = useIsAuthenticated();
  return useQuery({
    queryKey: ["produtos"],
    queryFn: () => produtosServices.getProdutos().then((res) => res.data),
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
