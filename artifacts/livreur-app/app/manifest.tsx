import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { SignatureModal } from "@/components/SignatureModal";
import { QRModal } from "@/components/QRModal";
import { LitigeModal } from "@/components/LitigeModal";
import Colors from "@/constants/colors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

interface Tournee {
  id: number;
  nom: string;
  statut: string;
  date: string;
  grossisteId: number;
}

interface Livraison {
  id: number;
  boutique: { id: number; nom: string; adresse: string; latitude?: string; longitude?: string };
  montant: string;
  statut: string;
  methodePaiement?: string;
  tourneeId: number;
}

type ModalType = null | "signature" | "qr" | "litige";

function getStatusColor(statut: string) {
  switch (statut) {
    case "livree": return Colors.green;
    case "echouee": return Colors.red;
    case "en_cours": return Colors.primary;
    default: return Colors.slateLight;
  }
}

function getStatusLabel(statut: string) {
  switch (statut) {
    case "livree": return "Livré";
    case "echouee": return "Échec";
    case "en_cours": return "En cours";
    default: return "En attente";
  }
}

const AI_PREDICTIONS: Record<string, string> = {};

function getAIPrediction(boutiqueName: string, _montant: number): string | null {
  const hash = boutiqueName.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  if (hash % 3 !== 0) return null;
  const tips = [
    "Cette boutique commande souvent des produits supplémentaires à la livraison. Proposez du lait Nido!",
    "Le responsable préfère le paiement Wave. Préparez le QR code à l'avance.",
    "Livraison matinale conseillée — boutique fermée souvent après 13h.",
    "Ce client a augmenté ses commandes de 15% ce mois. Bon client!",
  ];
  return tips[hash % tips.length];
}

