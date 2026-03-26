import { useGrossiste } from "@/context/GrossisteContext";
import { useGetGrossisteStats } from "@workspace/api-client-react";

export function useStats() {
  const { grossisteId } = useGrossiste();
  return useGetGrossisteStats(grossisteId, { query: { enabled: !!grossisteId } });
}
