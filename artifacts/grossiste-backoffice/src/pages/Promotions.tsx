import { useState } from "react";
import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { formatFCFA, formatDateTime } from "@/lib/utils";
import { Tag, Plus, Percent, DollarSign, Truck, Star, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TYPES = [
  { id: "remise_pct", label: "Remise %", icon: Percent, color: "text-orange-600 bg-orange-50" },
  { id: "remise_fixe", label: "Remise fixe (FCFA)", icon: DollarSign, color: "text-blue-600 bg-blue-50" },
  { id: "livraison_offerte", label: "Livraison offerte", icon: Truck, color: "text-emerald-600 bg-emerald-50" },
  { id: "points_bonus", label: "Points fidélité x2", icon: Star, color: "text-purple-600 bg-purple-50" },
];

function genCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export default function Promotions() {
  const { grossisteId, authFetch } = useGrossiste();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    code: genCode(), titre: "", description: "", type: "remise_pct",
    valeur: "10", minCommande: "0", usagesMax: "", dateDebut: "", dateFin: "",
  });

  const { data: promos, isLoading } = useQuery({
    queryKey: ["promotions", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/promotions`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => authFetch(`/api/grossistes/${grossisteId}/promotions`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
      setShowForm(false);
      setForm({ code: genCode(), titre: "", description: "", type: "remise_pct", valeur: "10", minCommande: "0", usagesMax: "", dateDebut: "", dateFin: "" });
      toast({ title: "Promotion créée !" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, actif }: any) => authFetch(`/api/grossistes/${grossisteId}/promotions/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ actif }),
    }).then(r => r.json()),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["promotions"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => authFetch(`/api/grossistes/${grossisteId}/promotions/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["promotions"] });
      toast({ title: "Promotion supprimée" });
    },
  });

  const liste: any[] = promos || [];
  const actives = liste.filter(p => p.actif);
  const inactives = liste.filter(p => !p.actif);

  const getTypeInfo = (type: string) => TYPES.find(t => t.id === type) || TYPES[0];

  return (
    <div className="space-y-6">
      <PageHeader title="Codes Promo & Remises" subtitle="Créez et gérez vos offres promotionnelles" icon={<Tag className="w-5 h-5" />}>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Nouvelle promotion
        </button>
      </PageHeader>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total promotions", value: liste.length, color: "text-slate-700", bg: "bg-slate-50" },
          { label: "Actives", value: actives.length, color: "text-emerald-700", bg: "bg-emerald-50" },
          { label: "Utilisations totales", value: liste.reduce((s, p) => s + (p.usagesActuels || 0), 0), color: "text-orange-700", bg: "bg-orange-50" },
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-slate-800 text-lg mb-5">Nouvelle promotion</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Code promo</label>
                  <div className="flex gap-2">
                    <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono uppercase" />
                    <button onClick={() => setForm(f => ({ ...f, code: genCode() }))}
                      className="px-3 py-2 bg-slate-100 rounded-lg text-xs font-medium hover:bg-slate-200">↻</button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Titre</label>
                  <input value={form.titre} onChange={e => setForm(f => ({ ...f, titre: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" placeholder="Ex: Promo ramadan" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-2 block">Type de remise</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map(t => (
                    <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 text-sm font-medium transition ${form.type === t.id ? "border-primary bg-primary/5" : "border-slate-200 hover:border-slate-300"}`}>
                      <t.icon className="w-4 h-4" /> {t.label}
                    </button>
                  ))}
                </div>
              </div>
              {(form.type === "remise_pct" || form.type === "remise_fixe") && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Valeur {form.type === "remise_pct" ? "(%)" : "(FCFA)"}</label>
                    <input type="number" value={form.valeur} onChange={e => setForm(f => ({ ...f, valeur: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 mb-1 block">Commande min. (FCFA)</label>
                    <input type="number" value={form.minCommande} onChange={e => setForm(f => ({ ...f, minCommande: e.target.value }))}
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Usages max</label>
                  <input type="number" value={form.usagesMax} onChange={e => setForm(f => ({ ...f, usagesMax: e.target.value }))}
                    placeholder="Illimité" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Date de fin</label>
                  <input type="date" value={form.dateFin} onChange={e => setForm(f => ({ ...f, dateFin: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Description (optionnel)</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-slate-600">Annuler</button>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.code || !form.titre || createMutation.isPending}
                className="flex-1 bg-primary text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
              >{createMutation.isPending ? "Création..." : "Créer la promotion"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Promo list */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-10 text-center text-slate-400">Chargement...</div>
      ) : (
        <div className="space-y-3">
          {liste.length === 0 && (
            <div className="bg-white rounded-xl p-10 text-center text-slate-400">
              <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucune promotion créée</p>
            </div>
          )}
          {liste.map((p: any) => {
            const typeInfo = getTypeInfo(p.type);
            return (
              <div key={p.id} className={`bg-white rounded-xl border shadow-sm p-5 transition ${!p.actif ? "opacity-60" : "border-slate-100"}`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${typeInfo.color.split(" ")[1]} flex items-center justify-center`}>
                      <typeInfo.icon className={`w-5 h-5 ${typeInfo.color.split(" ")[0]}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-slate-800 text-sm bg-slate-100 px-2 py-0.5 rounded">{p.code}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.actif ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                          {p.actif ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 mt-0.5">{p.titre}</p>
                      <p className="text-xs text-slate-500">
                        {p.type === "remise_pct" ? `${p.valeur}% de remise` :
                         p.type === "remise_fixe" ? `${formatFCFA(parseFloat(p.valeur || "0"))} de remise` :
                         p.type === "livraison_offerte" ? "Livraison offerte" : "Points x2"}
                        {p.minCommande && parseFloat(p.minCommande) > 0 ? ` · Min ${formatFCFA(parseFloat(p.minCommande))}` : ""}
                        {p.dateFin ? ` · Expire ${new Date(p.dateFin).toLocaleDateString("fr-FR")}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">{p.usagesActuels || 0} / {p.usagesMax || "∞"}</p>
                      <p className="text-xs text-slate-400">utilisations</p>
                    </div>
                    <button onClick={() => toggleMutation.mutate({ id: p.id, actif: !p.actif })} className="text-slate-400 hover:text-primary transition">
                      {p.actif ? <ToggleRight className="w-8 h-8 text-primary" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                    <button onClick={() => deleteMutation.mutate(p.id)} className="text-slate-300 hover:text-rose-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
