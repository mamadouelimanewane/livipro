import { useGrossiste } from "@/context/GrossisteContext";
import { 
  useListTournees, 
  useCreateTournee, 
  useGetTournee, 
  useUpdateTourneeStatut,
  getListTourneesQueryKey, 
  getGetTourneeQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

export function useTournees() {
  const { grossisteId } = useGrossiste();
  return useListTournees(grossisteId, { query: { enabled: !!grossisteId } });
}

export function useTournee(tourneeId: number) {
  const { grossisteId } = useGrossiste();
  return useGetTournee(grossisteId, tourneeId, { query: { enabled: !!grossisteId && !!tourneeId } });
}

export function useTourneeMutations() {
  const { grossisteId } = useGrossiste();
  const qc = useQueryClient();
  
  const create = useCreateTournee({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getListTourneesQueryKey(grossisteId) })
    }
  });

  const updateStatut = useUpdateTourneeStatut({
    mutation: {
      onSuccess: (_, variables) => {
        qc.invalidateQueries({ queryKey: getListTourneesQueryKey(grossisteId) });
        qc.invalidateQueries({ queryKey: getGetTourneeQueryKey(grossisteId, variables.tourneeId) });
      }
    }
  });

  return { create, updateStatut };
}
