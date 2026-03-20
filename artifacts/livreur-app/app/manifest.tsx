import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { AppMap } from "@/components/AppMap";
import { SignatureModal } from "@/components/SignatureModal";
import { QRModal } from "@/components/QRModal";
import { LitigeModal } from "@/components/LitigeModal";
import Colors from "@/constants/colors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

interface Tournee {
  id: number;
  grossisteId: number;
  chauffeurId: number;
  chauffeurNom: string;
  date: string;
  statut: string;
  nombreArrets: number;
}

interface Boutique {
  id: number;
  nom: string;
  adresse: string;
  proprietaire: string;
  telephone: string;
}

interface Livraison {
  id: number;
  tourneeId: number;
  boutique: Boutique;
  statut: string;
  montant: number;
  methodePaiement: string;
}

type ModalType = null | "signature" | "qr" | "litige";

const DAKAR_COORDS: [number, number][] = [
  [14.6937, -17.4441],
  [14.6928, -17.4627],
  [14.6850, -17.4582],
  [14.6796, -17.4475],
  [14.6978, -17.4372],
  [14.7021, -17.4558],
  [14.7108, -17.4490],
];

function getStatusColor(s: string) {
  if (s === "livree") return Colors.green;
  if (s === "echec" || s === "litige") return Colors.red;
  if (s === "en_cours") return Colors.primary;
  return Colors.slateLight;
}

function getStatusLabel(s: string) {
  if (s === "livree") return "Livré";
  if (s === "echec") return "Échec";
  if (s === "litige") return "Litige";
  if (s === "en_cours") return "En cours";
  return "En attente";
}

function isDone(s: string) {
  return s === "livree" || s === "echec" || s === "litige";
}

function getAIPrediction(nom: string): string | null {
  const h = nom.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  if (h % 3 !== 0) return null;
  const tips = [
    "Ce client commande souvent des extras à la livraison — proposez du lait Nido !",
    "Le responsable préfère le paiement Wave. Préparez le QR code à l'avance.",
    "Livraison matinale conseillée — boutique fermée souvent après 13h.",
    "Ce client a augmenté ses commandes de 15% ce mois. Bon client !",
  ];
  return tips[h % tips.length];
}

