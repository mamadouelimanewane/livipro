import { useState } from "react";
import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { CalendarOff, Plus, CheckCircle, XCircle, Clock, Trash2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const TYPES = [
  { id: "conge", label: "Congé payé", color: "text-blue-700 bg-blue-50 border-blue-200" },
  { id: "maladie", label: "Maladie", color: "text-rose-700 bg-rose-50 border-rose-200" },
  { id: "formation", label: "Formation", color: "text-purple-700 bg-purple-50 border-purple-200" },
  { id: "absence", label: "Absence", color: "text-amber-700 bg-amber-50 border-amber-200" },
];

function nbJours(debut: string, fin: string) {
  const d1 = new Date(debut), d2 = new Date(fin);
  return Math.max(1, Math.ceil((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)) + 1);
}

export default function Conges() {
  const { grossisteId, authFetch } = useGrossiste();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ chauffeurId: "", type: "conge", dateDebut: "", dateFin: "", motif: "" });

  const { data: conges, isLoading } = useQuery({
    queryKey: ["conges", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/conges`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: chauffeurs } = useQuery({
    queryKey: ["chauffeurs", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/chauffeurs`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: dispo } = useQuery({
    queryKey: ["disponibilites", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/conges/disponibilites`).then(r => r.json()),
    enabled: !!grossisteId,
    refetchInterval: 60000,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => authFetch(`/api/grossistes/${grossisteId}/conges`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conges"] });
      qc.invalidateQueries({ queryKey: ["disponibilites"] });
      setShowForm(false);
      setForm({ chauffeurId: "", type: "conge", dateDebut: "", dateFin: "", motif: "" });
      toast({ title: "Congé enregistré" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => authFetch(`/api/grossistes/${grossisteId}/conges/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["conges"] });
      qc.invalidateQueries({ queryKey: ["disponibilites"] });
      toast({ title: "Congé annulé" });
    },
  });

  const liste: any[] = conges || [];
  const chauffeursIndispo: number[] = dispo?.chauffeursIndisponibles || [];
  const chauffeursListe: any[] = chauffeurs || [];
  const nbIndispo = chauffeursIndispo.length;

  return (
    <div className="space-y-6">
      <PageHeader title="Congés & Absences" subtitle="Gérez les disponibilités de vos livreurs" icon={<CalendarOff className="w-5 h-5" />}>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Déclarer un congé
        </button>
      </PageHeader>

      {/* Alert disponibilités aujourd'hui */}
      {nbIndispo > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800 font-medium">
            {nbIndispo} livreur{nbIndispo > 1 ? "s" : ""} indisponible{nbIndispo > 1 ? "s" : ""} aujourd'hui.
            Vérifiez avant d'assigner des tournées.
          </p>
        </div>
      )}

      {/* Disponibilités */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h3 className="font-bold text-slate-800 mb-4">Disponibilités aujourd'hui</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {chauffeursListe.map((c: any) => {
            const indispo = chauffeursIndispo.includes(c.id);
            return (
              <div key={c.id} className={`rounded-lg px-3 py-2 border text-center text-xs font-medium ${indispo ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
                {indispo ? <XCircle className="w-3.5 h-3.5 mx-auto mb-1" /> : <CheckCircle className="w-3.5 h-3.5 mx-auto mb-1" />}
                {c.prenom} {c.nom}
              </div>
            );
          })}
          {chauffeursListe.length === 0 && <p className="text-slate-400 text-sm col-span-full">Aucun livreur</p>}
        </div>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-4">Déclarer un congé / absence</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Livreur</label>
                <select value={form.chauffeurId} onChange={e => setForm(f => ({ ...f, chauffeurId: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Sélectionner un livreur</option>
                  {chauffeursListe.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-2 block">Type</label>
                <div className="grid grid-cols-2 gap-2">
                  {TYPES.map(t => (
                    <button key={t.id} onClick={() => setForm(f => ({ ...f, type: t.id }))}
                      className={`py-2 px-3 rounded-lg border-2 text-xs font-medium transition ${form.type === t.id ? "border-primary bg-primary/5 text-primary" : "border-slate-200 text-slate-600"}`}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Début</label>
                  <input type="date" value={form.dateDebut} onChange={e => setForm(f => ({ ...f, dateDebut: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Fin</label>
                  <input type="date" value={form.dateFin} onChange={e => setForm(f => ({ ...f, dateFin: e.target.value }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              {form.dateDebut && form.dateFin && (
                <p className="text-xs text-slate-500 text-center font-medium">{nbJours(form.dateDebut, form.dateFin)} jour(s)</p>
              )}
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Motif (optionnel)</label>
                <textarea value={form.motif} onChange={e => setForm(f => ({ ...f, motif: e.target.value }))}
                  rows={2} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-none" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-slate-600">Annuler</button>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.chauffeurId || !form.dateDebut || !form.dateFin || createMutation.isPending}
                className="flex-1 bg-primary text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
              >{createMutation.isPending ? "Enregistrement..." : "Enregistrer"}</button>
            </div>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-white rounded-xl p-10 text-center text-slate-400">Chargement...</div>
        ) : liste.length === 0 ? (
          <div className="bg-white rounded-xl p-10 text-center text-slate-400">
            <CalendarOff className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Aucun congé enregistré</p>
          </div>
        ) : liste.map((c: any) => {
          const type = TYPES.find(t => t.id === c.type) || TYPES[0];
          const jours = nbJours(c.dateDebut, c.dateFin);
          return (
            <div key={c.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${type.color}`}>{type.label}</span>
                <div>
                  <p className="font-semibold text-slate-800">{c.chauffeur?.prenom} {c.chauffeur?.nom}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(c.dateDebut).toLocaleDateString("fr-FR")} → {new Date(c.dateFin).toLocaleDateString("fr-FR")}
                    <span className="ml-2 font-medium">{jours}j</span>
                  </p>
                  {c.motif && <p className="text-xs text-slate-400 mt-0.5">{c.motif}</p>}
                </div>
              </div>
              <button onClick={() => deleteMutation.mutate(c.id)} className="text-slate-300 hover:text-rose-500 transition ml-4">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
