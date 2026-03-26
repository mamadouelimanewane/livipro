import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

interface Tournee {
  id: number;
  date: string;
  statut: string;
  nombreArrets: number;
  totalLivraisons: number;
  livraisonsReussies: number;
  chauffeurNom: string;
}

function getStatutColor(s: string) {
  if (s === "terminee") return Colors.green;
  if (s === "en_cours") return Colors.primary;
  if (s === "annulee") return Colors.red;
  return Colors.slateLight;
}
function getStatutLabel(s: string) {
  if (s === "terminee") return "Terminée";
  if (s === "en_cours") return "En cours";
  if (s === "planifiee") return "Planifiée";
  if (s === "annulee") return "Annulée";
  return s;
}
function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export default function HistoriqueScreen() {
  const insets = useSafeAreaInsets();
  const [grossisteId, setGrossisteId] = useState<number | null>(null);
  const [chauffeurId, setChauffeurId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterStatut, setFilterStatut] = useState<string>("all");

  useEffect(() => {
    AsyncStorage.multiGet(["grossisteId", "chauffeurId"]).then(([[, gId], [, cId]]) => {
      if (gId) setGrossisteId(Number(gId));
      if (cId) setChauffeurId(Number(cId));
    });
  }, []);

  const { data: tournees = [], isLoading } = useQuery<Tournee[]>({
    queryKey: ["histoTournees", grossisteId, chauffeurId],
    queryFn: async () => {
      const url = chauffeurId
        ? `${BASE_URL}/grossistes/${grossisteId}/tournees?chauffeurId=${chauffeurId}`
        : `${BASE_URL}/grossistes/${grossisteId}/tournees`;
      const r = await fetch(url);
      return r.json();
    },
    enabled: !!grossisteId,
  });

  const filtered = filterStatut === "all" ? tournees : tournees.filter((t) => t.statut === filterStatut);
  const totalCA = filtered.reduce((s, t) => s + (t.totalLivraisons || 0), 0);

  const FILTERS = [
    { key: "all", label: "Toutes" },
    { key: "terminee", label: "Terminées" },
    { key: "en_cours", label: "En cours" },
    { key: "planifiee", label: "Planifiées" },
  ];

  if (!grossisteId) return null;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Historique</Text>
        <Text style={styles.subtitle}>Mes tournées précédentes</Text>
      </View>

      {/* Summary */}
      {!isLoading && (
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryVal}>{tournees.length}</Text>
            <Text style={styles.summaryLabel}>Tournées</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryVal}>{tournees.filter((t) => t.statut === "terminee").length}</Text>
            <Text style={styles.summaryLabel}>Terminées</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={[styles.summaryVal, { color: Colors.primary, fontSize: 13 }]}>
              {totalCA.toLocaleString("fr-FR")} F
            </Text>
            <Text style={styles.summaryLabel}>CA total</Text>
          </View>
        </View>
      )}

      {/* Filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filterStatut === f.key && styles.filterChipActive]}
            onPress={() => setFilterStatut(f.key)}
          >
            <Text style={[styles.filterChipText, filterStatut === f.key && styles.filterChipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Chargement…</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.center}>
          <Feather name="inbox" size={40} color={Colors.slateLight} />
          <Text style={styles.emptyTitle}>Aucune tournée</Text>
          <Text style={styles.emptySub}>Aucune tournée ne correspond aux filtres sélectionnés.</Text>
        </View>
      ) : (
        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {filtered.map((t) => {
            const sc = getStatutColor(t.statut);
            const taux = t.nombreArrets > 0 ? Math.round((t.livraisonsReussies / t.nombreArrets) * 100) : 0;
            const isOpen = expandedId === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={styles.card}
                onPress={() => setExpandedId(isOpen ? null : t.id)}
                activeOpacity={0.8}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardLeft}>
                    <View style={[styles.tourneeIcon, { backgroundColor: sc + "20" }]}>
                      <Feather name="truck" size={15} color={sc} />
                    </View>
                    <View>
                      <Text style={styles.cardTitle}>Tournée #{t.id}</Text>
                      <Text style={styles.cardDate}>{formatDate(t.date)}</Text>
                    </View>
                  </View>
                  <View style={styles.cardRight}>
                    <View style={[styles.statutBadge, { backgroundColor: sc + "20" }]}>
                      <View style={[styles.statutDot, { backgroundColor: sc }]} />
                      <Text style={[styles.statutText, { color: sc }]}>{getStatutLabel(t.statut)}</Text>
                    </View>
                    <Feather name={isOpen ? "chevron-up" : "chevron-down"} size={14} color={Colors.slateLight} />
                  </View>
                </View>

                <View style={styles.cardStats}>
                  <View style={styles.cardStat}>
                    <Text style={styles.cardStatVal}>{t.nombreArrets}</Text>
                    <Text style={styles.cardStatLabel}>Arrêts</Text>
                  </View>
                  <View style={styles.cardStat}>
                    <Text style={[styles.cardStatVal, { color: Colors.green }]}>{t.livraisonsReussies}</Text>
                    <Text style={styles.cardStatLabel}>Livrés</Text>
                  </View>
                  <View style={styles.cardStat}>
                    <Text style={[styles.cardStatVal, { color: taux >= 80 ? Colors.green : taux >= 60 ? Colors.amber : Colors.red }]}>{taux}%</Text>
                    <Text style={styles.cardStatLabel}>Taux</Text>
                  </View>
                  <View style={styles.cardStat}>
                    <Text style={[styles.cardStatVal, { color: Colors.primary, fontSize: 12 }]}>{(t.totalLivraisons || 0).toLocaleString("fr-FR")} F</Text>
                    <Text style={styles.cardStatLabel}>CA</Text>
                  </View>
                </View>

                {isOpen && (
                  <View style={styles.expanded}>
                    <View style={styles.progressRow}>
                      <Text style={styles.progressLabel}>Progression</Text>
                      <Text style={styles.progressValue}>{taux}%</Text>
                    </View>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${taux}%` as any, backgroundColor: taux >= 80 ? Colors.green : taux >= 60 ? Colors.amber : Colors.red }]} />
                    </View>
                    <View style={styles.expandedGrid}>
                      <View style={styles.expandedItem}>
                        <Feather name="check-circle" size={13} color={Colors.green} />
                        <Text style={styles.expandedItemText}>{t.livraisonsReussies} livraison{t.livraisonsReussies > 1 ? "s" : ""} réussie{t.livraisonsReussies > 1 ? "s" : ""}</Text>
                      </View>
                      <View style={styles.expandedItem}>
                        <Feather name="x-circle" size={13} color={Colors.red} />
                        <Text style={styles.expandedItemText}>{t.nombreArrets - t.livraisonsReussies} échec{t.nombreArrets - t.livraisonsReussies > 1 ? "s" : ""}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
          <View style={{ height: insets.bottom + 90 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.navy, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  title: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 2 },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.slateLight },
  summaryRow: { flexDirection: "row", marginHorizontal: 16, marginTop: 14, gap: 8 },
  summaryCard: { flex: 1, backgroundColor: "#fff", borderRadius: 12, padding: 12, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  summaryVal: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.navy, marginBottom: 2 },
  summaryLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.slate },
  filterBar: { marginTop: 12, maxHeight: 44 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: Colors.border },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.slate },
  filterChipTextActive: { color: "#fff" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.slate },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.navy },
  emptySub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.slate, textAlign: "center", paddingHorizontal: 40 },
  list: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  card: { backgroundColor: "#fff", borderRadius: 16, marginBottom: 10, padding: 14, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  tourneeIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 14, fontFamily: "Inter_700Bold", color: Colors.navy },
  cardDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slate, marginTop: 1 },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  statutBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statutDot: { width: 6, height: 6, borderRadius: 3 },
  statutText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
  cardStats: { flexDirection: "row", borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 10, gap: 0 },
  cardStat: { flex: 1, alignItems: "center" },
  cardStatVal: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.navy, marginBottom: 2 },
  cardStatLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.slateLight },
  expanded: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.border },
  progressRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  progressLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slate },
  progressValue: { fontSize: 11, fontFamily: "Inter_700Bold", color: Colors.navy },
  progressBar: { height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: "hidden", marginBottom: 10 },
  progressFill: { height: "100%", borderRadius: 3 },
  expandedGrid: { flexDirection: "row", gap: 12 },
  expandedItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  expandedItemText: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.slate },
});
