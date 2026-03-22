import { useParams, Link } from "wouter";
import { useTournee, useTourneeMutations } from "@/hooks/use-tournees";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, MapPin, Truck, Calendar, Wallet, CheckCircle2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { formatDate, formatFCFA } from "@/lib/utils";
import { toast } from "sonner";

export default function TourneeDetails() {
  const params = useParams();
  const tourneeId = Number(params.id);
  const { data: tournee, isLoading } = useTournee(tourneeId);
  const { updateStatut } = useTourneeMutations();

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
        </div>
        <div className="h-64 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!tournee) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <XCircle className="w-16 h-16 text-rose-300 mb-4" />
        <h2 className="text-2xl font-bold text-slate-700">Tournée non trouvée</h2>
        <p className="text-muted-foreground mt-2 mb-6">Cette tournée n'existe pas ou a été supprimée.</p>
        <Link href="/tournees" className="flex items-center gap-2 text-primary font-bold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Retour aux tournées
        </Link>
      </div>
    );
  }

  const livraisons = tournee.livraisons ?? [];
  const livraisonsReussies = livraisons.filter((l: any) => l.statut === "livree").length;
  const livraisonsEchec = livraisons.filter((l: any) => l.statut === "echec").length;
  const livraisonsLitige = livraisons.filter((l: any) => l.statut === "litige").length;
  const totalCollecte = livraisons.filter((l: any) => l.statut === "livree").reduce((s: number, l: any) => s + (Number(l.montantTotal) || 0), 0);
  const tauxReussite = livraisons.length > 0 ? Math.round((livraisonsReussies / livraisons.length) * 100) : 0;

  return (
    <div>
      <Link href="/tournees" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-primary transition-colors mb-6">
        <ArrowLeft className="w-4 h-4 mr-1" /> Retour aux tournées
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Manifeste #TRN-{tournee.id}</h1>
          <p className="text-muted-foreground mt-0.5 text-sm">Détail complet de la tournée et état de chaque livraison</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-500 hidden sm:inline">Statut :</span>
          <select
            value={tournee.statut}
            onChange={e => {
              updateStatut.mutate(
                { tourneeId, data: { statut: e.target.value as any } },
                { onSuccess: () => toast.success("Statut mis à jour") }
              );
            }}
            disabled={updateStatut.isPending}
            className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-navy focus:ring-2 focus:ring-primary/20 outline-none shadow-sm cursor-pointer text-sm"
          >
            <option value="planifiee">Planifiée</option>
            <option value="en_cours">En Cours de Livraison</option>
            <option value="terminee">Terminée</option>
            <option value="annulee">Annulée</option>
          </select>
        </div>
      </div>

      {/* Info KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-card border border-border/50 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Calendar className="w-4 h-4" /></div>
            <p className="text-xs font-semibold text-muted-foreground">Date</p>
          </div>
          <p className="font-bold text-foreground">{formatDate(tournee.date)}</p>
        </div>
        <div className="bg-card border border-border/50 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-orange-50 text-orange-600 rounded-lg"><Truck className="w-4 h-4" /></div>
            <p className="text-xs font-semibold text-muted-foreground">Chauffeur</p>
          </div>
          <p className="font-bold text-foreground">{tournee.chauffeurNom}</p>
        </div>
        <div className="bg-card border border-border/50 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Wallet className="w-4 h-4" /></div>
            <p className="text-xs font-semibold text-muted-foreground">Collecté</p>
          </div>
          <p className="font-bold text-emerald-600">{formatFCFA(totalCollecte)}</p>
        </div>
        <div className="bg-card border border-border/50 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg"><MapPin className="w-4 h-4" /></div>
            <p className="text-xs font-semibold text-muted-foreground">Statut</p>
          </div>
          <StatusBadge status={tournee.statut} />
        </div>
      </div>

      {/* Progress summary */}
      {livraisons.length > 0 && (
        <div className="bg-card border border-border/50 rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-foreground">Avancement de la tournée</h3>
            <span className="text-sm font-bold text-primary">{tauxReussite}% réussi</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all" style={{ width: `${tauxReussite}%` }} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-600" /></div>
              <div>
                <div className="text-lg font-bold text-emerald-600">{livraisonsReussies}</div>
                <div className="text-xs text-muted-foreground">Livrées</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center"><XCircle className="w-4 h-4 text-rose-600" /></div>
              <div>
                <div className="text-lg font-bold text-rose-600">{livraisonsEchec}</div>
                <div className="text-xs text-muted-foreground">Échecs</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-amber-600" /></div>
              <div>
                <div className="text-lg font-bold text-amber-600">{livraisonsLitige}</div>
                <div className="text-xs text-muted-foreground">Litiges</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Livraisons */}
      <h3 className="text-lg font-bold text-foreground mb-4">Arrêts & Livraisons ({livraisons.length})</h3>

      {livraisons.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl p-8 text-center text-muted-foreground">
          Aucune livraison rattachée à cette tournée.
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/50 border-b border-slate-100 text-slate-500 uppercase tracking-wider text-xs font-bold">
                  <tr>
                    <th className="px-6 py-4">Arrêt</th>
                    <th className="px-6 py-4">Client (Boutique)</th>
                    <th className="px-6 py-4">Montant Collecté</th>
                    <th className="px-6 py-4">Moyen de Paiement</th>
                    <th className="px-6 py-4">Statut Exécution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {livraisons.map((l: any, idx: number) => (
                    <tr key={l.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center">{idx + 1}</div>
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">{l.boutiqueNom}</td>
                      <td className="px-6 py-4 font-bold text-navy">{formatFCFA(l.montantTotal)}</td>
                      <td className="px-6 py-4"><StatusBadge status={l.methodePaiement} /></td>
                      <td className="px-6 py-4"><StatusBadge status={l.statut} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {livraisons.map((l: any, idx: number) => (
              <div key={l.id} className="bg-card border border-border/50 rounded-2xl shadow-sm p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center flex-shrink-0">{idx + 1}</div>
                  <div className="flex-1">
                    <div className="font-bold text-foreground">{l.boutiqueNom}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Arrêt {idx + 1} sur {livraisons.length}</div>
                  </div>
                  <StatusBadge status={l.statut} />
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <StatusBadge status={l.methodePaiement} />
                  <span className="font-bold text-navy">{formatFCFA(l.montantTotal)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
