import React from "react";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { StyleSheet } from "react-native";
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

export function AppMap({ stops, currentStopId }: AppMapProps) {
  const coordStops = stops.filter((s) => s.latitude && s.longitude);

  const centerLat = coordStops.length > 0 ? coordStops[0].latitude! : 14.6937;
  const centerLng = coordStops.length > 0 ? coordStops[0].longitude! : -17.4441;

  const route = coordStops.map((s) => ({
    latitude: s.latitude!,
    longitude: s.longitude!,
  }));

  function pinColor(s: Stop) {
    if (s.statut === "livree") return Colors.green;
    if (s.statut === "echec" || s.statut === "litige") return Colors.red;
    if (s.id === currentStopId) return Colors.primary;
    return "#888";
  }

  return (
    <MapView
      provider={PROVIDER_DEFAULT}
      style={StyleSheet.absoluteFill}
      initialRegion={{
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
      }}
      scrollEnabled={false}
      zoomEnabled={false}
    >
      {coordStops.map((s) => (
        <Marker
          key={s.id}
          coordinate={{ latitude: s.latitude!, longitude: s.longitude! }}
          title={s.nom}
          pinColor={pinColor(s)}
        />
      ))}
      {route.length > 1 && (
        <Polyline coordinates={route} strokeColor={Colors.primary} strokeWidth={2} />
      )}
    </MapView>
  );
}
