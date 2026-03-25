import { useEffect, useRef, useState, useCallback } from "react";
import { useChauffeurs } from "@/hooks/use-chauffeurs";
import { useTournees } from "@/hooks/use-tournees";
import { useBoutiques } from "@/hooks/use-boutiques";
import { useGrossiste } from "@/context/GrossisteContext";
import { StatusBadge } from "@/components/StatusBadge";
import { formatFCFA } from "@/lib/utils";
import {
  MapPin, Truck, RefreshCw, Users, Navigation, Locate,
  Maximize2, Minimize2, Search, X, Info, Route
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Seed GPS positions (Dakar zone) ────────────────────────────────────────
const SEED_POS: Record<number, [number, number]> = {};
function seedPos(id: number): [number, number] {
  if (SEED_POS[id]) return SEED_POS[id];
  const s1 = ((id * 7919) % 100) / 100;
  const s2 = ((id * 6271) % 100) / 100;
  SEED_POS[id] = [14.6928 + (s1 - 0.5) * 0.1, -17.4467 + (s2 - 0.5) * 0.14];
  return SEED_POS[id];
}

// Simulate live GPS drift for chauffeurs
function livePos(id: number): [number, number] {
  const base = seedPos(id);
  const t = Date.now();
  return [
    base[0] + Math.sin(t / 28000 + id) * 0.004,
    base[1] + Math.cos(t / 23000 + id) * 0.004,
  ];
}

// ─── Constants ────────────────────────────────────────────────────────────────
const DAKAR_CENTER: [number, number] = [14.6928, -17.4467];
const CHAUFFEUR_COLORS = ["#f97316", "#3b82f6", "#a855f7", "#ec4899", "#14b8a6", "#f59e0b", "#10b981"];

export default function Carte() {
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const lRef = useRef<any>(null); // Store Leaflet module
  const layersRef = useRef<any[]>([]);
  const routeLinesRef = useRef<any[]>([]);
  const userLocMarkerRef = useRef<any>(null);
  const intervalRef = useRef<any>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedChauffeur, setSelectedChauffeur] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [showRoutes, setShowRoutes] = useState(true);
  const [locating, setLocating] = useState(false);

  const { grossisteId } = useGrossiste();
  const { data: chauffeurs } = useChauffeurs();
  const { data: tournees } = useTournees();
  const { data: boutiques } = useBoutiques();

  const getActiveTournee = (chauffeurId: number) =>
    (tournees || []).find((t: any) =>
      t.chauffeurId === chauffeurId && (t.statut === "en_cours" || t.statut === "planifiee")
    );

  // ─── Clear all layers ──────────────────────────────────────────────────────
  const clearLayers = () => {
    layersRef.current.forEach((l) => { try { l.remove(); } catch {} });
    layersRef.current = [];
    routeLinesRef.current.forEach((l) => { try { l.remove(); } catch {} });
    routeLinesRef.current = [];
  };

  // ─── Draw all markers + routes ─────────────────────────────────────────────
  const drawMarkers = useCallback(() => {
    if (!mapRef.current || !lRef.current) return;
    const L = lRef.current;
    const map = mapRef.current;

    clearLayers();

    const boutiquesArr = boutiques || [];
    const chauffeursArr = chauffeurs || [];

    // ── Boutique markers ──
    boutiquesArr.forEach((b: any) => {
      const pos = seedPos(b.id + 5000);
      const icon = L.divIcon({
        className: "",
        html: `<div style="
          width:28px;height:28px;background:#3b82f6;border-radius:8px;
          display:flex;align-items:center;justify-content:center;font-size:14px;
          border:2px solid #fff;box-shadow:0 2px 8px #3b82f640;cursor:pointer;
        ">🏪</div>`,
        iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -16],
      });
      const marker = L.marker(pos, { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:170px;padding:4px">
          <div style="font-weight:800;font-size:14px;margin-bottom:4px">🏪 ${b.nom}</div>
          <div style="color:#64748b;font-size:12px;margin-bottom:4px">📍 ${b.adresse || "Dakar"}</div>
          <div style="color:#64748b;font-size:12px">👤 ${b.proprietaire || "—"}</div>
          ${b.telephone ? `<div style="color:#64748b;font-size:12px;margin-top:2px">📱 ${b.telephone}</div>` : ""}
        </div>
      `);
      layersRef.current.push(marker);
    });

    // ── Chauffeur markers + route polylines ──
    chauffeursArr.forEach((c: any, idx: number) => {
      const color = CHAUFFEUR_COLORS[idx % CHAUFFEUR_COLORS.length];
      const pos = livePos(c.id);
      const activeTournee = getActiveTournee(c.id);
      const isEnTournee = c.statut === "en_tournee" || !!activeTournee;
      const isSelected = selectedChauffeur?.id === c.id;

      const size = isSelected ? 54 : 44;
      const pulseAnim = isEnTournee
        ? `@keyframes cp_pulse_${c.id}{0%,100%{box-shadow:0 0 0 0 ${color}66}50%{box-shadow:0 0 0 10px ${color}00}}
           animation:cp_pulse_${c.id} 2s ease-in-out infinite;`
        : "";

      const icon = L.divIcon({
        className: "",
        html: `
          <style>${pulseAnim}</style>
          <div style="position:relative;width:${size}px;height:${size}px">
            <div style="
              width:${size}px;height:${size}px;background:${color};border-radius:50%;
              border:${isSelected ? 4 : 3}px solid #fff;
              display:flex;align-items:center;justify-content:center;
              font-size:${isSelected ? 22 : 18}px;cursor:pointer;
              box-shadow:0 4px 16px ${color}60;
              ${pulseAnim ? `animation:cp_pulse_${c.id} 2s ease-in-out infinite;` : ""}
            ">${isEnTournee ? "🚚" : "👤"}</div>
            ${isEnTournee
              ? `<div style="position:absolute;top:-3px;right:-3px;width:14px;height:14px;
                   background:#ef4444;border-radius:50%;border:2px solid #fff;
                   display:flex;align-items:center;justify-content:center;font-size:7px;color:#fff;font-weight:700">●</div>`
              : ""}
            <div style="
              position:absolute;top:${size + 4}px;left:50%;transform:translateX(-50%);
              background:#0f172a;color:#fff;font-size:10px;font-weight:700;
              padding:2px 7px;border-radius:8px;white-space:nowrap;
              border:1px solid #334155;pointer-events:none;
            ">${c.prenom} ${c.nom.charAt(0)}.</div>
          </div>`,
        iconSize: [size, size], iconAnchor: [size / 2, size / 2], popupAnchor: [0, -size / 2 - 8],
      });

      const marker = L.marker(pos, { icon, zIndexOffset: isSelected ? 1000 : 0 }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:200px;padding:4px">
          <div style="font-weight:800;font-size:15px;margin-bottom:8px">
            ${c.prenom} ${c.nom}
          </div>
          <div style="
            display:inline-flex;align-items:center;gap:6px;
            background:${color}18;color:${color};border-radius:8px;
            padding:4px 10px;font-size:13px;font-weight:700;margin-bottom:8px
          ">
            ${isEnTournee ? "🚚 En tournée" : c.statut === "disponible" ? "✓ Disponible" : "○ Inactif"}
          </div>
          ${activeTournee ? `
            <div style="background:#f8fafc;border-radius:8px;padding:8px;font-size:12px;color:#334155">
              <div>📦 <b>${activeTournee.nombreArrets}</b> arrêts</div>
              <div>💰 <b>${Number(activeTournee.totalLivraisons || 0).toLocaleString("fr-FR")} FCFA</b></div>
              <div style="color:#64748b;margin-top:4px">Tournée #${activeTournee.id} — ${activeTournee.date}</div>
            </div>
          ` : ""}
          <div style="margin-top:8px;color:#94a3b8;font-size:11px">📱 ${c.telephone}</div>
        </div>
      `);

      marker.on("click", () => {
        setSelectedChauffeur((prev: any) => prev?.id === c.id ? null : c);
        map.panTo(pos, { animate: true });
      });

      layersRef.current.push(marker);

      // ── Draw route polyline for this chauffeur if they have an active tournée ──
      if (showRoutes && isEnTournee && boutiquesArr.length > 0) {
        // Simulate route: pick ~4-5 boutiques as this chauffeur's stops
        const seed = c.id;
        const stopsCount = Math.min(boutiquesArr.length, 3 + (seed % 3));
        const routeBoutiques = boutiquesArr
          .slice((seed * 2) % boutiquesArr.length)
          .concat(boutiquesArr.slice(0, (seed * 2) % boutiquesArr.length))
          .slice(0, stopsCount);

        const routeCoords: [number, number][] = [pos, ...routeBoutiques.map((b: any) => seedPos(b.id + 5000))];

        // Dashed line (planned route)
        const plannedLine = L.polyline(routeCoords, {
          color,
          weight: 2.5,
          opacity: 0.6,
          dashArray: "8 5",
        }).addTo(map);
        routeLinesRef.current.push(plannedLine);

        // Solid line for completed stops (first 1-2)
        if (routeCoords.length >= 2) {
          const completedLine = L.polyline(routeCoords.slice(0, 2), {
            color,
            weight: 3.5,
            opacity: 0.9,
          }).addTo(map);
          routeLinesRef.current.push(completedLine);
        }

        // Depot origin marker
        const depotIcon = L.divIcon({
          className: "",
          html: `<div style="width:22px;height:22px;background:${color};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;border:2px solid #fff;box-shadow:0 2px 6px ${color}50">🏭</div>`,
          iconSize: [22, 22], iconAnchor: [11, 11],
        });
        const depotMarker = L.marker(pos, { icon: depotIcon }).addTo(map);
        routeLinesRef.current.push(depotMarker);
      }
    });

    setLastUpdate(new Date());
  }, [chauffeurs, boutiques, tournees, showRoutes, selectedChauffeur]);

  // ─── Init map ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapDivRef.current || mapRef.current) return;
    let destroyed = false;

    import("leaflet").then(async (LModule) => {
      if (destroyed) return;
      try { await import("leaflet/dist/leaflet.css"); } catch {}
      const L = LModule.default || LModule;
      lRef.current = L;

      const map = L.map(mapDivRef.current!, {
        zoomControl: true,
        attributionControl: true,
        maxZoom: 19,
      }).setView(DAKAR_CENTER, 13);

      // OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      setIsLoading(false);
    }).catch(() => setIsLoading(false));

    return () => {
      destroyed = true;
      clearInterval(intervalRef.current);
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // ─── Draw markers when data loads ────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || !lRef.current || isLoading) return;
    drawMarkers();

    // Auto-refresh every 12s
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(drawMarkers, 12000);
    return () => clearInterval(intervalRef.current);
  }, [drawMarkers, isLoading]);

  // ─── Geolocation ─────────────────────────────────────────────────────────
  const handleLocate = () => {
    if (!mapRef.current || !lRef.current) return;
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        const L = lRef.current;
        const map = mapRef.current;
        const coord: [number, number] = [pos.coords.latitude, pos.coords.longitude];

        if (userLocMarkerRef.current) { userLocMarkerRef.current.remove(); }
        const icon = L.divIcon({
          className: "",
          html: `<div style="width:18px;height:18px;background:#3b82f6;border-radius:50%;border:3px solid #fff;box-shadow:0 0 0 6px #3b82f640"></div>`,
          iconSize: [18, 18], iconAnchor: [9, 9],
        });
        userLocMarkerRef.current = L.marker(coord, { icon }).addTo(map);
        userLocMarkerRef.current.bindPopup("📍 Votre position").openPopup();
        map.flyTo(coord, 15, { animate: true, duration: 1.2 });
        setLocating(false);
      },
      () => {
        // Fallback: center on Dakar
        mapRef.current?.flyTo(DAKAR_CENTER, 13, { animate: true, duration: 1.2 });
        setLocating(false);
      },
      { timeout: 6000 }
    );
  };

  // ─── Center on chauffeur ──────────────────────────────────────────────────
  const centerOnChauffeur = (c: any) => {
    if (!mapRef.current) return;
    const pos = livePos(c.id);
    mapRef.current.flyTo(pos, 16, { animate: true, duration: 0.8 });
    setSelectedChauffeur(c);
  };

  // ─── Fullscreen toggle ────────────────────────────────────────────────────
  const toggleFullscreen = () => {
    setIsFullscreen((f) => !f);
    setTimeout(() => mapRef.current?.invalidateSize(), 200);
  };

  // ─── Search filter ────────────────────────────────────────────────────────
  const filteredChauffeurs = (chauffeurs || []).filter(
    (c: any) =>
      !search ||
      `${c.prenom} ${c.nom}`.toLowerCase().includes(search.toLowerCase()) ||
      c.telephone?.includes(search)
  );

  const activeChauffeurs = (chauffeurs || []).filter((c: any) => c.statut === "en_tournee");
  const disponibles = (chauffeurs || []).filter((c: any) => c.statut === "disponible");

  return (
    <div className={cn("transition-all duration-300", isFullscreen && "fixed inset-0 z-50 bg-background p-4")}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" /> Carte en Temps Réel
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Suivi GPS des chauffeurs et boutiques — mise à jour toutes les 12s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRoutes((r) => !r)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all",
              showRoutes ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            )}
          >
            <Route className="w-4 h-4" />
            Routes
          </button>
          <button
            onClick={() => { drawMarkers(); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Actualiser
          </button>
          <button
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 text-sm font-medium transition-all"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3 mb-5">
        {[
          { label: "En tournée", value: activeChauffeurs.length, icon: Truck, color: "text-primary", bg: "bg-orange-50" },
          { label: "Disponibles", value: disponibles.length, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Boutiques", value: boutiques?.length ?? 0, icon: MapPin, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Tournées actives", value: (tournees || []).filter((t: any) => t.statut === "en_cours").length, icon: Route, color: "text-purple-500", bg: "bg-purple-50" },
        ].map((k, i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-2`}>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-xs text-slate-400 mt-0.5">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Map container */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            {/* Map toolbar */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-sm text-slate-700">Dakar & Banlieue — Live GPS</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Màj {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </span>
                <button
                  onClick={handleLocate}
                  disabled={locating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-xs font-bold transition-all disabled:opacity-50"
                >
                  <Locate className={cn("w-3.5 h-3.5", locating && "animate-spin")} />
                  Ma position
                </button>
              </div>
            </div>

            {/* Map */}
            {isLoading && (
              <div className="h-96 flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-slate-400">Chargement de la carte OpenStreetMap...</p>
                </div>
              </div>
            )}
            <div
              ref={mapDivRef}
              style={{ width: "100%", height: isFullscreen ? "calc(100vh - 280px)" : 440 }}
            />

            {/* Legend */}
            <div className="flex items-center gap-5 px-4 py-2.5 border-t border-slate-50 bg-slate-50/50">
              {[
                { color: "bg-primary", label: "En tournée", icon: "🚚" },
                { color: "bg-emerald-500", label: "Disponible", icon: "👤" },
                { color: "bg-blue-500", label: "Boutique", icon: "🏪" },
                { color: "bg-purple-500", label: "Dépôt", icon: "🏭" },
              ].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className={`w-3 h-3 rounded-full ${l.color}`} />
                  {l.icon} {l.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 pt-4 pb-3 border-b border-slate-100">
            <h3 className="font-bold text-slate-800 mb-3">Chauffeurs ({(chauffeurs || []).length})</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/30"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2">
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
            {filteredChauffeurs.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Truck className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                <p className="text-sm">Aucun chauffeur</p>
              </div>
            ) : filteredChauffeurs.map((c: any, idx: number) => {
              const activeTournee = getActiveTournee(c.id);
              const color = CHAUFFEUR_COLORS[
                (chauffeurs || []).findIndex((ch: any) => ch.id === c.id) % CHAUFFEUR_COLORS.length
              ];
              const isSelected = selectedChauffeur?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => centerOnChauffeur(c)}
                  className={cn(
                    "px-4 py-3.5 cursor-pointer hover:bg-slate-50 transition-all",
                    isSelected && "bg-orange-50/60 border-l-[3px] border-primary"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-sm"
                        style={{ backgroundColor: color }}
                      >
                        {c.prenom.charAt(0)}{c.nom.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-slate-800">{c.prenom} {c.nom}</div>
                        <StatusBadge status={c.statut} />
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); centerOnChauffeur(c); }}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                      title="Centrer sur ce chauffeur"
                    >
                      <Navigation className="w-4 h-4 text-slate-400 hover:text-primary" />
                    </button>
                  </div>

                  {activeTournee && (
                    <div className="mt-2 rounded-xl px-3 py-2 text-xs" style={{ backgroundColor: color + "12" }}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold" style={{ color }}>🚚 {activeTournee.nombreArrets} arrêts</span>
                        <span style={{ color }}>{formatFCFA(Number(activeTournee.totalLivraisons || 0))}</span>
                      </div>
                      <div className="text-slate-400 mt-1">Tournée #{activeTournee.id} · {activeTournee.date}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer info */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5" />
              Cliquez sur un chauffeur pour centrer la carte
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
