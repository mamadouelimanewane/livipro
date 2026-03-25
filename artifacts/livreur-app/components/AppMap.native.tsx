import React, { useState } from "react";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, Callout } from "react-native-maps";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
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

const SEED_POS: Record<number, { lat: number; lng: number }> = {};
function seedPos(id: number) {
  if (SEED_POS[id]) return SEED_POS[id];
  const s1 = ((id * 7919) % 100) / 100;
  const s2 = ((id * 6271) % 100) / 100;
  SEED_POS[id] = {
    lat: 14.6937 + (s1 - 0.5) * 0.06,
    lng: -17.4441 + (s2 - 0.5) * 0.09,
  };
  return SEED_POS[id];
}

function getStatusColor(statut: string, isCurrent: boolean) {
  if (statut === "livree") return Colors.green;
  if (statut === "echec" || statut === "litige") return Colors.red;
  if (isCurrent) return Colors.primary;
  return Colors.slateLight;
}

function getStatusLabel(statut: string, isCurrent: boolean) {
  if (statut === "livree") return "✓ Livré";
  if (statut === "echec") return "✕ Échec";
  if (statut === "litige") return "⚠ Litige";
  if (isCurrent) return "🚚 En cours";
  return "⏳ En attente";
}

export function AppMap({ stops, currentStopId }: AppMapProps) {
  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");

  const coordStops = stops.map((s) => {
    const pos = s.latitude && s.longitude ? { lat: s.latitude, lng: s.longitude } : seedPos(s.id);
    return { ...s, lat: pos.lat, lng: pos.lng };
  });

  const currentStop = coordStops.find((s) => s.id === currentStopId) ?? coordStops[0] ?? null;
  const centerLat = currentStop?.lat ?? 14.6937;
  const centerLng = currentStop?.lng ?? -17.4441;

  const routeCoords = coordStops.map((s) => ({ latitude: s.lat, longitude: s.lng }));
  const doneCoords = coordStops
    .filter((s) => s.statut === "livree")
    .map((s) => ({ latitude: s.lat, longitude: s.lng }));

  const done = stops.filter((s) => s.statut === "livree").length;
  const total = stops.length;

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        mapType={mapType}
        initialRegion={{
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: 0.06,
          longitudeDelta: 0.06,
        }}
        scrollEnabled
        zoomEnabled
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
      >
        {/* Full route — dashed grey */}
        {routeCoords.length > 1 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="rgba(148,163,184,0.6)"
            strokeWidth={2.5}
            lineDashPattern={[8, 5]}
          />
        )}

        {/* Completed segments — solid orange */}
        {doneCoords.length > 1 && (
          <Polyline
            coordinates={doneCoords}
            strokeColor={Colors.primary}
            strokeWidth={3.5}
          />
        )}

        {/* Stop markers */}
        {coordStops.map((s, i) => {
          const isCurrent = s.id === currentStopId;
          const color = getStatusColor(s.statut, isCurrent);
          return (
            <Marker
              key={s.id}
              coordinate={{ latitude: s.lat, longitude: s.lng }}
              anchor={{ x: 0.5, y: 0.5 }}
            >
              <View style={[styles.pin, {
                width: isCurrent ? 44 : 34,
                height: isCurrent ? 44 : 34,
                borderRadius: isCurrent ? 22 : 17,
                backgroundColor: color,
                borderWidth: isCurrent ? 3 : 2,
                shadowColor: color,
                shadowOpacity: 0.5,
                shadowRadius: isCurrent ? 8 : 4,
                elevation: isCurrent ? 8 : 4,
              }]}>
                <Text style={[styles.pinText, { fontSize: isCurrent ? 16 : 13 }]}>
                  {s.statut === "livree" ? "✓" : s.statut === "echec" || s.statut === "litige" ? "✕" : `${i + 1}`}
                </Text>
              </View>
              <Callout tooltip>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{s.nom}</Text>
                  <View style={[styles.calloutBadge, { backgroundColor: color + "22" }]}>
                    <Text style={[styles.calloutStatus, { color }]}>{getStatusLabel(s.statut, isCurrent)}</Text>
                  </View>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>

      {/* Map type toggle */}
      <View style={styles.mapToggle}>
        <TouchableOpacity
          onPress={() => setMapType(t => t === "standard" ? "satellite" : "standard")}
          style={styles.toggleBtn}
        >
          <Feather name={mapType === "standard" ? "layers" : "map"} size={16} color={Colors.navy} />
        </TouchableOpacity>
      </View>

      {/* Progress bar overlay */}
      <View style={styles.progressOverlay}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: total > 0 ? `${Math.round((done / total) * 100)}%` as any : "0%" }]} />
        </View>
        <View style={styles.progressLabel}>
          <View style={[styles.statusDot, { backgroundColor: Colors.green }]} />
          <Text style={styles.progressText}>{done}/{total} livraisons</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, position: "relative" },
  pin: { alignItems: "center", justifyContent: "center", borderColor: "#fff" },
  pinText: { color: "#fff", fontFamily: "Inter_700Bold" },
  callout: {
    backgroundColor: "#0f172a",
    borderRadius: 12,
    padding: 10,
    minWidth: 150,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calloutTitle: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13, marginBottom: 6 },
  calloutBadge: { borderRadius: 6, padding: "3px 8px" as any, alignSelf: "flex-start" },
  calloutStatus: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  mapToggle: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 100,
  },
  toggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  progressOverlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    zIndex: 100,
  },
  progressTrack: {
    height: 5,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 5,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 4,
    justifyContent: "flex-end",
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  progressText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: "#fff" },
});
