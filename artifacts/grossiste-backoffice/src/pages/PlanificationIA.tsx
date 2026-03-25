import { useState } from "react";
import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { formatFCFA } from "@/lib/utils";
import { Brain, Zap, MapPin, Truck, CheckCircle2, RefreshCw, Route, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function optimizeRoute(boutiques: any[]) {
  if (boutiques.length <= 1) return boutiques;
  const withGeo = boutiques.filter(b => b.lat && b.lng);
  const withoutGeo = boutiques.filter(b => !b.lat || !b.lng);
  if (withGeo.length <= 1) return boutiques;
  const depot = { lat: 14.6937, lng: -17.4441 };
  const visited = new Set<number>();
  const route: any[] = [];
  let current = depot;
  while (visited.size < withGeo.length) {
    let nearest: any = null;
    let minDist = Infinity;
    for (const b of withGeo) {
      if (visited.has(b.id)) continue;
      const d = distanceKm(current.lat, current.lng, parseFloat(b.lat), parseFloat(b.lng));
      if (d < minDist) { minDist = d; nearest = b; }
    }
    if (nearest) { route.push({ ...nearest, distance: minDist }); visited.add(nearest.id); current = { lat: parseFloat(nearest.lat), lng: parseFloat(nearest.lng) }; }
  }
  return [...route, ...withoutGeo];
}

export default function PlanificationIA() {
  const { grossisteId, authFetch } = useGrossiste();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [selected, setSelected] = useState<number[]>([]);
  const [chauffeurId, setChauffeurId] = useState("");
  const [dateT, setDateT] = useState(new Date().toISOString().split("T")[0]);
  const [optimized, setOptimized] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const { data: boutiques } = useQuery({
    queryKey: ["boutiques", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/boutiques`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: chauffeurs } = useQuery({
    queryKey: ["chauffeurs", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/chauffeurs`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const { data: dispo } = useQuery({
    queryKey: ["disponibilites", grossisteId],
    queryFn: () => authFetch(`/api/grossistes/${grossisteId}/conges/disponibilites?date=${dateT}`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const createTourneeMutation = useMutation({
    mutationFn: (data: any) => authFetch(`/api/grossistes/${grossisteId}/tournees`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    }).then(r => r.json()),
    onSuccess: (t: any) => {
      qc.invalidateQueries({ queryKey: ["tournees"] });
      toast({ title: "Tournée créée !", description: `Tournée #${t.id} planifiée pour le ${dateT}` });
      setSelected([]);
      setOptimized([]);
    },
  });

  const chauffeursIndispo: number[] = dispo?.chauffeursIndisponibles || [];
  const boutiquesListe: any[] = boutiques || [];
  const chauffeursListe: any[] = (chauffeurs || []).filter((c: any) => !chauffeursIndispo.includes(c.id));

  const toggle = (id: number) => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const runOptimization = () => {
    setLoading(true);
    setTimeout(() => {
      const selectedB = boutiquesListe.filter(b => selected.includes(b.id));
      setOptimized(optimizeRoute(selectedB));
      setLoading(false);
      toast({ title: "Optimisation IA terminée", description: `${selectedB.length} arrêts ordonnancés` });
    }, 1200);
  };

  const totalDist = optimized.reduce((s, b) => s + (b.distance || 0), 0);
  const estimDuree = Math.round(totalDist / 30 * 60) + optimized.length * 10;

  return (
    <div className="space-y-6">
      <PageHeader title="Planification IA" subtitle="Optimisation automatique des tournées de livraison" icon={<Brain className="w-5 h-5" />} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">Paramètres de tournée</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Date de tournée</label>
                <input type="date" value={dateT} onChange={e => setDateT(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1 block">Livreur disponible</label>
                <select value={chauffeurId} onChange={e => setChauffeurId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                  <option value="">Sélectionner un livreur</option>
                  {chauffeursListe.map(c => <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>)}
                </select>
                {chauffeursIndispo.length > 0 && (
                  <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {chauffeursIndispo.length} livreur(s) en congé ce jour
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800">Boutiques à livrer</h3>
              <div className="flex gap-2">
                <button onClick={() => setSelected(boutiquesListe.map(b => b.id))} className="text-xs text-primary font-medium hover:underline">Tout</button>
                <span className="text-slate-300">|</span>
                <button onClick={() => setSelected([])} className="text-xs text-slate-500 font-medium hover:underline">Aucun</button>
              </div>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {boutiquesListe.map((b: any) => (
                <label key={b.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition ${selected.includes(b.id) ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200"}`}>
                  <input type="checkbox" checked={selected.includes(b.id)} onChange={() => toggle(b.id)} className="accent-primary w-4 h-4" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{b.nom}</p>
                    <p className="text-xs text-slate-400 truncate">{b.adresse}</p>
                  </div>
                  {b.lat && b.lng ? <MapPin className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" /> : <MapPin className="w-3.5 h-3.5 text-slate-200 flex-shrink-0" />}
                </label>
              ))}
            </div>
            <button
              onClick={runOptimization}
              disabled={selected.length === 0 || loading}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-lg font-medium text-sm hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {loading ? "Optimisation en cours..." : `Optimiser ${selected.length} arrêt(s)`}
            </button>
          </div>
        </div>

        {/* Result */}
        <div className="space-y-4">
          {optimized.length > 0 ? (
            <>
              <div className="bg-gradient-to-r from-primary to-orange-400 rounded-xl p-5 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="w-5 h-5" />
                  <h3 className="font-bold">Parcours optimisé</h3>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-2xl font-bold">{optimized.length}</p>
                    <p className="text-xs opacity-80">arrêts</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totalDist.toFixed(0)}km</p>
                    <p className="text-xs opacity-80">estimé</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.floor(estimDuree / 60)}h{estimDuree % 60 > 0 ? `${estimDuree % 60}m` : ""}</p>
                    <p className="text-xs opacity-80">durée</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Route className="w-4 h-4 text-primary" /> Ordre de passage</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 bg-emerald-50 rounded-lg">
                    <div className="w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">D</div>
                    <p className="text-sm font-medium text-emerald-700">Dépôt (point de départ)</p>
                  </div>
                  {optimized.map((b: any, i: number) => (
                    <div key={b.id} className="flex items-center gap-3 p-2.5 border border-slate-100 rounded-lg hover:bg-slate-50">
                      <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold">{i + 1}</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-800">{b.nom}</p>
                        <p className="text-xs text-slate-400">{b.adresse}</p>
                      </div>
                      {b.distance && <span className="text-xs text-slate-400">{b.distance.toFixed(1)}km</span>}
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => createTourneeMutation.mutate({
                    date: dateT,
                    chauffeurId: parseInt(chauffeurId),
                    livraisons: optimized.map((b: any, i: number) => ({ boutiqueId: b.id, ordre: i + 1, montantTotal: b.soldeCredit || "0", methodePaiement: "especes" })),
                  })}
                  disabled={!chauffeurId || createTourneeMutation.isPending}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-lg font-medium text-sm hover:bg-emerald-700 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {createTourneeMutation.isPending ? "Création..." : "Créer cette tournée"}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
              <Brain className="w-12 h-12 mx-auto text-slate-200 mb-4" />
              <p className="font-medium text-slate-500">Sélectionnez des boutiques et lancez l'optimisation</p>
              <p className="text-xs text-slate-400 mt-2">L'algorithme calcule le chemin le plus court en partant du dépôt</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