export default function ManifestScreen() {
  const insets = useSafeAreaInsets();
  const [grossisteId, setGrossisteId] = useState<number | null>(null);
  const [chauffeurNom, setChauffeurNom] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [localStatuts, setLocalStatuts] = useState<Record<number, string>>({});

  useEffect(() => {
    AsyncStorage.multiGet(["grossisteId", "chauffeurNom"]).then(
      ([[, gId], [, nom]]) => {
        if (!gId) { router.replace("/"); return; }
        setGrossisteId(Number(gId));
        setChauffeurNom(nom ?? "");
      }
    );
  }, []);

  const { data: tournees = [], isLoading: loadingT } = useQuery<Tournee[]>({
    queryKey: ["tournees", grossisteId],
    queryFn: () =>
      fetch(`${BASE_URL}/grossistes/${grossisteId}/tournees`).then((r) =>
        r.json()
      ),
    enabled: !!grossisteId,
  });

  const activeTournee =
    tournees.find((t) => t.statut === "en_cours" || t.statut === "planifiee") ??
    tournees[0] ??
    null;

  const { data: allLivraisons = [], isLoading: loadingL } = useQuery<Livraison[]>({
    queryKey: ["livraisons", grossisteId],
    queryFn: () =>
      fetch(`${BASE_URL}/grossistes/${grossisteId}/livraisons`).then((r) =>
        r.json()
      ),
    enabled: !!grossisteId,
  });

  const livraisons: Livraison[] = allLivraisons
    .filter((l) => activeTournee && l.tourneeId === activeTournee.id)
    .map((l, i) => ({
      ...l,
      statut: localStatuts[l.id] ?? l.statut,
    }));

  const totalStops = livraisons.length;
  const doneCount = livraisons.filter((l) => isDone(l.statut)).length;
  const progress = totalStops > 0 ? doneCount / totalStops : 0;

  const currentStop =
    livraisons.find((l) => !isDone(l.statut)) ?? null;
  const activeStop =
    livraisons.find((l) => l.id === activeId) ?? currentStop ?? null;

  const montant = activeStop?.montant ?? 0;
  const aiTip = activeStop ? getAIPrediction(activeStop.boutique.nom) : null;

  const mapStops = livraisons.map((l, i) => ({
    id: l.id,
    nom: l.boutique.nom,
    statut: l.statut,
    latitude: DAKAR_COORDS[i % DAKAR_COORDS.length][0],
    longitude: DAKAR_COORDS[i % DAKAR_COORDS.length][1],
  }));

  const setStatut = (id: number, s: string) =>
    setLocalStatuts((p) => ({ ...p, [id]: s }));

  const handleSignature = () => {
    if (!activeStop) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStatut(activeStop.id, "livree");
    setModal(null);
    Alert.alert(
      "✓ Livraison validée",
      `${activeStop.boutique.nom}\n${montant.toLocaleString("fr-FR")} FCFA encaissé`
    );
  };

  const handleQR = () => {
    if (!activeStop) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setStatut(activeStop.id, "livree");
    setModal(null);
    Alert.alert("✓ Paiement reçu", `${activeStop.boutique.nom} — Livraison clôturée`);
  };

  const handleLitige = (data: {
    motif: string;
    nbCasses: number;
    newMontant: number;
  }) => {
    if (!activeStop) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setStatut(activeStop.id, "litige");
    setModal(null);
    Alert.alert(
      "Litige enregistré",
      `Motif: ${data.motif}\nMontant ajusté: ${data.newMontant.toLocaleString("fr-FR")} FCFA`
    );
  };

  const openNav = (adresse: string, nom: string) => {
    const q = encodeURIComponent(`${nom}, ${adresse}`);
    const url =
      Platform.OS === "ios"
        ? `maps://?q=${q}`
        : `geo:0,0?q=${q}`;
    Linking.canOpenURL(url).then((ok) => {
      Linking.openURL(ok ? url : `https://maps.google.com/?q=${q}`);
    });
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["grossisteId", "chauffeurId", "chauffeurNom"]);
    router.replace("/");
  };

  const isLoading = !grossisteId || loadingT || loadingL;
  const initials = chauffeurNom
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const totalEncaisse = livraisons
    .filter((l) => l.statut === "livree")
    .reduce((s, l) => s + l.montant, 0);
  const totalRestant = livraisons
    .filter((l) => !isDone(l.statut))
    .reduce((s, l) => s + l.montant, 0);

  if (isLoading) {
    return (
      <View style={[styles.loader, { paddingTop: insets.top }]}>
        <View style={styles.loaderNavy} />
        <View style={styles.loaderCard}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Chargement du manifeste…</Text>
        </View>
      </View>
    );
  }

  if (!activeTournee || totalStops === 0) {
    return (
      <View style={[styles.root, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <View style={styles.headerRow}>
            <View style={styles.logoRow}>
              <View style={styles.logoBox}>
                <Feather name="truck" size={16} color="#fff" />
              </View>
              <Text style={styles.headerTitle}>
                LiviPro <Text style={styles.headerSub}>Distri</Text>
              </Text>
            </View>
            <TouchableOpacity onPress={logout}>
              <Feather name="log-out" size={18} color={Colors.slateLight} />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.emptyBody}>
          <Feather name="truck" size={48} color={Colors.slateLight} />
          <Text style={styles.emptyTitle}>Aucune tournée active</Text>
          <Text style={styles.emptySub}>
            Vous n'avez pas de livraisons planifiées.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Feather name="truck" size={16} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>
                LiviPro <Text style={styles.headerSub}>Distri</Text>
              </Text>
              <Text style={styles.manifestId}>
                Tournée #{activeTournee.id} · {activeTournee.date}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials || "CH"}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={{ padding: 6 }}>
              <Feather name="log-out" size={16} color={Colors.slateLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBox}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Progression logistique</Text>
            <Text style={styles.progressCount}>
              {doneCount} / {totalStops}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.round(progress * 100)}%` },
              ]}
            />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.statChip}>
              <Feather name="check-circle" size={10} color={Colors.green} />
              <Text style={styles.statChipText}>{doneCount} livrés</Text>
            </View>
            <View style={styles.statChip}>
              <Feather name="clock" size={10} color={Colors.slateLight} />
              <Text style={styles.statChipText}>
                {totalStops - doneCount} restants
              </Text>
            </View>
            <View style={styles.statChip}>
              <Feather name="dollar-sign" size={10} color={Colors.amber} />
              <Text style={styles.statChipText}>
                {totalEncaisse.toLocaleString("fr-FR")} F encaissé
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
        {/* Map */}
        <View style={styles.mapContainer}>
          <AppMap stops={mapStops} currentStopId={currentStop?.id} />
        </View>

        {/* Current stop */}
        {activeStop && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              Arrêt en cours
            </Text>
            <View style={styles.currentCard}>
              <View style={styles.currentCardTop}>
                <View style={styles.stopNumBadge}>
                  <Text style={styles.stopNumText}>
                    {livraisons.findIndex((l) => l.id === activeStop.id) + 1}
                  </Text>
                </View>
                <View style={styles.stopInfo}>
                  <Text style={styles.stopName}>{activeStop.boutique.nom}</Text>
                  <Text style={styles.stopAddr}>
                    {activeStop.boutique.adresse}
                  </Text>
                  {activeStop.boutique.proprietaire ? (
                    <Text style={styles.stopProp}>
                      Resp. {activeStop.boutique.proprietaire}
                    </Text>
                  ) : null}
                </View>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() =>
                    openNav(
                      activeStop.boutique.adresse,
                      activeStop.boutique.nom
                    )
                  }
                >
                  <Feather name="navigation" size={15} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.metaRow}>
                <View style={styles.metaCell}>
                  <Text style={styles.metaLabel}>Montant</Text>
                  <Text style={styles.metaValue}>
                    {montant.toLocaleString("fr-FR")} F
                  </Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaCell}>
                  <Text style={styles.metaLabel}>Paiement</Text>
                  <Text style={styles.metaValue}>
                    {activeStop.methodePaiement === "mobile_money"
                      ? "Mobile"
                      : activeStop.methodePaiement === "credit"
                      ? "Crédit"
                      : "Espèces"}
                  </Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaCell}>
                  <Text style={styles.metaLabel}>Statut</Text>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          getStatusColor(activeStop.statut) + "20",
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.statusDot,
                        {
                          backgroundColor: getStatusColor(activeStop.statut),
                        },
                      ]}
                    />
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(activeStop.statut) },
                      ]}
                    >
                      {getStatusLabel(activeStop.statut)}
                    </Text>
                  </View>
                </View>
              </View>

              {aiTip && (
                <View style={styles.aiCard}>
                  <View style={styles.aiHeader}>
                    <Feather name="zap" size={12} color={Colors.amber} />
                    <Text style={styles.aiLabel}>Suggestion IA</Text>
                  </View>
                  <Text style={styles.aiText}>{aiTip}</Text>
                </View>
              )}

              {!isDone(activeStop.statut) && (
                <View style={styles.actionGrid}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.green }]}
                    onPress={() => {
                      setActiveId(activeStop.id);
                      setModal("signature");
                    }}
                  >
                    <Feather name="edit-3" size={16} color="#fff" />
                    <Text style={styles.actionLabel}>Signer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#3b82f6" }]}
                    onPress={() => {
                      setActiveId(activeStop.id);
                      setModal("qr");
                    }}
                  >
                    <Feather name="grid" size={16} color="#fff" />
                    <Text style={styles.actionLabel}>QR Pay</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: Colors.red }]}
                    onPress={() => {
                      setActiveId(activeStop.id);
                      setModal("litige");
                    }}
                  >
                    <Feather name="alert-triangle" size={16} color="#fff" />
                    <Text style={styles.actionLabel}>Litige</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Cash summary */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Encaissements</Text>
          <View style={styles.cashRow}>
            <View style={[styles.cashCard, { backgroundColor: Colors.green + "12" }]}>
              <Feather name="trending-up" size={18} color={Colors.green} />
              <Text style={styles.cashLabel}>Encaissé</Text>
              <Text style={[styles.cashVal, { color: Colors.green }]}>
                {totalEncaisse.toLocaleString("fr-FR")} F
              </Text>
            </View>
            <View style={[styles.cashCard, { backgroundColor: Colors.slateLight + "18" }]}>
              <Feather name="clock" size={18} color={Colors.slate} />
              <Text style={styles.cashLabel}>Restant</Text>
              <Text style={[styles.cashVal, { color: Colors.slate }]}>
                {totalRestant.toLocaleString("fr-FR")} F
              </Text>
            </View>
          </View>
        </View>

        {/* All stops */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            Tous les arrêts ({totalStops})
          </Text>
          {livraisons.map((l, i) => {
            const isCurrent = l.id === (currentStop?.id);
            const sc = getStatusColor(l.statut);
            return (
              <TouchableOpacity
                key={l.id}
                style={[
                  styles.stopRow,
                  isCurrent && styles.stopRowActive,
                ]}
                onPress={() => setActiveId(l.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.stopCircle,
                    { borderColor: sc, backgroundColor: sc + "18" },
                  ]}
                >
                  {l.statut === "livree" ? (
                    <Feather name="check" size={11} color={sc} />
                  ) : l.statut === "echec" || l.statut === "litige" ? (
                    <Feather name="x" size={11} color={sc} />
                  ) : (
                    <Text style={[styles.stopCircleNum, { color: sc }]}>
                      {i + 1}
                    </Text>
                  )}
                </View>
                <View style={styles.stopRowInfo}>
                  <Text
                    style={[
                      styles.stopRowName,
                      isCurrent && { color: Colors.primary },
                    ]}
                  >
                    {l.boutique.nom}
                  </Text>
                  <Text style={styles.stopRowAddr}>{l.boutique.adresse}</Text>
                </View>
                <View style={styles.stopRowRight}>
                  <Text style={styles.stopRowMontant}>
                    {l.montant.toLocaleString("fr-FR")} F
                  </Text>
                  <View
                    style={[
                      styles.miniChip,
                      { backgroundColor: sc + "18" },
                    ]}
                  >
                    <Text style={[styles.miniChipText, { color: sc }]}>
                      {getStatusLabel(l.statut)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: insets.bottom + 24 }} />
      </ScrollView>

      {/* Modals */}
      <SignatureModal
        visible={modal === "signature"}
        boutiqueName={activeStop?.boutique.nom ?? ""}
        montant={montant}
        onConfirm={handleSignature}
        onClose={() => setModal(null)}
      />
      <QRModal
        visible={modal === "qr"}
        boutiqueName={activeStop?.boutique.nom ?? ""}
        montant={montant}
        tourneeId={`TRN-${activeTournee.id}`}
        onConfirm={handleQR}
        onClose={() => setModal(null)}
      />
      <LitigeModal
        visible={modal === "litige"}
        boutiqueName={activeStop?.boutique.nom ?? ""}
        montant={montant}
        onConfirm={handleLitige}
        onClose={() => setModal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  loader: { flex: 1, backgroundColor: Colors.navy },
  loaderNavy: { height: 120 },
  loaderCard: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  loaderText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.slate,
  },
  header: {
    backgroundColor: Colors.navy,
    paddingHorizontal: 18,
    paddingBottom: 20,
    paddingTop: 6,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    color: "#fff",
    letterSpacing: 0.3,
  },
  headerSub: { fontFamily: "Inter_400Regular", opacity: 0.65 },
  manifestId: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.slateLight,
    marginTop: 1,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.navyLight,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.navyMid,
  },
  avatarText: { fontSize: 10, fontFamily: "Inter_700Bold", color: "#fff" },
  progressBox: {
    backgroundColor: Colors.navyLight,
    borderRadius: 14,
    padding: 12,
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.slateLight,
  },
  progressCount: {
    fontSize: 12,
    fontFamily: "Inter_700Bold",
    color: "#fff",
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.navyMid,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  progressStats: { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  statChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  statChipText: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.slateLight,
  },
  body: { flex: 1 },
  mapContainer: {
    marginHorizontal: 14,
    marginTop: 14,
    height: 150,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  section: { paddingHorizontal: 14, marginTop: 18 },
  sectionLabel: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    color: Colors.slate,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  currentCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    borderWidth: 2,
    borderColor: Colors.primary + "28",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  currentCardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 12,
  },
  stopNumBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  stopNumText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  stopInfo: { flex: 1 },
  stopName: {
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    color: Colors.navy,
    marginBottom: 2,
  },
  stopAddr: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.slate,
    marginBottom: 1,
  },
  stopProp: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.slateLight,
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary + "15",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  metaRow: {
    flexDirection: "row",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  metaCell: { flex: 1, alignItems: "center" },
  metaLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.slate,
    marginBottom: 3,
  },
  metaValue: {
    fontSize: 13,
    fontFamily: "Inter_700Bold",
    color: Colors.navy,
    textAlign: "center",
  },
  metaDivider: { width: 1, height: 28, backgroundColor: Colors.border },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  aiCard: {
    backgroundColor: Colors.amber + "12",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: Colors.amber,
  },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 5, marginBottom: 3 },
  aiLabel: {
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    color: Colors.amber,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  aiText: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.navy,
    lineHeight: 17,
  },
  actionGrid: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 4,
  },
  actionLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  emptyBody: {
    flex: 1,
    backgroundColor: Colors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    color: Colors.navy,
  },
  emptySub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: Colors.slate,
    textAlign: "center",
  },
  cashRow: { flexDirection: "row", gap: 12 },
  cashCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 5,
  },
  cashLabel: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    color: Colors.slate,
  },
  cashVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stopRowActive: {
    marginHorizontal: -4,
    paddingHorizontal: 4,
    backgroundColor: Colors.primary + "07",
    borderRadius: 12,
    borderBottomWidth: 0,
    marginBottom: 1,
  },
  stopCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    flexShrink: 0,
  },
  stopCircleNum: { fontSize: 11, fontFamily: "Inter_700Bold" },
  stopRowInfo: { flex: 1 },
  stopRowName: {
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
    color: Colors.navy,
    marginBottom: 1,
  },
  stopRowAddr: {
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    color: Colors.slate,
  },
  stopRowRight: { alignItems: "flex-end", gap: 3 },
  stopRowMontant: {
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    color: Colors.navy,
  },
  miniChip: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  miniChipText: { fontSize: 9, fontFamily: "Inter_600SemiBold" },
});
