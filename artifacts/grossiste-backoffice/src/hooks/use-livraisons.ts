import { useGrossiste } from "@/context/GrossisteContext";
import { useListLivraisons } from "@workspace/api-client-react";

export function useLivraisons() {
  const { grossisteId } = useGrossiste();
  return useListLivraisons(grossisteId, { query: { enabled: !!grossisteId } });
}
