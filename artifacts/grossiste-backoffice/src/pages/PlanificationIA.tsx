import { useState, useEffect, useRef } from "react";
import { useGrossiste } from "@/context/GrossisteContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/PageHeader";
import { formatFCFA } from "@/lib/utils";
import { Brain, Zap, MapPin, Truck, CheckCircle2, RefreshCw, Route, AlertTriangle, Navigation } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Haversine distance ────────────────────────────────────────────────────
function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── Seed positions for boutiques without GPS ─────────────────────────────
const SEED_POS: Record<number, [number, number]> = {};
function seedPos(id: number): [number, number] {
  if (SEED_POS[id]) return SEED_POS[id];
  const s1 = ((id * 7919) % 100) / 100;
  const s2 = ((id * 6271) % 100) / 100;
  SEED_POS[id] = [14.6937 + (s1 - 0.5) * 0.08, -17.4441 + (s2 - 0.5) * 0.12];
  return SEED_POS[id];
}

const DEPOT_POS: [number, number] = [14.6937, -17.4441];

// ─── Nearest-neighbor TSP ────────────────────────────────────────────────
function optimizeRoute(boutiques: any[]) {
  if (boutiques.length <= 1) return boutiques;
  const withGeo = boutiques.map((b) => ({
    ...b,
    _lat: b.lat ? parseFloat(b.lat) : seedPos(b.id)[0],
    _lng: b.lng ? parseFloat(b.lng) : seedPos(b.id)[1],
  }));
  const visited = new Set<number>();
  const route: any[] = [];
  let current = { lat: DEPOT_POS[0], lng: DEPOT_POS[1] };

  while (visited.size < withGeo.length) {
    let nearest: any = null;
    let minDist = Infinity;
    for (const b of withGeo) {
      if (visited.has(b.id)) continue;
      const d = distanceKm(current.lat, current.lng, b._lat, b._lng);
      if (d < minDist) { minDist = d; nearest = b; }
    }
    if (nearest) {
      route.push({ ...nearest, distance: minDist });
      visited.add(nearest.id);
      current = { lat: nearest._lat, lng: nearest._lng };
    }
  }
  return route;
}

