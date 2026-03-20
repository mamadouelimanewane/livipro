import { useGrossiste } from "@/context/GrossisteContext";
import { 
  useListChauffeurs, 
  useCreateChauffeur, 
  useUpdateChauffeur, 
  useDeleteChauffeur, 
  getListChauffeursQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export function useChauffeurs() {
  const { grossisteId } = useGrossiste();
  return useListChauffeurs(grossisteId, { query: { enabled: !!grossisteId } });
}

export function useChauffeurMutations() {
  const { grossisteId } = useGrossiste();
  const qc = useQueryClient();
  
  const create = useCreateChauffeur({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getListChauffeursQueryKey(grossisteId) })
    }
  });

  const update = useUpdateChauffeur({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getListChauffeursQueryKey(grossisteId) })
    }
  });

  const remove = useDeleteChauffeur({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getListChauffeursQueryKey(grossisteId) })
    }
  });

  return { create, update, remove };
}
