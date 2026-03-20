import { useParams, Link } from "wouter";
import { useTournee, useTourneeMutations } from "@/hooks/use-tournees";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, MapPin, Truck, Calendar, Wallet } from "lucide-react";
import { formatDate, formatFCFA } from "@/lib/utils";
import { toast } from "sonner";

export default function TourneeDetails() {
  const params = useParams();
  const tourneeId = Number(params.id);
  const { data: tournee, isLoading } = useTournee(tourneeId);
  const { updateStatut } = useTourneeMutations();

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground animate-pulse">Chargement des détails...</div>;
  }

  if (!tournee) {
    return <div className="p-8 text-center text-red-500 font-bold">Tournée non trouvée.</div>;
  }

  return (
    <div>
      <Link href="/tournees" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux tournées
      </Link>
      
      <PageHeader 
        title={`Manifeste #TRN-${tournee.id}`} 
        action={
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-slate-500">Changer le statut:</span>
            <select
              value={tournee.statut}
              onChange={(e) => {
                updateStatut.mutate({ 
                  tourneeId, 
                  data: { statut: e.target.value as any } 
                }, { onSuccess: () => toast.success("Statut de la tournée mis à jour") });
              }}
              disabled={updateStatut.isPending}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-navy focus:ring-2 focus:ring-primary/20 outline-none shadow-sm cursor-pointer"
            >
              <option value="planifiee">Planifiée</option>
              <option value="en_cours">En Cours de Livraison</option>
              <option value="terminee">Terminée</option>
              <option value="annulee">Annulée</option>
            </select>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar className="w-5 h-5" /></div>
            <p className="text-sm font-bold text-muted-foreground">Date Prévue</p>
          </div>
          <p className="text-lg font-bold text-foreground pl-11">{formatDate(tournee.date)}</p>
        </div>
        <div className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Truck className="w-5 h-5" /></div>
            <p className="text-sm font-bold text-muted-foreground">Chauffeur</p>
          </div>
          <p className="text-lg font-bold text-foreground pl-11">{tournee.chauffeurNom}</p>
        </div>
        <div className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Wallet className="w-5 h-5" /></div>
            <p className="text-sm font-bold text-muted-foreground">Valeur Globale</p>
          </div>
          <p className="text-lg font-bold text-foreground pl-11">{formatFCFA(tournee.totalLivraisons)}</p>
        </div>
        <div className="bg-card border border-border/50 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><MapPin className="w-5 h-5" /></div>
            <p className="text-sm font-bold text-muted-foreground">État d'Avancement</p>
          </div>
          <div className="pl-11 mt-1"><StatusBadge status={tournee.statut} /></div>
        </div>
      </div>

      <h3 className="text-xl font-bold text-foreground mb-4">Arrêts & Livraisons ({tournee.livraisons?.length || 0})</h3>
      <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
        {tournee.livraisons?.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">Aucune livraison rattachée à cette tournée.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-bold">
                <tr>
                  <th className="px-6 py-4">ID Opération</th>
                  <th className="px-6 py-4">Client (Boutique)</th>
                  <th className="px-6 py-4">Montant Collecté</th>
                  <th className="px-6 py-4">Moyen de Paiement</th>
                  <th className="px-6 py-4">Statut Exécution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tournee.livraisons?.map(l => (
                  <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-500">#{l.id}</td>
                    <td className="px-6 py-4 font-bold text-foreground">{l.boutiqueNom}</td>
                    <td className="px-6 py-4 font-bold text-navy">{formatFCFA(l.montantTotal)}</td>
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