// ─── Route Map Component ─────────────────────────────────────────────────
function RouteMap({ optimized }: { optimized: any[] }) {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const lRef = useRef<any>(null);

  useEffect(() => {
    if (!mapDivRef.current) return;
    let destroyed = false;

    import("leaflet").then(async (LModule) => {
      if (destroyed) return;
      try { await import("leaflet/dist/leaflet.css"); } catch {}
      const L = LModule.default || LModule;
      lRef.current = L;

      if (!mapRef.current) {
        const map = L.map(mapDivRef.current!, { zoomControl: true, attributionControl: false })
          .setView(DEPOT_POS, 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19 }).addTo(map);
        mapRef.current = map;
      }

      drawRoute(L, mapRef.current);
    }).catch(() => {});

    return () => { destroyed = true; };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !lRef.current) return;
    drawRoute(lRef.current, mapRef.current);
  }, [optimized]);

  function drawRoute(L: any, map: any) {
    // Clear existing
    map.eachLayer((layer: any) => {
      if (layer._isRouteLayer) layer.remove();
    });

    if (optimized.length === 0) return;

    const coords: [number, number][] = [DEPOT_POS];
    optimized.forEach((b) => {
      const pos: [number, number] = [b._lat ?? seedPos(b.id)[0], b._lng ?? seedPos(b.id)[1]];
      coords.push(pos);
    });
    // Return to depot
    coords.push(DEPOT_POS);

    // Draw the route line
    const line = L.polyline(coords, { color: "#f97316", weight: 3, opacity: 0.8, dashArray: "6 4" });
    (line as any)._isRouteLayer = true;
    line.addTo(map);

    // Depot marker
    const depotIcon = L.divIcon({
      className: "",
      html: `<div style="
        width:36px;height:36px;background:#10b981;border-radius:10px;
        border:3px solid #fff;box-shadow:0 3px 10px #10b98160;
        display:flex;align-items:center;justify-content:center;font-size:16px
      ">🏭</div>`,
      iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -20],
    });
    const depotM = L.marker(DEPOT_POS, { icon: depotIcon });
    (depotM as any)._isRouteLayer = true;
    depotM.bindPopup(`<b>Dépôt</b> — Point de départ`).addTo(map);

    // Stop markers
    optimized.forEach((b, i) => {
      const pos: [number, number] = [b._lat ?? seedPos(b.id)[0], b._lng ?? seedPos(b.id)[1]];
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:34px;height:34px;background:#f97316;border-radius:50%;
          border:3px solid #fff;box-shadow:0 3px 10px #f9731660;
          display:flex;align-items:center;justify-content:center;
          font-size:13px;font-weight:800;color:#fff
        ">${i + 1}</div>`,
        iconSize: [34, 34], iconAnchor: [17, 17], popupAnchor: [0, -18],
      });
      const m = L.marker(pos, { icon });
      (m as any)._isRouteLayer = true;
      m.bindPopup(`
        <div style="font-family:system-ui;padding:4px">
          <b style="font-size:13px">${i + 1}. ${b.nom}</b><br/>
          <span style="color:#64748b;font-size:11px">${b.adresse || "Dakar"}</span>
          ${b.distance ? `<br/><span style="color:#f97316;font-size:11px;font-weight:600">+${b.distance.toFixed(1)}km depuis l'arrêt précédent</span>` : ""}
        </div>
      `).addTo(map);
    });

    // Fit bounds
    try { map.fitBounds(L.polyline(coords).getBounds(), { padding: [20, 20] }); } catch {}
  }

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Navigation className="w-4 h-4 text-primary" />
          <span className="font-bold text-sm text-slate-700">Visualisation de la route optimisée</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Dépôt</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-primary inline-block" /> Arrêts</span>
        </div>
      </div>
      <div ref={mapDivRef} style={{ width: "100%", height: 260 }} />
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
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
      toast({ title: "Optimisation IA terminée", description: `${selectedB.length} arrêts ordonnancés par algorithme nearest-neighbor` });
    }, 1200);
  };

  const totalDist = optimized.reduce((s, b) => s + (b.distance || 0), 0);
  const estimDuree = Math.round(totalDist / 30 * 60) + optimized.length * 10;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Planification IA"
        description="Optimisation automatique des tournées — algorithme nearest-neighbor"
        action={
          <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <Brain className="w-3.5 h-3.5 text-primary" />
            Algorithme nearest-neighbor (TSP approximation)
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── LEFT: Configuration ── */}
        <div className="space-y-4">
          {/* Params */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="font-bold text-slate-800 mb-4">Paramètres de tournée</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Date de tournée</label>
                <input
                  type="date"
                  value={dateT}
                  onChange={e => setDateT(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 mb-1.5 block">Livreur disponible</label>
                <select
                  value={chauffeurId}
                  onChange={e => setChauffeurId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/30 outline-none"
                >
                  <option value="">Sélectionner un livreur</option>
                  {chauffeursListe.map(c => (
                    <option key={c.id} value={c.id}>{c.prenom} {c.nom}</option>
                  ))}
                </select>
                {chauffeursIndispo.length > 0 && (
                  <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> {chauffeursIndispo.length} livreur(s) en congé ce jour
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Boutique selection */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800">
                Boutiques à livrer
                {selected.length > 0 && (
                  <span className="ml-2 bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                    {selected.length} sélectionnée{selected.length > 1 ? "s" : ""}
                  </span>
                )}
              </h3>
              <div className="flex gap-2">
                <button onClick={() => setSelected(boutiquesListe.map(b => b.id))} className="text-xs text-primary font-medium hover:underline">Tout</button>
                <span className="text-slate-300">|</span>
                <button onClick={() => setSelected([])} className="text-xs text-slate-500 font-medium hover:underline">Aucun</button>
              </div>
            </div>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {boutiquesListe.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-sm">Aucune boutique disponible</div>
              ) : boutiquesListe.map((b: any) => (
                <label
                  key={b.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selected.includes(b.id)
                      ? "border-primary bg-primary/5"
                      : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(b.id)}
                    onChange={() => toggle(b.id)}
                    className="accent-primary w-4 h-4 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-800 text-sm truncate">{b.nom}</p>
                    <p className="text-xs text-slate-400 truncate">{b.adresse}</p>
                  </div>
                  <MapPin className={`w-3.5 h-3.5 flex-shrink-0 ${b.lat && b.lng ? "text-emerald-500" : "text-slate-200"}`} />
                </label>
              ))}
            </div>

            <button
              onClick={runOptimization}
              disabled={selected.length < 2 || loading}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-primary/90 disabled:opacity-50 transition-all shadow-sm shadow-primary/20"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {loading ? "Optimisation en cours..." : `Optimiser ${selected.length} arrêt${selected.length > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Results ── */}
        <div className="space-y-4">
          {optimized.length > 0 ? (
            <>
              {/* Stats */}
              <div className="bg-gradient-to-r from-primary to-orange-400 rounded-xl p-5 text-white shadow-lg shadow-primary/20">
                <div className="flex items-center gap-2 mb-4">
                  <Brain className="w-5 h-5" />
                  <h3 className="font-bold">Parcours optimisé</h3>
                  <div className="ml-auto text-xs bg-white/20 px-2 py-1 rounded-full">IA</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-2xl font-black">{optimized.length}</p>
                    <p className="text-xs opacity-80 mt-0.5">arrêts</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-2xl font-black">{totalDist.toFixed(0)}km</p>
                    <p className="text-xs opacity-80 mt-0.5">distance</p>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3">
                    <p className="text-2xl font-black">{Math.floor(estimDuree / 60)}h{estimDuree % 60 > 0 ? `${estimDuree % 60}` : ""}
                      <span className="text-sm">{estimDuree % 60 > 0 ? "m" : ""}</span>
                    </p>
                    <p className="text-xs opacity-80 mt-0.5">durée est.</p>
                  </div>
                </div>
              </div>

              {/* Map */}
              <RouteMap optimized={optimized} />

              {/* Ordered stops list */}
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                  <Route className="w-4 h-4 text-primary" /> Ordre de passage
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-2.5 bg-emerald-50 rounded-xl border border-emerald-100">
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">D</div>
                    <div>
                      <p className="text-sm font-bold text-emerald-700">Dépôt — Point de départ</p>
                      <p className="text-xs text-emerald-600">Dakar, Sénégal</p>
                    </div>
                  </div>

                  {optimized.map((b: any, i: number) => (
                    <div key={b.id} className="flex items-center gap-3 p-2.5 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{b.nom}</p>
                        <p className="text-xs text-slate-400 truncate">{b.adresse}</p>
                      </div>
                      {b.distance != null && (
                        <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">+{b.distance.toFixed(1)}km</span>
                      )}
                    </div>
                  ))}

                  <div className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">↩</div>
                    <p className="text-sm text-slate-500">Retour au dépôt</p>
                  </div>
                </div>

                <button
                  onClick={() => createTourneeMutation.mutate({
                    date: dateT,
                    chauffeurId: parseInt(chauffeurId),
                    livraisons: optimized.map((b: any, i: number) => ({
                      boutiqueId: b.id,
                      ordre: i + 1,
                      montantTotal: b.soldeCredit || "0",
                      methodePaiement: "especes",
                    })),
                  })}
                  disabled={!chauffeurId || createTourneeMutation.isPending}
                  className="mt-5 w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm shadow-emerald-200"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {createTourneeMutation.isPending ? "Création en cours..." : "Créer cette tournée"}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-slate-200 p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                <Brain className="w-8 h-8 text-primary/40" />
              </div>
              <p className="font-bold text-slate-600 mb-2">Prêt à optimiser</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Sélectionnez au moins 2 boutiques et lancez l'optimisation pour visualiser la route sur la carte
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
