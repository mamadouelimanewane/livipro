import { useLivraisons } from "@/hooks/use-livraisons";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { MapPin } from "lucide-react";
import { formatFCFA, formatDate } from "@/lib/utils";

export default function Livraisons() {
  const { data: livraisons, isLoading } = useLivraisons();

  return (
    <div>
      <PageHeader 
        title="Journal des Livraisons" 
        description="Historique complet des dépôts et encaissements réalisés."
      />

      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement de l'historique...</div>
        ) : livraisons?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <MapPin className="w-16 h-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-foreground">Aucune livraison</h3>
            <p className="text-muted-foreground mt-2">L'historique des opérations est vide.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">Date de saisie</th>
                  <th className="px-6 py-4">N° Tournée</th>
                  <th className="px-6 py-4">Boutique Livrée</th>
                  <th className="px-6 py-4">Facture (FCFA)</th>
                  <th className="px-6 py-4">Paiement</th>
                  <th className="px-6 py-4">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {livraisons?.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 text-muted-foreground">{formatDate(l.createdAt)}</td>
                    <td className="px-6 py-4 font-bold text-slate-500">#TRN-{l.tourneeId}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{l.boutique?.nom ?? "—"}</td>
                    <td className="px-6 py-4 font-bold text-navy">{formatFCFA(l.montant)}</td>
                    <td className="px-6 py-4"><StatusBadge status={l.methodePaiement} /></td>
                    <td className="px-6 py-4"><StatusBadge status={l.statut} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
