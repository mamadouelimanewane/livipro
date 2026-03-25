import { useState } from "react";
import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { Warehouse, Plus, MapPin, Phone, User, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Depots() {
  const { grossisteId, authFetch } = useGrossiste();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editDepot, setEditDepot] = useState<any>(null);
  const [form, setForm] = useState({ nom: "", adresse: "", ville: "Dakar", responsable: "", telephone: "", lat: "", lng: "" });

  const { data: depots, isLoading } = useQuery({
    queryKey: ["depots", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/depots`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => authFetch(`/api/grossistes/${grossisteId}/depots`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["depots"] });
      setShowForm(false);
      resetForm();
      toast({ title: "Dépôt créé !" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: any) => authFetch(`/api/grossistes/${grossisteId}/depots/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["depots"] });
      setEditDepot(null);
      toast({ title: "Dépôt mis à jour" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => authFetch(`/api/grossistes/${grossisteId}/depots/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["depots"] });
      toast({ title: "Dépôt désactivé" });
    },
  });

  const resetForm = () => setForm({ nom: "", adresse: "", ville: "Dakar", responsable: "", telephone: "", lat: "", lng: "" });
  const openEdit = (d: any) => {
    setForm({ nom: d.nom, adresse: d.adresse, ville: d.ville || "Dakar", responsable: d.responsable || "", telephone: d.telephone || "", lat: d.lat || "", lng: d.lng || "" });
    setEditDepot(d);
  };

  const isOpen = showForm || !!editDepot;
  const handleSubmit = () => {
    if (editDepot) updateMutation.mutate({ id: editDepot.id, ...form });
    else createMutation.mutate(form);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Gestion des Dépôts" subtitle="Gérez vos entrepôts et points de distribution" icon={<Warehouse className="w-5 h-5" />}>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus className="w-4 h-4" /> Nouveau dépôt
        </button>
      </PageHeader>

      {/* Form modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-bold text-slate-800 text-lg mb-4">{editDepot ? "Modifier le dépôt" : "Nouveau dépôt"}</h3>
            <div className="space-y-4">
              {[
                { label: "Nom du dépôt", key: "nom", placeholder: "Ex: Entrepôt Nord" },
                { label: "Adresse", key: "adresse", placeholder: "Ex: Route de Rufisque" },
                { label: "Ville", key: "ville", placeholder: "Dakar" },
                { label: "Responsable", key: "responsable", placeholder: "Nom du responsable" },
                { label: "Téléphone", key: "telephone", placeholder: "+221 7X XXX XX XX" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">{label}</label>
                  <input value={(form as any)[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Latitude (optionnel)</label>
                  <input type="number" step="any" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                    placeholder="14.6937" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-600 mb-1 block">Longitude</label>
                  <input type="number" step="any" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                    placeholder="-17.4441" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => { setShowForm(false); setEditDepot(null); }} className="flex-1 border border-slate-200 rounded-lg py-2.5 text-sm font-medium text-slate-600">Annuler</button>
              <button
                onClick={handleSubmit}
                disabled={!form.nom || !form.adresse || createMutation.isPending || updateMutation.isPending}
                className="flex-1 bg-primary text-white rounded-lg py-2.5 text-sm font-medium disabled:opacity-50"
              >{(createMutation.isPending || updateMutation.isPending) ? "Enregistrement..." : "Enregistrer"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-10 text-center text-slate-400">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(depots || []).map((d: any) => (
            <div key={d.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Warehouse className="w-6 h-6 text-primary" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(d)} className="text-slate-400 hover:text-primary transition">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMutation.mutate(d.id)} className="text-slate-300 hover:text-rose-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{d.nom}</h3>
              <div className="space-y-1.5 mt-3">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {d.adresse}, {d.ville}
                </div>
                {d.responsable && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <User className="w-3.5 h-3.5 text-slate-400" /> {d.responsable}
                  </div>
                )}
                {d.telephone && (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {d.telephone}
                  </div>
                )}
                {d.lat && d.lng && (
                  <div className="flex items-center gap-2 text-xs text-emerald-600">
                    <CheckCircle2 className="w-3.5 h-3.5" /> GPS configuré
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
