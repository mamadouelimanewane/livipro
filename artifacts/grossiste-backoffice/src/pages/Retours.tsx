import { useState } from "react";
import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { formatFCFA, formatDateTime } from "@/lib/utils";
import { RotateCcw, Plus, CheckCircle, XCircle, Package, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RAISONS = [
  { id: "avarie", label: "Avarie / Dommage", color: "text-rose-600 bg-rose-50" },
  { id: "erreur_commande", label: "Erreur de commande", color: "text-orange-600 bg-orange-50" },
  { id: "refus_client", label: "Refus client", color: "text-amber-600 bg-amber-50" },
  { id: "peremption", label: "Date de péremption", color: "text-purple-600 bg-purple-50" },
];

const STATUTS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  en_attente: { label: "En attente", color: "text-amber-700 bg-amber-50 border-amber-200", icon: Clock },
  accepte: { label: "Accepté", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle },
  refuse: { label: "Refusé", color: "text-rose-700 bg-rose-50 border-rose-200", icon: XCircle },
  stock_reintegre: { label: "Stock réintégré", color: "text-blue-700 bg-blue-50 border-blue-200", icon: Package },
};

export default function Retours() {
  const { grossisteId, authFetch } = useGrossiste();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ boutiqueId: "", raison: "avarie", description: "", quantite: "1" });

  const { data: retours, isLoading } = useQuery({
    queryKey: ["retours", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/retours`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: boutiques } = useQuery({
    queryKey: ["boutiques", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/boutiques`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => authFetch(`/api/grossistes/${grossisteId}/retours`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["retours"] });
      setShowForm(false);
      setForm({ boutiqueId: "", raison: "avarie", description: "", quantite: "1" });
      toast({ title: "Retour enregistré", description: "Le retour a été créé avec succès." });
    },
  });

  const updateStatut = useMutation({
    mutationFn: ({ id, statut, montantRembourse }: any) => authFetch(`/api/grossistes/${grossisteId}/retours/${id}/statut`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut, montantRembourse }),
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["retours"] });
      toast({ title: "Retour mis à jour" });
    },
  });

  const liste: any[] = retours || [];
  const filtered = filter === "all" ? liste : liste.filter(r => r.statut === filter);
  const stats = {
    total: liste.length,
    en_attente: liste.filter(r => r.statut === "en_attente").length,
    accepte: liste.filter(r => r.statut === "accepte").length,
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Retours Marchandises" subtitle="Gérez les retours et remboursements" icon={<RotateCcw className="w-5 h-5" />}>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Nouveau retour
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total retours", value: stats.total, color: "text-slate-600", bg: "bg-slate-50" },
          { label: "En attente", value: stats.en_attente, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Acceptés", value: stats.accepte, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.bg} rounded-xl p-4 text-center`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Déclarer un retour</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Boutique</label>
                <select value={form.boutiqueId} onChange={e => setForm(f => ({ ...f, boutiqueId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Sélectionner une boutique</option>
                  {(boutiques || []).map((b: any) => <option key={b.id} value={b.id}>{b.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Raison</label>
                <select value={form.raison} onChange={e => setForm(f => ({ ...f, raison: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  {RAISONS.map(r => <option key={r.id} value={r.id}>{r.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Quantité</label>
                <input type="number" min="1" value={form.quantite} onChange={e => setForm(f => ({ ...f, quantite: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Détails du retour..." />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Annuler</button>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.boutiqueId || createMutation.isPending}
                className="flex-1 bg-primary text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary/90 disabled:opacity-50"
              >
                {createMutation.isPending ? "Enregistrement..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {[{ id: "all", label: "Tous" }, ...Object.entries(STATUTS).map(([id, s]) => ({ id, label: s.label }))].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition ${filter === f.id ? "bg-primary text-white" : "bg-white border border-slate-200 text-slate-600 hover:border-primary"}`}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-xl p-10 text-center text-slate-400">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-slate-400">
            <RotateCcw className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun retour trouvé</p>
          </div>
        ) : filtered.map((r: any) => {
          const raison = RAISONS.find(x => x.id === r.raison);
          const statut = STATUTS[r.statut] || STATUTS.en_attente;
          return (
            <div key={r.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${raison?.color || "text-slate-600 bg-slate-50"}`}>{raison?.label || r.raison}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${statut.color}`}>{statut.label}</span>
                    <span className="text-xs text-slate-400">Qté: {r.quantite}</span>
                  </div>
                  <p className="font-semibold text-slate-800">{r.boutique?.nom || "—"}</p>
                  {r.description && <p className="text-sm text-slate-500 mt-1">{r.description}</p>}
                  <p className="text-xs text-slate-400 mt-1">{formatDateTime(r.createdAt)}</p>
                </div>
                {r.statut === "en_attente" && (
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => updateStatut.mutate({ id: r.id, statut: "accepte" })}
                      className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-100"
                    >Accepter</button>
                    <button
                      onClick={() => updateStatut.mutate({ id: r.id, statut: "refuse" })}
                      className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-rose-100"
                    >Refuser</button>
                  </div>
                )}
                {r.statut === "accepte" && (
                  <button
                    onClick={() => updateStatut.mutate({ id: r.id, statut: "stock_reintegre" })}
                    className="ml-4 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-blue-100"
                  >Réintégrer stock</button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
