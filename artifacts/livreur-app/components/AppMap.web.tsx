import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import Colors from "@/constants/colors";

interface Stop {
  id: number;
  nom: string;
  latitude?: number;
  longitude?: number;
  statut: string;
}

interface AppMapProps {
  stops: Stop[];
  currentStopId?: number;
}

const SEED_POS: Record<number, [number, number]> = {};
function seedPos(id: number): [number, number] {
  if (SEED_POS[id]) return SEED_POS[id];
  const s1 = ((id * 7919) % 100) / 100;
  const s2 = ((id * 6271) % 100) / 100;
  SEED_POS[id] = [14.6937 + (s1 - 0.5) * 0.06, -17.4441 + (s2 - 0.5) * 0.09];
  return SEED_POS[id];
}

export function AppMap({ stops, currentStopId }: AppMapProps) {
  const containerRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const lRef = useRef<any>(null);
  const [ready, setReady] = useState(false);

  const done = stops.filter((s) => s.statut === "livree").length;
  const total = stops.length;

  // Init Leaflet map once
  useEffect(() => {
    const el = containerRef.current as HTMLElement | null;
    if (!el || mapRef.current) return;

    let destroyed = false;

    // Inject Leaflet CSS via <link> tag (Metro doesn't bundle CSS files)
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then(async (LModule) => {
      if (destroyed) return;
      const L = LModule.default || LModule;
      lRef.current = L;

      const map = L.map(el, {
        zoomControl: true,
        attributionControl: true,
      }).setView([14.6937, -17.4441], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: '© <a href="https://openstreetmap.org">OSM</a>',
      }).addTo(map);

      mapRef.current = map;
      setReady(true);
    }).catch(() => {});

    return () => {
      destroyed = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      lRef.current = null;
    };
  }, []);

  // Update markers & route when stops change
  useEffect(() => {
    if (!ready || !mapRef.current || !lRef.current) return;
    const L = lRef.current;
    const map = mapRef.current;

    // Clear old markers/layers
    markersRef.current.forEach((m) => {
      try { m.remove(); } catch {}
    });
    markersRef.current = [];

    if (stops.length === 0) return;

    const coords: [number, number][] = [];

    stops.forEach((s, i) => {
      const pos: [number, number] =
        s.latitude && s.longitude
          ? [s.latitude, s.longitude]
          : seedPos(s.id);
      coords.push(pos);

      const isDone = s.statut === "livree";
      const isEchec = s.statut === "echec" || s.statut === "litige";
      const isCurrent = s.id === currentStopId;

      const color = isDone
        ? Colors.green
        : isEchec
        ? Colors.red
        : isCurrent
        ? Colors.primary
        : Colors.slateLight;

      const size = isCurrent ? 44 : 34;
      const pulse = isCurrent
        ? `animation:lp_pulse 1.5s ease-in-out infinite;`
        : "";

      const icon = L.divIcon({
        className: "",
        html: `
          <style>@keyframes lp_pulse{0%,100%{box-shadow:0 0 0 0 ${color}66}50%{box-shadow:0 0 0 8px ${color}00}}</style>
          <div style="
            width:${size}px;height:${size}px;background:${color};
            border-radius:50%;border:3px solid #fff;
            box-shadow:0 3px 12px ${color}80;
            display:flex;align-items:center;justify-content:center;
            font-size:${isCurrent ? 16 : 13}px;font-weight:800;color:#fff;
            ${pulse}
          ">${isDone ? "✓" : isEchec ? "✕" : i + 1}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
        popupAnchor: [0, -size / 2],
      });

      const marker = L.marker(pos, { icon }).addTo(map);
      marker.bindPopup(
        `<div style="font-family:system-ui;min-width:160px;padding:4px">
          <div style="font-weight:800;font-size:14px;margin-bottom:6px">${s.nom}</div>
          <div style="
            display:inline-flex;align-items:center;gap:6px;
            background:${color}18;color:${color};
            border-radius:8px;padding:3px 10px;font-size:12px;font-weight:700
          ">
            ${isDone ? "✓ Livré" : isEchec ? "✕ Échec / Litige" : isCurrent ? "🚚 Arrêt en cours" : `⏳ Arrêt ${i + 1}`}
          </div>
        </div>`
      );
      if (isCurrent) marker.openPopup();
      markersRef.current.push(marker);
    });

    // Dashed polyline connecting all stops
    if (coords.length > 1) {
      const completedCoords = stops
        .filter((s) => s.statut === "livree")
        .map((s, i) => coords[stops.indexOf(s)]);

      // Full route (dashed grey)
      const fullLine = L.polyline(coords, {
        color: "#94a3b8",
        weight: 2.5,
        opacity: 0.5,
        dashArray: "7 5",
      }).addTo(map);
      markersRef.current.push(fullLine);

      // Completed segments (solid orange)
      const doneIdx = stops.filter((s) => s.statut === "livree").length;
      if (doneIdx > 0) {
        const doneLine = L.polyline(coords.slice(0, doneIdx + 1), {
          color: Colors.primary,
          weight: 3,
          opacity: 0.85,
        }).addTo(map);
        markersRef.current.push(doneLine);
      }

      // Fit bounds
      const allLine = L.polyline(coords);
      map.fitBounds(allLine.getBounds(), { padding: [28, 28] });
    } else if (coords.length === 1) {
      map.setView(coords[0], 15);
    }
  }, [stops, currentStopId, ready]);

  return (
    <View style={styles.wrapper}>
      <View ref={containerRef} style={styles.map} />
      {/* Progress overlay */}
      <View style={styles.overlay}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: total > 0 ? `${Math.round((done / total) * 100)}%` as any : "0%" },
            ]}
          />
        </View>
        <View style={styles.progressText}>
          <View style={styles.dot} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, position: "relative" as any, backgroundColor: "#e2e8f0" },
  map: { flex: 1, minHeight: 200 },
  overlay: {
    position: "absolute" as any,
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 1000,
  },
  progressBar: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: 4,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  progressText: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.green,
  },
});
