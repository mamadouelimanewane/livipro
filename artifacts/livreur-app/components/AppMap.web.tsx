import React from "react";
import { View, Text, StyleSheet } from "react-native";
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

export function AppMap({ stops, currentStopId }: AppMapProps) {
  const done = stops.filter((s) => s.statut === "livree").length;
  return (
    <View style={styles.container}>
      <Feather name="map" size={28} color={Colors.slateLight} />
      <Text style={styles.text}>Carte GPS</Text>
      <Text style={styles.sub}>
        {done}/{stops.length} arrêts effectués
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#e2e8f0",
  },
  text: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.slate },
  sub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.slateLight },
});
