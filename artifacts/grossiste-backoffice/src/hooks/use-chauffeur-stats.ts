import { useQuery } from "@tanstack/react-query";
import { useGrossiste } from "@/context/GrossisteContext";

export interface ChauffeurStats {
  totalTournees: number;
  totalCA: number;
  totalReussies: number;
  totalArrets: number;
  tauxReussite: number;
  meilleurCA: number;
  caMois: number;
  moisLabel: string;
  dernieresTournees: Array<{
    id: number;
    date: string;
    statut: string;
    nombreArrets: number;
    ca: number;
    reussies: number;
  }>;
}

export function useChauffeurStats(chauffeurId: number) {
  const { grossisteId } = useGrossiste();
  return useQuery<ChauffeurStats>({
    queryKey: ["chauffeur-stats", grossisteId, chauffeurId],
    enabled: !!grossisteId && !!chauffeurId,
    queryFn: async () => {
      const res = await fetch(`/api/grossistes/${grossisteId}/chauffeurs/${chauffeurId}/stats`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    },
  });
}
