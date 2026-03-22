import { useEffect, useRef, useState } from "react";
import { useChauffeurs } from "@/hooks/use-chauffeurs";
import { useTournees } from "@/hooks/use-tournees";
import { useBoutiques } from "@/hooks/use-boutiques";
import { useGrossiste } from "@/context/GrossisteContext";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { formatFCFA } from "@/lib/utils";
import { MapPin, Truck, RefreshCw, Users, Navigation } from "lucide-react";

// Dakar city bounding box for realistic demo positions
const DAKAR_CENTER = [14.6928, -17.4467] as [number, number];
const SEED_POSITIONS: Record<number, [number, number]> = {};

function getSeedPos(id: number): [number, number] {
  if (SEED_POSITIONS[id]) return SEED_POSITIONS[id];
  const seed = ((id * 7919) % 100) / 100;
  const seed2 = ((id * 6271) % 100) / 100;
  SEED_POSITIONS[id] = [DAKAR_CENTER[0] + (seed - 0.5) * 0.08, DAKAR_CENTER[1] + (seed2 - 0.5) * 0.1];
  return SEED_POSITIONS[id];
}

export default function Carte() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChauffeur, setSelectedChauffeur] = useState<any>(null);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const { grossisteId } = useGrossiste();

  const { data: chauffeurs } = useChauffeurs();
  const { data: tournees } = useTournees();
  const { data: boutiques } = useBoutiques();

  const tourneesEnCours = (tournees || []).filter((t: any) => t.statut === "en_cours");

  // Get chauffeur's active tournee
  const getActiveTournee = (chauffeurId: number) =>
    tourneesEnCours.find((t: any) => t.chauffeurId === chauffeurId);

  // Simulate GPS movement (positions shift slightly each render)
  const getLivePos = (chauffeurId: number): [number, number] => {
    const base = getSeedPos(chauffeurId);
    const now = Date.now();
    const drift = Math.sin(now / 30000 + chauffeurId) * 0.003;
    const drift2 = Math.cos(now / 25000 + chauffeurId) * 0.003;
    return [base[0] + drift, base[1] + drift2];
  };

  useEffect(() => {
    if (!mapRef.current || leafletRef.current) return;
    import("leaflet").then(async (L) => {
      try { await import("leaflet/dist/leaflet.css"); } catch {}
      const map = L.map(mapRef.current!, { zoomControl: true }).setView(DAKAR_CENTER, 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);
      leafletRef.current = map;
      setIsLoading(false);
    }).catch(() => setIsLoading(false));
    return () => {
      if (leafletRef.current) { leafletRef.current.remove(); leafletRef.current = null; }
    };
  }, []);

  // Update markers when chauffeurs change or periodically
  useEffect(() => {
    if (!leafletRef.current || !chauffeurs) return;
    const L = (window as any).L;
    if (!L) {
      import("leaflet").then(L => updateMarkers(L.default || L));
    } else {
      updateMarkers(L);
    }

    const interval = setInterval(() => {
      import("leaflet").then(LModule => {
        const L = LModule.default || LModule;
        updateMarkers(L);
        setLastUpdate(new Date());
      });
    }, 15000);
    return () => clearInterval(interval);
  }, [chauffeurs, tournees, boutiques]);

  function updateMarkers(L: any) {
    if (!leafletRef.current || !chauffeurs) return;
    // Clear old markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add chauffeur markers
    chauffeurs.forEach((c: any) => {
      const activeTournee = getActiveTournee(c.id);
      const pos = getLivePos(c.id);
      const isEnTournee = c.statut === "en_tournee" || !!activeTournee;
      const color = isEnTournee ? "#f97316" : c.statut === "disponible" ? "#22c55e" : "#64748b";

      const icon = L.divIcon({
        className: "",
        html: `<div style="position:relative">
          <div style="background:${color};width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid #fff;box-shadow:0 4px 14px ${color}60;cursor:pointer;">
            ${isEnTournee ? "🚚" : "👤"}
          </div>
          ${isEnTournee ? `<div style="position:absolute;top:-2px;right:-2px;width:14px;height:14px;background:#ef4444;border-radius:50%;border:2px solid #fff;"></div>` : ""}
          <div style="background:#0f172a;color:#fff;font-size:10px;font-weight:700;padding:2px 6px;border-radius:8px;position:absolute;top:48px;left:50%;transform:translateX(-50%);white-space:nowrap;border:1px solid #334155;">
            ${c.prenom} ${c.nom.charAt(0)}.
          </div>
        </div>`,
        iconSize: [46, 46], iconAnchor: [23, 23],
      });

      const marker = L.marker(pos, { icon }).addTo(leafletRef.current);
      marker.bindPopup(`
        <div style="font-family:system-ui;min-width:180px">
          <div style="font-weight:700;font-size:15px;margin-bottom:6px">${c.prenom} ${c.nom}</div>
          <div style="color:${color};font-weight:600;font-size:13px;margin-bottom:4px">
            ● ${c.statut === "en_tournee" ? "En tournée" : c.statut === "disponible" ? "Disponible" : "Inactif"}
          </div>
          ${activeTournee ? `<div style="font-size:12px;color:#666;margin-top:6px">📦 ${activeTournee.nombreArrets} arrêts<br/>💰 ${Number(activeTournee.totalLivraisons || 0).toLocaleString("fr-FR")} FCFA</div>` : ""}
          <div style="font-size:11px;color:#888;margin-top:4px">📱 ${c.telephone}</div>
        </div>
      `);
      marker.on("click", () => setSelectedChauffeur(c));
      markersRef.current.push(marker);
    });

    // Add boutique markers (in tour stops)
    (boutiques || []).forEach((b: any, i: number) => {
      const boutiquePos = getSeedPos(b.id + 1000) as [number, number];
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:#3b82f6;width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;border:2px solid #fff;box-shadow:0 2px 8px #3b82f640;">🏪</div>`,
        iconSize: [30, 30], iconAnchor: [15, 15],
      });
      const marker = L.marker(boutiquePos, { icon }).addTo(leafletRef.current);
      marker.bindPopup(`<div style="font-family:system-ui"><b>${b.nom}</b><br/><span style="font-size:12px;color:#666">${b.adresse}</span></div>`);
      markersRef.current.push(marker);
    });
  }

  const activeChauffeurs = (chauffeurs || []).filter((c: any) => c.statut === "en_tournee");
  const disponibles = (chauffeurs || []).filter((c: any) => c.statut === "disponible");

  return (
    <div>
      <PageHeader
        title="Carte en Temps Réel"
        description="Suivez vos chauffeurs et boutiques en direct sur la carte."
        action={
          <button onClick={() => { import("leaflet").then(L => { if (chauffeurs) updateMarkers(L.default || L); setLastUpdate(new Date()); }); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-slate-600 hover:border-primary/40 hover:text-primary text-sm font-bold transition-all shadow-sm">
            <RefreshCw className="w-4 h-4" /> Actualiser
          </button>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "En tournée", value: activeChauffeurs.length, icon: Truck, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Disponibles", value: disponibles.length, icon: Users, color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Boutiques actives", value: boutiques?.length ?? 0, icon: MapPin, color: "text-blue-500", bg: "bg-blue-50" },
        ].map((k, i) => (
          <div key={i} className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center mb-2`}>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </div>
            <div className={`text-2xl font-bold ${k.color}`}>{k.value}</div>
            <div className="text-xs text-muted-foreground">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/50">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-sm text-foreground">Carte live — Dakar</span>
              </div>
              <span className="text-xs text-muted-foreground">Mis à jour {lastUpdate.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
            </div>
            {isLoading && (
              <div className="h-96 flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Chargement de la carte...</p>
                </div>
              </div>
            )}
            <div ref={mapRef} style={{ width: "100%", height: 420 }} />
          </div>

          {/* Legend */}
          <div className="flex items-center gap-6 mt-3 px-2">
            {[
              { color: "bg-amber-500", label: "En tournée", icon: "🚚" },
              { color: "bg-emerald-500", label: "Disponible", icon: "👤" },
              { color: "bg-blue-500", label: "Boutique", icon: "🏪" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <div className={`w-3 h-3 rounded-full ${l.color}`} />
                {l.icon} {l.label}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: chauffeurs list */}
        <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border/50">
            <h3 className="font-bold text-foreground">Chauffeurs actifs</h3>
          </div>
          <div className="divide-y divide-border/50">
            {(chauffeurs || []).map((c: any) => {
              const activeTournee = getActiveTournee(c.id);
              return (
                <div key={c.id} onClick={() => setSelectedChauffeur(c === selectedChauffeur ? null : c)}
                  className={`px-4 py-3 cursor-pointer hover:bg-slate-50 transition-colors ${selectedChauffeur?.id === c.id ? "bg-primary/5 border-l-2 border-primary" : ""}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold ${c.statut === "en_tournee" ? "bg-amber-100 text-amber-700" : c.statut === "disponible" ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {c.prenom.charAt(0)}{c.nom.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{c.prenom} {c.nom}</div>
                        <StatusBadge status={c.statut} />
                      </div>
                    </div>
                    <Navigation className="w-4 h-4 text-slate-400" />
                  </div>
                  {activeTournee && (
                    <div className="mt-2 bg-amber-50 rounded-lg px-3 py-2 text-xs">
                      <span className="font-bold text-amber-700">🚚 {activeTournee.nombreArrets} arrêts</span>
                      <span className="text-amber-600 ml-2">{formatFCFA(Number(activeTournee.totalLivraisons || 0))}</span>
                    </div>
                  )}
                </div>
              );
            })}
            {(chauffeurs || []).length === 0 && (
              <div className="p-8 text-center text-muted-foreground">
                <Truck className="w-10 h-10 mx-auto mb-2 text-slate-200" />
                Aucun chauffeur
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
