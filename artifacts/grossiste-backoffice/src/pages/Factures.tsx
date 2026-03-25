import { useState } from "react";
import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { formatFCFA } from "@/lib/utils";
import { FileText, Plus, Download, CheckCircle2, Clock, AlertTriangle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const STATUTS: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  en_attente: { label: "En attente", color: "text-amber-700 bg-amber-50 border-amber-200", icon: Clock },
  payee: { label: "Payée", color: "text-emerald-700 bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  en_retard: { label: "En retard", color: "text-rose-700 bg-rose-50 border-rose-200", icon: AlertTriangle },
  annulee: { label: "Annulée", color: "text-slate-500 bg-slate-50 border-slate-200", icon: XCircle },
};

export default function Factures() {
  const { grossisteId, authFetch } = useGrossiste();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ boutiqueId: "", periode: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}` });

  const { data: factures, isLoading } = useQuery({
    queryKey: ["factures", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/factures`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: stats } = useQuery({
    queryKey: ["facture-stats", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/factures/stats`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: boutiques } = useQuery({
    queryKey: ["boutiques", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/boutiques`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const genererMutation = useMutation({
    mutationFn: (data: any) => authFetch(`/api/grossistes/${grossisteId}/factures/generer`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["factures"] });
      qc.invalidateQueries({ queryKey: ["facture-stats"] });
      setShowForm(false);
      toast({ title: "Facture générée !", description: "La facture a été créée avec succès." });
    },
  });

  const updateStatut = useMutation({
    mutationFn: ({ id, statut }: any) => authFetch(`/api/grossistes/${grossisteId}/factures/${id}/statut`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ statut }),
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["factures"] });
      qc.invalidateQueries({ queryKey: ["facture-stats"] });
      toast({ title: "Statut mis à jour" });
    },
  });

  const liste: any[] = factures || [];

  return (
    <div className="space-y-6">
      <PageHeader title="Facturation" subtitle="Générez et suivez vos factures clients" icon={<FileText className="w-5 h-5" />}>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Générer une facture
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total factures", value: stats?.count || 0, sub: "créées", color: "text-slate-700 bg-slate-50" },
          { label: formatFCFA(stats?.payees || 0), sub: "encaissé", color: "text-emerald-700 bg-emerald-50" },
          { label: formatFCFA(stats?.enAttente || 0), sub: "en attente", color: "text-amber-700 bg-amber-50" },
          { label: stats?.enRetard || 0, sub: "en retard", color: "text-rose-700 bg-rose-50" },
        ].map((s, i) => (
          <div key={i} className={`${s.color.split(" ")[1]} rounded-xl p-4 text-center`}>
            <p className={`text-xl font-bold ${s.color.split(" ")[0]}`}>{s.label}</p>
            <p className="text-xs text-slate-500 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Générer une facture</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Boutique (optionnel)</label>
                <select value={form.boutiqueId} onChange={e => setForm(f => ({ ...f, boutiqueId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Toutes les boutiques (global)</option>
                  {(boutiques || []).map((b: any) => <option key={b.id} value={b.id}>{b.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Période (mois)</label>
                <input type="month" value={form.periode} onChange={e => setForm(f => ({ ...f, periode: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
                La facture regroupera toutes les commandes de la période sélectionnée avec TVA 18%.
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-slate-600">Annuler</button>
              <button
                onClick={() => genererMutation.mutate(form)}
                disabled={genererMutation.isPending}
                className="flex-1 bg-primary text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
              >{genererMutation.isPending ? "Génération..." : "Générer"}</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="hidden md:table w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              {["Numéro", "Boutique", "Période", "Montant TTC", "TVA", "Statut", "Échéance", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              <tr><td colSpan={8} className="py-10 text-center text-slate-400">Chargement...</td></tr>
            ) : liste.length === 0 ? (
              <tr><td colSpan={8} className="py-10 text-center text-slate-400">Aucune facture</td></tr>
            ) : liste.map((f: any) => {
              const statut = STATUTS[f.statut] || STATUTS.en_attente;
              return (
                <tr key={f.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{f.numero}</td>
                  <td className="px-4 py-3 font-medium text-slate-800">{f.boutique?.nom || "Global"}</td>
                  <td className="px-4 py-3 text-slate-600">{f.periode}</td>
                  <td className="px-4 py-3 font-bold text-slate-800">{formatFCFA(parseFloat(f.montantTTC || "0"))}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{formatFCFA(parseFloat(f.tva || "0"))}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-1 rounded-full border ${statut.color}`}>{statut.label}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {f.echeance ? new Date(f.echeance).toLocaleDateString("fr-FR") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {f.statut === "en_attente" && (
                        <button onClick={() => updateStatut.mutate({ id: f.id, statut: "payee" })}
                          className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-lg hover:bg-emerald-100">
                          Marquer payée
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-slate-50">
          {(liste).map((f: any) => {
            const statut = STATUTS[f.statut] || STATUTS.en_attente;
            return (
              <div key={f.id} className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs font-bold text-slate-700">{f.numero}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statut.color}`}>{statut.label}</span>
                </div>
                <p className="font-semibold text-slate-800">{f.boutique?.nom || "Global"} — {f.periode}</p>
                <p className="text-sm font-bold text-primary mt-1">{formatFCFA(parseFloat(f.montantTTC || "0"))}</p>
                {f.statut === "en_attente" && (
                  <button onClick={() => updateStatut.mutate({ id: f.id, statut: "payee" })}
                    className="mt-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg">
                    Marquer payée
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
