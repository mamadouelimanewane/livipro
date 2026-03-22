import { useState } from "react";
import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { formatFCFA, formatDateTime } from "@/lib/utils";
import { ShoppingCart, Package, CheckCircle2, Clock, XCircle, ChevronDown, ChevronUp } from "lucide-react";

const STATUTS = [
  { id: "all", label: "Toutes" },
  { id: "en_attente", label: "En attente" },
  { id: "confirmee", label: "Confirmées" },
  { id: "en_preparation", label: "En préparation" },
  { id: "livree", label: "Livrées" },
  { id: "annulee", label: "Annulées" },
];

const STATUT_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType; label: string }> = {
  en_attente: { color: "text-amber-700", bg: "bg-amber-50 border-amber-200", icon: Clock, label: "En attente" },
  confirmee: { color: "text-blue-700", bg: "bg-blue-50 border-blue-200", icon: CheckCircle2, label: "Confirmée" },
  en_preparation: { color: "text-orange-700", bg: "bg-orange-50 border-orange-200", icon: Package, label: "En préparation" },
  livree: { color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2, label: "Livrée" },
  annulee: { color: "text-rose-700", bg: "bg-rose-50 border-rose-200", icon: XCircle, label: "Annulée" },
};

const NEXT_STATUT: Record<string, string> = {
  en_attente: "confirmee",
  confirmee: "en_preparation",
  en_preparation: "livree",
};

export default function Commandes() {
  const { grossisteId } = useGrossiste();
  const qc = useQueryClient();
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<number | null>(null);

  const { data: commandes, isLoading } = useQuery({
    queryKey: ["commandes", grossisteId],
    queryFn: () => fetch(`/api/grossistes/${grossisteId}/commandes`).then(r => r.json()),
    enabled: !!grossisteId,
    refetchInterval: 30000,
  });

  const updateStatut = useMutation({
    mutationFn: ({ commandeId, statut }: { commandeId: number; statut: string }) =>
      fetch(`/api/grossistes/${grossisteId}/commandes/${commandeId}/statut`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut }),
      }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["commandes"] }),
  });

  const filtered = (commandes || []).filter((c: any) => filter === "all" || c.statut === filter);

  // KPIs
  const kpis = (commandes || []).reduce((acc: Record<string, number>, c: any) => {
    acc[c.statut] = (acc[c.statut] || 0) + 1;
    acc.total = (acc.total || 0) + 1;
    return acc;
  }, {});
  const caTotal = (commandes || []).filter((c: any) => c.statut !== "annulee").reduce((s: number, c: any) => s + Number(c.montantTotal), 0);

  return (
    <div>
      <PageHeader
        title="Commandes Boutiquiers"
        description="Gérez les commandes passées par vos boutiques clientes."
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Nouvelles", value: kpis.en_attente ?? 0, color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
          { label: "Confirmées", value: kpis.confirmee ?? 0, color: "text-blue-600", bg: "bg-blue-50", icon: CheckCircle2 },
          { label: "En préparation", value: kpis.en_preparation ?? 0, color: "text-orange-600", bg: "bg-orange-50", icon: Package },
          { label: "CA Commandes", value: formatFCFA(caTotal), color: "text-emerald-600", bg: "bg-emerald-50", icon: ShoppingCart },
        ].map((k, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-2`}>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div className={`text-xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
        {STATUTS.map(s => (
          <button key={s.id} onClick={() => setFilter(s.id)}
            className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filter === s.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-card border border-border text-muted-foreground hover:border-primary/30"}`}>
            {s.label} {s.id !== "all" && kpis[s.id] ? `(${kpis[s.id]})` : ""}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="bg-card border border-border/50 rounded-2xl p-8 text-center animate-pulse text-muted-foreground">Chargement des commandes...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border/50 rounded-2xl p-12 text-center">
          <ShoppingCart className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <h3 className="font-bold text-foreground">Aucune commande</h3>
          <p className="text-muted-foreground text-sm mt-1">Les commandes de vos boutiques apparaîtront ici.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((c: any) => {
            const cfg = STATUT_CONFIG[c.statut] || STATUT_CONFIG.en_attente;
            const Icon = cfg.icon;
            const nextStatut = NEXT_STATUT[c.statut];
            const isExpanded = expanded === c.id;

            return (
              <div key={c.id} className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-foreground text-base">Commande #{c.id}</span>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.color}`}>
                          <Icon className="w-3 h-3" /> {cfg.label}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">🏪 {c.boutique?.nom ?? "—"} • {formatDateTime(c.createdAt)}</div>
                      {c.notes && <div className="text-xs text-slate-500 mt-1 italic">"{c.notes}"</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">{formatFCFA(Number(c.montantTotal))}</div>
                      <div className="text-xs text-muted-foreground">{c.items?.length || 0} article(s)</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {nextStatut && (
                      <button
                        onClick={() => updateStatut.mutate({ commandeId: c.id, statut: nextStatut })}
                        disabled={updateStatut.isPending}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          nextStatut === "confirmee" ? "bg-blue-500 text-white hover:bg-blue-600" :
                          nextStatut === "en_preparation" ? "bg-orange-500 text-white hover:bg-orange-600" :
                          "bg-emerald-500 text-white hover:bg-emerald-600"
                        }`}>
                        {nextStatut === "confirmee" ? "✅ Confirmer" : nextStatut === "en_preparation" ? "📦 Préparer" : "🚚 Livrer"}
                      </button>
                    )}
                    {c.statut === "en_attente" && (
                      <button onClick={() => updateStatut.mutate({ commandeId: c.id, statut: "annulee" })}
                        className="px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all">
                        Annuler
                      </button>
                    )}
                    <button onClick={() => setExpanded(isExpanded ? null : c.id)}
                      className="p-2.5 rounded-xl border border-border text-muted-foreground hover:bg-slate-50 transition-all">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {isExpanded && c.items?.length > 0 && (
                  <div className="border-t border-border/50 bg-slate-50/50">
                    <div className="px-5 py-2 text-xs font-bold text-muted-foreground uppercase tracking-wider">Détail de la commande</div>
                    {c.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between px-5 py-2.5 border-t border-border/30">
                        <div>
                          <div className="text-sm font-semibold text-foreground">{item.produit?.nom ?? `Produit #${item.produitId}`}</div>
                          <div className="text-xs text-muted-foreground">{item.quantite} {item.produit?.unite ?? "unité(s)"} × {formatFCFA(Number(item.prixUnitaire))}</div>
                        </div>
                        <div className="font-bold text-navy text-sm">{formatFCFA(Number(item.prixUnitaire) * item.quantite)}</div>
                      </div>
                    ))}
                    <div className="flex justify-between px-5 py-3 border-t border-border/50 bg-white">
                      <span className="font-bold text-foreground">Total</span>
                      <span className="font-bold text-primary text-lg">{formatFCFA(Number(c.montantTotal))}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
