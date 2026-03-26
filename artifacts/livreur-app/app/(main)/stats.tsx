import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

interface Stats {
  totalTournees: number;
  totalCA: number;
  totalReussies: number;
  totalArrets: number;
  tauxReussite: number;
  meilleurCA: number;
  caMois: number;
  moisLabel: string;
  dernieresTournees: {
    id: number; date: string; statut: string;
    nombreArrets: number; ca: number; reussies: number;
  }[];
}

function KPICard({ icon, label, value, color, sub }: {
  icon: any; label: string; value: string; color?: string; sub?: string;
}) {
  return (
    <View style={kpiStyles.card}>
      <View style={[kpiStyles.iconBox, { backgroundColor: (color ?? Colors.primary) + "18" }]}>
        <Feather name={icon} size={18} color={color ?? Colors.primary} />
      </View>
      <Text style={kpiStyles.value}>{value}</Text>
      <Text style={kpiStyles.label}>{label}</Text>
      {sub ? <Text style={kpiStyles.sub}>{sub}</Text> : null}
    </View>
  );
}
const kpiStyles = StyleSheet.create({
  card: { flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, minWidth: 100 },
  iconBox: { width: 38, height: 38, borderRadius: 10, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  value: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.navy, marginBottom: 2 },
  label: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.slate, textAlign: "center" },
  sub: { fontSize: 9, fontFamily: "Inter_400Regular", color: Colors.slateLight, marginTop: 2, textAlign: "center" },
});

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={{ height: 6, backgroundColor: Colors.border, borderRadius: 3, overflow: "hidden", flex: 1 }}>
      <View style={{ height: "100%", width: `${pct}%` as any, backgroundColor: color, borderRadius: 3 }} />
    </View>
  );
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}
function getColor(taux: number) {
  if (taux >= 80) return Colors.green;
  if (taux >= 60) return Colors.amber;
  return Colors.red;
}