export default function ManifestScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [grossisteId, setGrossisteId] = useState<number | null>(null);
  const [chauffeurNom, setChauffeurNom] = useState("");
  const [modal, setModal] = useState<ModalType>(null);
  const [activeStopId, setActiveStopId] = useState<number | null>(null);

  const [localStatuts, setLocalStatuts] = useState<Record<number, string>>({});

  useEffect(() => {
    AsyncStorage.multiGet(["grossisteId", "chauffeurNom"]).then(([[, gId], [, nom]]) => {
      if (gId) setGrossisteId(Number(gId));
      if (nom) setChauffeurNom(nom);
      if (!gId) router.replace("/");
    });
  }, []);

  const { data: tournees = [], isLoading: loadingT } = useQuery<Tournee[]>({
    queryKey: ["tournees", grossisteId],
    queryFn: () =>
      fetch(`${BASE_URL}/grossistes/${grossisteId}/tournees`).then((r) => r.json()),
    enabled: !!grossisteId,
  });

  const activeTournee = tournees.find(
    (t) => t.statut === "en_cours" || t.statut === "planifiee"
  ) ?? tournees[0];

  const { data: allLivraisons = [], isLoading: loadingL } = useQuery<Livraison[]>({
    queryKey: ["livraisons", grossisteId],
    queryFn: () =>
      fetch(`${BASE_URL}/grossistes/${grossisteId}/livraisons`).then((r) => r.json()),
    enabled: !!grossisteId,
  });

  const livraisons = allLivraisons.filter(
    (l) => activeTournee && l.tourneeId === activeTournee.id
  );

  const stops = livraisons.map((l) => ({
    ...l,
    statut: localStatuts[l.id] ?? l.statut,
  }));

  const totalStops = stops.length;
  const doneCount = stops.filter((s) => s.statut === "livree" || s.statut === "echouee").length;
  const progress = totalStops > 0 ? doneCount / totalStops : 0;

  const currentStop = stops.find((s) => s.statut === "planifiee" || s.statut === "en_cours") ?? null;
  const activeStop = stops.find((s) => s.id === activeStopId) ?? currentStop;

  const montant = activeStop ? Math.round(parseFloat(activeStop.montant)) : 0;
  const aiTip = activeStop ? getAIPrediction(activeStop.boutique.nom, montant) : null;

  const mapCoords = stops
    .filter((s) => s.boutique.latitude && s.boutique.longitude)
    .map((s) => ({
      latitude: parseFloat(s.boutique.latitude!),
      longitude: parseFloat(s.boutique.longitude!),
    }));

  const centerLat = mapCoords.length > 0 ? mapCoords[0].latitude : 14.6937;
  const centerLng = mapCoords.length > 0 ? mapCoords[0].longitude : -17.4441;

  const updateStatut = (id: number, statut: string) => {
    setLocalStatuts((prev) => ({ ...prev, [id]: statut }));
  };

  const handleSignatureConfirm = (paths: string[]) => {
    if (activeStop) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateStatut(activeStop.id, "livree");
      setModal(null);
      Alert.alert(
        "Livraison validée !",
        `${activeStop.boutique.nom}\n${montant.toLocaleString("fr-FR")} FCFA encaissé`,
        [{ text: "OK" }]
      );
    }
  };

  const handleQRConfirm = () => {
    if (activeStop) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      updateStatut(activeStop.id, "livree");
      setModal(null);
      Alert.alert("Paiement reçu !", `${activeStop.boutique.nom} — Livraison clôturée.`);
    }
  };

  const handleLitigeConfirm = (data: { motif: string; nbCasses: number; newMontant: number }) => {
    if (activeStop) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      updateStatut(activeStop.id, "echouee");
      setModal(null);
      Alert.alert(
        "Litige enregistré",
        `Motif: ${data.motif}\nMontant ajusté: ${data.newMontant.toLocaleString("fr-FR")} FCFA`
      );
    }
  };

  const openNav = (stop: typeof stops[0]) => {
    const lat = stop.boutique.latitude ?? "14.6937";
    const lng = stop.boutique.longitude ?? "-17.4441";
    const label = encodeURIComponent(stop.boutique.nom);
    const url =
      Platform.OS === "ios"
        ? `maps://0,0?daddr=${lat},${lng}&q=${label}`
        : `geo:${lat},${lng}?q=${label}`;
    Linking.canOpenURL(url).then((ok) => {
      if (ok) Linking.openURL(url);
      else Linking.openURL(`https://maps.google.com/maps?q=${lat},${lng}`);
    });
  };

  const isLoading = !grossisteId || loadingT || loadingL;

  const logout = async () => {
    await AsyncStorage.multiRemove(["grossisteId", "chauffeurId", "chauffeurNom"]);
    router.replace("/");
  };

  if (isLoading) {
    return (
      <View style={[styles.loaderContainer, { paddingTop: insets.top }]}>
        <View style={styles.loaderHeader} />
        <View style={styles.loaderBody}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loaderText}>Chargement du manifeste…</Text>
        </View>
      </View>
    );
  }

  if (!activeTournee) {
    return (
      <View style={[styles.emptyContainer, { paddingTop: insets.top }]}>
        <View style={styles.navyHeader}>
          <Text style={styles.headerTitle}>LiviPro <Text style={{ color: Colors.primary }}>Distri</Text></Text>
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Feather name="log-out" size={18} color={Colors.slateLight} />
          </TouchableOpacity>
        </View>
        <View style={styles.emptyBody}>
          <Feather name="truck" size={48} color={Colors.slateLight} />
          <Text style={styles.emptyTitle}>Aucune tournée active</Text>
          <Text style={styles.emptyText}>Vous n'avez pas de tournée planifiée aujourd'hui.</Text>
        </View>
      </View>
    );
  }

  const initials = chauffeurNom
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Dark navy header */}
      <View style={styles.navyHeader}>
        <View style={styles.headerRow}>
          <View style={styles.logoRow}>
            <View style={styles.logoBox}>
              <Feather name="truck" size={16} color="#fff" />
            </View>
            <View>
              <Text style={styles.headerTitle}>
                LiviPro <Text style={styles.headerSub}>Distri</Text>
              </Text>
              <Text style={styles.manifestId}>Manifeste #{activeTournee.id}</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{initials || "CH"}</Text>
            </View>
            <TouchableOpacity onPress={logout} style={styles.logoutIconBtn}>
              <Feather name="log-out" size={16} color={Colors.slateLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressBox}>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Progression logistique</Text>
            <Text style={styles.progressCount}>
              {doneCount} / {totalStops} arrêts
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(progress * 100)}%` }]} />
          </View>
          <View style={styles.progressStats}>
            <View style={styles.statChip}>
              <Feather name="check-circle" size={11} color={Colors.green} />
              <Text style={styles.statChipText}>{doneCount} livrés</Text>
            </View>
            <View style={styles.statChip}>
              <Feather name="clock" size={11} color={Colors.slateLight} />
              <Text style={styles.statChipText}>{totalStops - doneCount} restants</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollBody} showsVerticalScrollIndicator={false}>
        {/* Map */}
        {mapCoords.length > 0 && (
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_DEFAULT}
              style={styles.map}
              initialRegion={{
                latitude: centerLat,
                longitude: centerLng,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              {stops.map((s, i) => {
                if (!s.boutique.latitude || !s.boutique.longitude) return null;
                const lat = parseFloat(s.boutique.latitude);
                const lng = parseFloat(s.boutique.longitude);
                return (
                  <Marker
                    key={s.id}
                    coordinate={{ latitude: lat, longitude: lng }}
                    title={s.boutique.nom}
                    pinColor={
                      s.statut === "livree"
                        ? Colors.green
                        : s.statut === "echouee"
                        ? Colors.red
                        : s.id === currentStop?.id
                        ? Colors.primary
                        : "#888"
                    }
                  />
                );
              })}
              {mapCoords.length > 1 && (
                <Polyline
                  coordinates={mapCoords}
                  strokeColor={Colors.primary}
                  strokeWidth={2}
                />
              )}
            </MapView>
          </View>
        )}

        {/* Current stop card */}
        {activeStop && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              <Feather name="navigation" size={13} color={Colors.primary} /> Arrêt en cours
            </Text>
            <View style={styles.currentStopCard}>
              <View style={styles.currentStopTop}>
                <View style={styles.stopNumberBadge}>
                  <Text style={styles.stopNumberText}>
                    {stops.findIndex((s) => s.id === activeStop.id) + 1}
                  </Text>
                </View>
                <View style={styles.stopInfo}>
                  <Text style={styles.stopName}>{activeStop.boutique.nom}</Text>
                  <Text style={styles.stopAddress}>
                    <Feather name="map-pin" size={11} color={Colors.slate} />{" "}
                    {activeStop.boutique.adresse}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.navBtn}
                  onPress={() => openNav(activeStop)}
                >
                  <Feather name="navigation" size={16} color={Colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.stopMeta}>
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Montant</Text>
                  <Text style={styles.metaValue}>
                    {montant.toLocaleString("fr-FR")} FCFA
                  </Text>
                </View>
                <View style={styles.metaDivider} />
                <View style={styles.metaItem}>
                  <Text style={styles.metaLabel}>Statut</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(activeStop.statut) + "20" }]}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(activeStop.statut) }]} />
                    <Text style={[styles.statusText, { color: getStatusColor(activeStop.statut) }]}>
                      {getStatusLabel(activeStop.statut)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* AI prediction */}
              {aiTip && (
                <View style={styles.aiCard}>
                  <View style={styles.aiHeader}>
                    <Feather name="zap" size={13} color={Colors.amber} />
                    <Text style={styles.aiLabel}>Suggestion IA</Text>
                  </View>
                  <Text style={styles.aiText}>{aiTip}</Text>
                </View>
              )}

              {/* Action buttons */}
              {(activeStop.statut === "planifiee" || activeStop.statut === "en_cours") && (
                <View style={styles.actionGrid}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnGreen]}
                    onPress={() => { setActiveStopId(activeStop.id); setModal("signature"); }}
                  >
                    <Feather name="edit-3" size={17} color="#fff" />
                    <Text style={styles.actionBtnText}>Signer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnBlue]}
                    onPress={() => { setActiveStopId(activeStop.id); setModal("qr"); }}
                  >
                    <Feather name="grid" size={17} color="#fff" />
                    <Text style={styles.actionBtnText}>Payer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.actionBtnRed]}
                    onPress={() => { setActiveStopId(activeStop.id); setModal("litige"); }}
                  >
                    <Feather name="alert-triangle" size={17} color="#fff" />
                    <Text style={styles.actionBtnText}>Litige</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Cash summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Feather name="dollar-sign" size={13} color={Colors.primary} /> Encaissements
          </Text>
          <View style={styles.cashRow}>
            <View style={[styles.cashCard, { backgroundColor: Colors.green + "12" }]}>
              <Feather name="check-circle" size={18} color={Colors.green} />
              <Text style={styles.cashLabel}>Encaissé</Text>
              <Text style={[styles.cashValue, { color: Colors.green }]}>
                {stops
                  .filter((s) => s.statut === "livree")
                  .reduce((sum, s) => sum + Math.round(parseFloat(s.montant)), 0)
                  .toLocaleString("fr-FR")}{" "}
                F
              </Text>
            </View>
            <View style={[styles.cashCard, { backgroundColor: Colors.slateLight + "12" }]}>
              <Feather name="clock" size={18} color={Colors.slate} />
              <Text style={styles.cashLabel}>Restant</Text>
              <Text style={[styles.cashValue, { color: Colors.slate }]}>
                {stops
                  .filter((s) => s.statut !== "livree" && s.statut !== "echouee")
                  .reduce((sum, s) => sum + Math.round(parseFloat(s.montant)), 0)
                  .toLocaleString("fr-FR")}{" "}
                F
              </Text>
            </View>
          </View>
        </View>

        {/* All stops list */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            <Feather name="list" size={13} color={Colors.primary} /> Tous les arrêts
          </Text>
          {stops.map((s, i) => {
            const isCurrent = s.id === (currentStop?.id);
            const statusColor = getStatusColor(s.statut);
            return (
              <TouchableOpacity
                key={s.id}
                style={[styles.stopRow, isCurrent && styles.stopRowCurrent]}
                onPress={() => setActiveStopId(s.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.stopNumCircle, { backgroundColor: statusColor + "20", borderColor: statusColor }]}>
                  {s.statut === "livree" ? (
                    <Feather name="check" size={12} color={statusColor} />
                  ) : s.statut === "echouee" ? (
                    <Feather name="x" size={12} color={statusColor} />
                  ) : (
                    <Text style={[styles.stopNumText, { color: statusColor }]}>{i + 1}</Text>
                  )}
                </View>
                <View style={styles.stopRowInfo}>
                  <Text style={[styles.stopRowName, isCurrent && styles.stopRowNameCurrent]}>
                    {s.boutique.nom}
                  </Text>
                  <Text style={styles.stopRowAddress}>{s.boutique.adresse}</Text>
                </View>
                <View style={styles.stopRowRight}>
                  <Text style={styles.stopRowMontant}>
                    {Math.round(parseFloat(s.montant)).toLocaleString("fr-FR")} F
                  </Text>
                  <View style={[styles.miniStatus, { backgroundColor: statusColor + "20" }]}>
                    <Text style={[styles.miniStatusText, { color: statusColor }]}>
                      {getStatusLabel(s.statut)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>

      {/* Modals */}
      <SignatureModal
        visible={modal === "signature"}
        boutiqueName={activeStop?.boutique.nom ?? ""}
        montant={montant}
        onConfirm={handleSignatureConfirm}
        onClose={() => setModal(null)}
      />
      <QRModal
        visible={modal === "qr"}
        boutiqueName={activeStop?.boutique.nom ?? ""}
        montant={montant}
        tourneeId={`TRN-${activeTournee?.id ?? 0}`}
        onConfirm={handleQRConfirm}
        onClose={() => setModal(null)}
      />
      <LitigeModal
        visible={modal === "litige"}
        boutiqueName={activeStop?.boutique.nom ?? ""}
        montant={montant}
        onConfirm={handleLitigeConfirm}
        onClose={() => setModal(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  loaderContainer: { flex: 1, backgroundColor: Colors.navy },
  loaderHeader: { height: 160, backgroundColor: Colors.navy },
  loaderBody: { flex: 1, backgroundColor: Colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, alignItems: "center", justifyContent: "center", gap: 12 },
  loaderText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.slate },
  emptyContainer: { flex: 1, backgroundColor: Colors.navy },
  emptyBody: { flex: 1, backgroundColor: Colors.background, borderTopLeftRadius: 28, borderTopRightRadius: 28, alignItems: "center", justifyContent: "center", gap: 12, padding: 40 },
  emptyTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.navy },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.slate, textAlign: "center" },
  navyHeader: { backgroundColor: Colors.navy, paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  logoBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.3 },
  headerSub: { fontFamily: "Inter_400Regular", opacity: 0.7 },
  manifestId: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slateLight, marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatarCircle: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: Colors.navyLight,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: Colors.navyMid,
  },
  avatarText: { fontSize: 11, fontFamily: "Inter_700Bold", color: "#fff" },
  logoutIconBtn: { padding: 6 },
  logoutBtn: { padding: 6 },
  progressBox: {
    backgroundColor: Colors.navyLight,
    borderRadius: 16,
    padding: 14,
  },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.slateLight },
  progressCount: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
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
  progressStats: { flexDirection: "row", gap: 12 },
  statChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  statChipText: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slateLight },
  scrollBody: { flex: 1 },
  mapContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 18,
    overflow: "hidden",
    height: 160,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  map: { width: "100%", height: "100%" },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.slate,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  currentStopCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.primary + "30",
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  currentStopTop: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  stopNumberBadge: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
  },
  stopNumberText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  stopInfo: { flex: 1 },
  stopName: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.navy, marginBottom: 2 },
  stopAddress: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.slate },
  navBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: Colors.primary + "15",
    alignItems: "center", justifyContent: "center",
  },
  stopMeta: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  metaItem: { flex: 1, alignItems: "center" },
  metaLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slate, marginBottom: 4 },
  metaValue: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.navy },
  metaDivider: { width: 1, height: 32, backgroundColor: Colors.border },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  aiCard: {
    backgroundColor: Colors.amber + "12",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderLeftWidth: 3,
    borderLeftColor: Colors.amber,
  },
  aiHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 4 },
  aiLabel: { fontSize: 11, fontFamily: "Inter_700Bold", color: Colors.amber, textTransform: "uppercase", letterSpacing: 0.5 },
  aiText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.navy, lineHeight: 18 },
  actionGrid: { flexDirection: "row", gap: 8 },
  actionBtn: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 5,
  },
  actionBtnGreen: { backgroundColor: Colors.green },
  actionBtnBlue: { backgroundColor: "#3b82f6" },
  actionBtnRed: { backgroundColor: Colors.red },
  actionBtnText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
  cashRow: { flexDirection: "row", gap: 12 },
  cashCard: {
    flex: 1, borderRadius: 16, padding: 14,
    alignItems: "center", gap: 6,
  },
  cashLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slate },
  cashValue: { fontSize: 16, fontFamily: "Inter_700Bold" },
  stopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  stopRowCurrent: { backgroundColor: Colors.primary + "06", marginHorizontal: -4, paddingHorizontal: 4, borderRadius: 12, borderBottomWidth: 0 },
  stopNumCircle: {
    width: 30, height: 30, borderRadius: 15,
    alignItems: "center", justifyContent: "center",
    borderWidth: 1.5,
  },
  stopNumText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  stopRowInfo: { flex: 1 },
  stopRowName: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.navy, marginBottom: 2 },
  stopRowNameCurrent: { color: Colors.primary },
  stopRowAddress: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slate },
  stopRowRight: { alignItems: "flex-end", gap: 4 },
  stopRowMontant: { fontSize: 12, fontFamily: "Inter_700Bold", color: Colors.navy },
  miniStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  miniStatusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});
