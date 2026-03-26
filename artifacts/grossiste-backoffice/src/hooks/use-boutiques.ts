import { useGrossiste } from "@/context/GrossisteContext";
import { 
  useListBoutiques, 
  useCreateBoutique, 
  useUpdateBoutique, 
  useDeleteBoutique, 
  getListBoutiquesQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export function useBoutiques() {
  const { grossisteId } = useGrossiste();
  return useListBoutiques(grossisteId, { query: { enabled: !!grossisteId } });
}

export function useBoutiqueMutations() {
  const { grossisteId } = useGrossiste();
  const qc = useQueryClient();
  
  const create = useCreateBoutique({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListBoutiquesQueryKey(grossisteId) }) }
  });

  const update = useUpdateBoutique({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListBoutiquesQueryKey(grossisteId) }) }
  });

  const remove = useDeleteBoutique({
    mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListBoutiquesQueryKey(grossisteId) }) }
  });

  return { create, update, remove };
}
