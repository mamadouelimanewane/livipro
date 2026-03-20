import { useGrossiste } from "@/context/GrossisteContext";
import { 
  useListProduits, 
  useCreateProduit, 
  useUpdateProduit, 
  useDeleteProduit, 
  getListProduitsQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export function useProduits() {
  const { grossisteId } = useGrossiste();
  return useListProduits(grossisteId, { query: { enabled: !!grossisteId } });
}

export function useProduitMutations() {
  const { grossisteId } = useGrossiste();
  const qc = useQueryClient();
  
  const create = useCreateProduit({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListProduitsQueryKey(grossisteId) }) }
  });

  const update = useUpdateProduit({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListProduitsQueryKey(grossisteId) }) }
  });

  const remove = useDeleteProduit({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListProduitsQueryKey(grossisteId) }) }
  });

  return { create, update, remove };
}
