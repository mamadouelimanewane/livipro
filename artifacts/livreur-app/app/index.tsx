import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Colors from "@/constants/colors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

interface Grossiste {
  id: number;
  nom: string;
  ville: string;
  statut: string;
}

interface Chauffeur {
  id: number;
  nom: string;
  telephone: string;
  statut: string;
}

function fetchGrossistes(): Promise<Grossiste[]> {
  return fetch(`${BASE_URL}/admin/grossistes`).then((r) => r.json());
}

function fetchChauffeurs(grossisteId: number): Promise<Chauffeur[]> {
  return fetch(`${BASE_URL}/grossistes/${grossisteId}/chauffeurs`).then((r) =>
    r.json()
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [selectedGrossisteId, setSelectedGrossisteId] = useState<number | null>(null);
  const [step, setStep] = useState<"grossiste" | "chauffeur">("grossiste");

  const { data: grossistes = [], isLoading: loadingG } = useQuery({
    queryKey: ["grossistes"],
    queryFn: fetchGrossistes,
  });

  const { data: chauffeurs = [], isLoading: loadingC } = useQuery({
    queryKey: ["chauffeurs", selectedGrossisteId],
    queryFn: () => fetchChauffeurs(selectedGrossisteId!),
    enabled: !!selectedGrossisteId,
  });

  const selectGrossiste = (g: Grossiste) => {
    setSelectedGrossisteId(g.id);
    setStep("chauffeur");
  };

  const selectChauffeur = async (c: Chauffeur) => {
    await AsyncStorage.setItem("grossisteId", String(selectedGrossisteId));
    await AsyncStorage.setItem("chauffeurId", String(c.id));
    await AsyncStorage.setItem("chauffeurNom", c.nom);
    router.replace("/manifest");
  };

  const activeGrossiste = grossistes.find((g) => g.id === selectedGrossisteId);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <LinearGradient
        colors={["#0f172a", "#1e293b"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Feather name="truck" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.logoTitle}>
              LiviPro{" "}
              <Text style={styles.logoSub}>Distri</Text>
            </Text>
            <Text style={styles.logoDesc}>Portail Chauffeur</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        {step === "grossiste" && (
          <>
            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>Étape 1/2</Text>
              </View>
              <Text style={styles.stepTitle}>Votre Distributeur</Text>
              <Text style={styles.stepSub}>Sélectionnez votre espace de travail</Text>
            </View>

            {loadingG ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={Colors.primary} size="large" />
                <Text style={styles.loadingText}>Chargement…</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {grossistes
                  .filter((g) => g.statut === "actif")
                  .map((g) => (
                    <TouchableOpacity
                      key={g.id}
                      style={styles.itemRow}
                      onPress={() => selectGrossiste(g)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.itemIcon}>
                        <Feather name="package" size={18} color={Colors.primary} />
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{g.nom}</Text>
                        <Text style={styles.itemSub}>
                          <Feather name="map-pin" size={11} color={Colors.slate} />{" "}
                          {g.ville}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={18} color={Colors.slateLight} />
                    </TouchableOpacity>
                  ))}
              </ScrollView>
            )}
          </>
        )}

        {step === "chauffeur" && (
          <>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => setStep("grossiste")}
            >
              <Feather name="arrow-left" size={16} color={Colors.slate} />
              <Text style={styles.backBtnText}>
                {activeGrossiste?.nom}
              </Text>
            </TouchableOpacity>

            <View style={styles.stepHeader}>
              <View style={styles.stepBadge}>
                <Text style={styles.stepBadgeText}>Étape 2/2</Text>
              </View>
              <Text style={styles.stepTitle}>Qui êtes-vous ?</Text>
              <Text style={styles.stepSub}>Identifiez-vous pour démarrer</Text>
            </View>

            {loadingC ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator color={Colors.primary} size="large" />
                <Text style={styles.loadingText}>Chargement…</Text>
              </View>
            ) : chauffeurs.length === 0 ? (
              <View style={styles.emptyBox}>
                <Feather name="user-x" size={40} color={Colors.slateLight} />
                <Text style={styles.emptyText}>Aucun chauffeur trouvé</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {chauffeurs.map((c) => {
                  const initials = c.nom
                    .split(" ")
                    .map((w: string) => w[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  const available = c.statut !== "inactif";
                  return (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.itemRow, !available && styles.itemRowDim]}
                      onPress={() => available && selectChauffeur(c)}
                      activeOpacity={available ? 0.7 : 1}
                    >
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarText}>{initials}</Text>
                      </View>
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{c.nom}</Text>
                        <Text style={styles.itemSub}>{c.telephone}</Text>
                      </View>
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor:
                              c.statut === "disponible"
                                ? Colors.green
                                : c.statut === "en_tournee"
                                ? Colors.amber
                                : Colors.slateLight,
                          },
                        ]}
                      />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </>
        )}
      </View>

      <Text style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        LiviPro B2B — Distribution Logistique
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingVertical: 28 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  logoTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.5,
  },
  logoSub: { fontFamily: "Inter_400Regular", opacity: 0.7 },
  logoDesc: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.slateLight,
    marginTop: 2,
  },
  card: {
    flex: 1,
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  stepHeader: { marginBottom: 20 },
  stepBadge: {
    backgroundColor: Colors.primary + "15",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  stepBadgeText: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  stepTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
    color: Colors.navy,
    marginBottom: 4,
  },
  stepSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.slate,
  },
  loadingBox: { alignItems: "center", paddingVertical: 40, gap: 12 },
  loadingText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.slate,
  },
  emptyBox: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
    color: Colors.slateLight,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 12,
  },
  itemRowDim: { opacity: 0.4 },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.primary + "12",
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: { flex: 1 },
  itemName: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.navy,
    marginBottom: 2,
  },
  itemSub: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.slate,
  },
  avatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.navyLight,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 16,
  },
  backBtnText: {
    fontSize: 13,
    fontFamily: "Inter_500Medium",
    color: Colors.slate,
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.slateLight,
    paddingTop: 12,
  },
});