export default function StatsScreen() {
  const insets = useSafeAreaInsets();
  const [grossisteId, setGrossisteId] = useState<number | null>(null);
  const [chauffeurId, setChauffeurId] = useState<number | null>(null);
  const [chauffeurNom, setChauffeurNom] = useState("");

  useEffect(() => {
    AsyncStorage.multiGet(["grossisteId", "chauffeurId", "chauffeurNom"]).then(
      ([[, gId], [, cId], [, nom]]) => {
        if (gId) setGrossisteId(Number(gId));
        if (cId) setChauffeurId(Number(cId));
        if (nom) setChauffeurNom(nom);
      }
    );
  }, []);

  const { data: stats, isLoading, error } = useQuery<Stats>({
    queryKey: ["chauffeurStats", grossisteId, chauffeurId],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/grossistes/${grossisteId}/chauffeurs/${chauffeurId}/stats`);
      if (!r.ok) throw new Error("Erreur");
      return r.json();
    },
    enabled: !!grossisteId && !!chauffeurId,
  });

  const initials = chauffeurNom.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const maxCA = stats?.dernieresTournees.reduce((m, t) => Math.max(m, t.ca), 1) ?? 1;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.profileBox}>
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials || "CH"}</Text></View>
            <View>
              <Text style={styles.headerName}>{chauffeurNom || "Chauffeur"}</Text>
              <Text style={styles.headerSub}>Mes performances</Text>
            </View>
          </View>
          {stats && (
            <View style={[styles.tauxBadge, {
              backgroundColor: getColor(stats.tauxReussite) + "20"
            }]}>
              <Text style={[styles.tauxVal, { color: getColor(stats.tauxReussite) }]}>{stats.tauxReussite}%</Text>
              <Text style={[styles.tauxLabel, { color: getColor(stats.tauxReussite) }]}>réussite</Text>
            </View>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Calcul des statistiques…</Text>
        </View>
      ) : error || !stats ? (
        <View style={styles.center}>
          <Feather name="bar-chart-2" size={40} color={Colors.slateLight} />
          <Text style={styles.emptyTitle}>Aucune donnée disponible</Text>
          <Text style={styles.emptySub}>Vos statistiques apparaîtront après la première tournée.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* KPI row 1 */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Vue d'ensemble</Text>
            <View style={styles.kpiRow}>
              <KPICard icon="truck" label="Tournées" value={String(stats.totalTournees)} color={Colors.primary} />
              <KPICard icon="map-pin" label="Arrêts total" value={String(stats.totalArrets)} color={Colors.navyMid} />
            </View>
            <View style={[styles.kpiRow, { marginTop: 8 }]}>
              <KPICard icon="check-circle" label="Livrés" value={String(stats.totalReussies)} color={Colors.green} />
              <KPICard icon="x-circle" label="Échecs" value={String(stats.totalArrets - stats.totalReussies)} color={Colors.red} />
            </View>
          </View>

          {/* CA section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Chiffre d'affaires</Text>
            <View style={styles.caCard}>
              <View style={styles.caMain}>
                <Text style={styles.caLabel}>CA Total cumulé</Text>
                <Text style={styles.caVal}>{stats.totalCA.toLocaleString("fr-FR")} FCFA</Text>
              </View>
              <View style={styles.caSeparator} />
              <View style={styles.caRow}>
                <View style={styles.caItem}>
                  <Feather name="calendar" size={13} color={Colors.primary} />
                  <View>
                    <Text style={styles.caItemLabel}>{stats.moisLabel}</Text>
                    <Text style={styles.caItemVal}>{stats.caMois.toLocaleString("fr-FR")} F</Text>
                  </View>
                </View>
                <View style={styles.caItem}>
                  <Feather name="award" size={13} color={Colors.amber} />
                  <View>
                    <Text style={styles.caItemLabel}>Meilleure tournée</Text>
                    <Text style={styles.caItemVal}>{stats.meilleurCA.toLocaleString("fr-FR")} F</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Taux de réussite visual */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Taux de réussite</Text>
            <View style={styles.tauxCard}>
              <View style={styles.tauxCircleBox}>
                <View style={[styles.tauxCircle, { borderColor: getColor(stats.tauxReussite) }]}>
                  <Text style={[styles.tauxCircleVal, { color: getColor(stats.tauxReussite) }]}>{stats.tauxReussite}%</Text>
                  <Text style={styles.tauxCircleSub}>réussite</Text>
                </View>
              </View>
              <View style={styles.tauxInfo}>
                <View style={styles.tauxRow}>
                  <View style={[styles.tauxDot, { backgroundColor: Colors.green }]} />
                  <Text style={styles.tauxRowLabel}>Livraisons réussies</Text>
                  <Text style={styles.tauxRowVal}>{stats.totalReussies}</Text>
                </View>
                <View style={styles.tauxRow}>
                  <View style={[styles.tauxDot, { backgroundColor: Colors.red }]} />
                  <Text style={styles.tauxRowLabel}>Échecs / Litiges</Text>
                  <Text style={styles.tauxRowVal}>{stats.totalArrets - stats.totalReussies}</Text>
                </View>
                <View style={styles.tauxRow}>
                  <View style={[styles.tauxDot, { backgroundColor: Colors.slate }]} />
                  <Text style={styles.tauxRowLabel}>Total arrêts</Text>
                  <Text style={styles.tauxRowVal}>{stats.totalArrets}</Text>
                </View>
                <View style={[styles.tauxEval, { backgroundColor: getColor(stats.tauxReussite) + "15" }]}>
                  <Feather name={stats.tauxReussite >= 80 ? "award" : stats.tauxReussite >= 60 ? "thumbs-up" : "alert-circle"} size={12} color={getColor(stats.tauxReussite)} />
                  <Text style={[styles.tauxEvalText, { color: getColor(stats.tauxReussite) }]}>
                    {stats.tauxReussite >= 80 ? "Excellent travail !" : stats.tauxReussite >= 60 ? "Bon score, continuez !" : "Des progrès à faire"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Recent tournées mini chart */}
          {stats.dernieresTournees.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Dernières tournées</Text>
              <View style={styles.miniChart}>
                {stats.dernieresTournees.slice(0, 7).reverse().map((t) => {
                  const taux = t.nombreArrets > 0 ? Math.round((t.reussies / t.nombreArrets) * 100) : 0;
                  const barColor = getColor(taux);
                  return (
                    <View key={t.id} style={styles.miniChartItem}>
                      <View style={styles.miniChartBar}>
                        <View style={[styles.miniChartFill, {
                          height: `${Math.max(10, t.ca > 0 ? (t.ca / maxCA) * 100 : 10)}%` as any,
                          backgroundColor: barColor
                        }]} />
                      </View>
                      <Text style={styles.miniChartDate}>{formatDate(t.date)}</Text>
                    </View>
                  );
                })}
              </View>
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.green }]} /><Text style={styles.legendText}>+80% réussite</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.amber }]} /><Text style={styles.legendText}>60-80%</Text></View>
                <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: Colors.red }]} /><Text style={styles.legendText}>-60%</Text></View>
              </View>

              <View style={styles.recentList}>
                {stats.dernieresTournees.slice(0, 5).map((t) => {
                  const taux = t.nombreArrets > 0 ? Math.round((t.reussies / t.nombreArrets) * 100) : 0;
                  return (
                    <View key={t.id} style={styles.recentItem}>
                      <View style={styles.recentLeft}>
                        <Text style={styles.recentId}>#{t.id}</Text>
                        <Text style={styles.recentDate}>{formatDate(t.date)}</Text>
                      </View>
                      <View style={styles.recentMid}>
                        <MiniBar value={taux} max={100} color={getColor(taux)} />
                      </View>
                      <View style={styles.recentRight}>
                        <Text style={styles.recentTaux}>{taux}%</Text>
                        <Text style={styles.recentCA}>{t.ca.toLocaleString("fr-FR")} F</Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          <View style={{ height: insets.bottom + 90 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.navy, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20 },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  profileBox: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.navyLight, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: Colors.primary },
  avatarText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  headerName: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  headerSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slateLight },
  tauxBadge: { borderRadius: 12, padding: 10, alignItems: "center" },
  tauxVal: { fontSize: 18, fontFamily: "Inter_700Bold" },
  tauxLabel: { fontSize: 9, fontFamily: "Inter_500Medium" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.slate },
  emptyTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.navy },
  emptySub: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.slate, textAlign: "center", paddingHorizontal: 40 },
  section: { paddingHorizontal: 16, marginTop: 16 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.slate, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 },
  kpiRow: { flexDirection: "row", gap: 8 },
  caCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  caMain: { alignItems: "center", paddingBottom: 14 },
  caLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slate, marginBottom: 4 },
  caVal: { fontSize: 26, fontFamily: "Inter_700Bold", color: Colors.navy },
  caSeparator: { height: 1, backgroundColor: Colors.border, marginBottom: 14 },
  caRow: { flexDirection: "row", gap: 0 },
  caItem: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: 8 },
  caItemLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.slate, marginBottom: 2 },
  caItemVal: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.navy },
  tauxCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tauxCircleBox: { alignItems: "center" },
  tauxCircle: { width: 80, height: 80, borderRadius: 40, borderWidth: 5, alignItems: "center", justifyContent: "center" },
  tauxCircleVal: { fontSize: 20, fontFamily: "Inter_700Bold" },
  tauxCircleSub: { fontSize: 9, fontFamily: "Inter_400Regular", color: Colors.slate },
  tauxInfo: { flex: 1, gap: 8 },
  tauxRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  tauxDot: { width: 8, height: 8, borderRadius: 4 },
  tauxRowLabel: { flex: 1, fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.slate },
  tauxRowVal: { fontSize: 13, fontFamily: "Inter_700Bold", color: Colors.navy },
  tauxEval: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6 },
  tauxEvalText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  miniChart: { flexDirection: "row", height: 80, alignItems: "flex-end", gap: 6, marginBottom: 6 },
  miniChartItem: { flex: 1, alignItems: "center", gap: 4 },
  miniChartBar: { flex: 1, width: "100%", backgroundColor: Colors.border, borderRadius: 4, overflow: "hidden", justifyContent: "flex-end" },
  miniChartFill: { width: "100%", borderRadius: 4 },
  miniChartDate: { fontSize: 7, fontFamily: "Inter_400Regular", color: Colors.slateLight, textAlign: "center" },
  chartLegend: { flexDirection: "row", gap: 12, marginBottom: 14, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.slate },
  recentList: { gap: 8 },
  recentItem: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: "#fff", borderRadius: 10, padding: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  recentLeft: { width: 48 },
  recentId: { fontSize: 11, fontFamily: "Inter_700Bold", color: Colors.navy },
  recentDate: { fontSize: 9, fontFamily: "Inter_400Regular", color: Colors.slate },
  recentMid: { flex: 1 },
  recentRight: { width: 72, alignItems: "flex-end" },
  recentTaux: { fontSize: 12, fontFamily: "Inter_700Bold", color: Colors.navy },
  recentCA: { fontSize: 10, fontFamily: "Inter_400Regular", color: Colors.slate },
});
