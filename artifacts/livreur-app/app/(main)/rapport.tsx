import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Platform, Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Colors from "@/constants/colors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

function fmt(v: number) {
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

interface Boutique { id: number; nom: string; adresse: string; }
interface Livraison {
  id: number; tourneeId: number; statut: string;
  montantTotal: string; methodePaiement: string;
  boutique: Boutique;
}
interface Tournee {
  id: number; grossisteId: number; chauffeurId: number;
  chauffeurNom: string; date: string; statut: string;
}

function StatCard({ icon, label, value, color }: { icon: any; label: string; value: string | number; color?: string }) {
  return (
    <View style={[sStyles.statCard, { borderLeftColor: color ?? Colors.primary }]}>
      <Feather name={icon} size={20} color={color ?? Colors.primary} style={{ marginBottom: 8 }} />
      <Text style={sStyles.statVal}>{value}</Text>
      <Text style={sStyles.statLabel}>{label}</Text>
    </View>
  );
}

export default function RapportScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [grossisteId, setGrossisteId] = useState<number | null>(null);
  const [chauffeurId, setChauffeurId] = useState<number | null>(null);
  const [chauffeurNom, setChauffeurNom] = useState("");
  const [localPhotos, setLocalPhotos] = useState<Record<number, string>>({});

  useEffect(() => {
    AsyncStorage.multiGet(["grossisteId", "chauffeurId", "chauffeurNom", "localPhotos"]).then(
      ([[, gId], [, cId], [, nom], [, photos]]) => {
        if (gId) setGrossisteId(Number(gId));
        if (cId) setChauffeurId(Number(cId));
        if (nom) setChauffeurNom(nom);
        if (photos) setLocalPhotos(JSON.parse(photos));
      }
    );
  }, []);

  const { data: tournees = [], isLoading: loadT } = useQuery<Tournee[]>({
    queryKey: ["tournees", grossisteId],
    queryFn: () => fetch(`${BASE_URL}/grossistes/${grossisteId}/tournees`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const activeTournee = tournees.find(t => t.statut === "en_cours" || t.statut === "planifiee") ?? tournees[0] ?? null;

  const { data: allLivraisons = [], isLoading: loadL } = useQuery<Livraison[]>({
    queryKey: ["livraisons", grossisteId],
    queryFn: () => fetch(`${BASE_URL}/grossistes/${grossisteId}/livraisons`).then(r => r.json()),
    enabled: !!grossisteId,
  });

  const livraisons = allLivraisons.filter(l => activeTournee && l.tourneeId === activeTournee.id);

  const reussies = livraisons.filter(l => l.statut === "livree");
  const echecs = livraisons.filter(l => l.statut === "echec");
  const litiges = livraisons.filter(l => l.statut === "litige");
  const enAttente = livraisons.filter(l => l.statut === "en_attente");

  const totalEncaisse = reussies.reduce((s, l) => s + parseFloat(l.montantTotal || "0"), 0);
  const totalRestant = enAttente.reduce((s, l) => s + parseFloat(l.montantTotal || "0"), 0);

  const especes = reussies.filter(l => l.methodePaiement === "especes").reduce((s, l) => s + parseFloat(l.montantTotal || "0"), 0);
  const mobile = reussies.filter(l => l.methodePaiement === "mobile_money").reduce((s, l) => s + parseFloat(l.montantTotal || "0"), 0);
  const credit = reussies.filter(l => l.methodePaiement === "credit").reduce((s, l) => s + parseFloat(l.montantTotal || "0"), 0);

  const nbPhotos = livraisons.filter(l => !!localPhotos[l.id]).length;
  const tauxReussite = livraisons.length > 0 ? Math.round((reussies.length / livraisons.length) * 100) : 0;

  const closeMutation = useMutation({
    mutationFn: async () => {
      if (!activeTournee || !grossisteId) throw new Error("Pas de tournée active");
      const r = await fetch(`${BASE_URL}/grossistes/${grossisteId}/tournees/${activeTournee.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ statut: "terminee" }),
      });
      if (!r.ok) throw new Error("Erreur lors de la clôture");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tournees"] });
      Alert.alert("✅ Tournée clôturée", "La tournée a été marquée comme terminée.");
    },
    onError: (e: any) => Alert.alert("Erreur", e.message),
  });

  const handleShare = async () => {
    if (!activeTournee) return;
    const lines = [
      `RAPPORT DE FIN DE TOURNÉE — LiviPro`,
      `═══════════════════════════════════`,
      `Chauffeur : ${chauffeurNom}`,
      `Date      : ${fmtDate(activeTournee.date)}`,
      `Tournée   : TRN-${String(activeTournee.id).padStart(5, "0")}`,
      ``,
      `RÉSULTATS`,
      `─────────`,
      `Arrêts total     : ${livraisons.length}`,
      `✅ Livrés        : ${reussies.length} (${tauxReussite}%)`,
      `❌ Échecs        : ${echecs.length}`,
      `⚠️  Litiges      : ${litiges.length}`,
      `⏳ En attente    : ${enAttente.length}`,
      `📸 Photos prises : ${nbPhotos}`,
      ``,
      `ENCAISSEMENTS`,
      `─────────────`,
      `💵 Espèces       : ${fmt(especes)}`,
      `📱 Mobile Money  : ${fmt(mobile)}`,
      `🏦 Crédit        : ${fmt(credit)}`,
      ``,
      `TOTAL ENCAISSÉ   : ${fmt(totalEncaisse)}`,
      `RESTANT DÛ       : ${fmt(totalRestant)}`,
      ``,
      `DÉTAIL DES ARRÊTS`,
      `─────────────────`,
      ...livraisons.map((l, i) => {
        const emoji = l.statut === "livree" ? "✅" : l.statut === "echec" ? "❌" : l.statut === "litige" ? "⚠️" : "⏳";
        return `${i + 1}. ${emoji} ${l.boutique.nom} — ${fmt(parseFloat(l.montantTotal || "0"))}`;
      }),
    ];
    try {
      await Share.share({ message: lines.join("\n"), title: "Rapport de tournée LiviPro" });
    } catch {}
  };

  const handleClose = () => {
    if (!activeTournee) return;
    if (enAttente.length > 0) {
      Alert.alert(
        "Arrêts non traités",
        `Il reste ${enAttente.length} arrêt(s) en attente. Êtes-vous sûr de vouloir clôturer la tournée ?`,
        [
          { text: "Annuler", style: "cancel" },
          { text: "Clôturer quand même", style: "destructive", onPress: () => closeMutation.mutate() },
        ]
      );
    } else {
      Alert.alert(
        "Clôturer la tournée",
        "Êtes-vous sûr de vouloir clôturer cette tournée ? Cette action est irréversible.",
        [
          { text: "Annuler", style: "cancel" },
          { text: "Clôturer", style: "destructive", onPress: () => closeMutation.mutate() },
        ]
      );
    }
  };

  const isLoading = !grossisteId || loadT || loadL;

  if (isLoading) {
    return (
      <View style={[sStyles.center, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={sStyles.loadingText}>Chargement du rapport…</Text>
      </View>
    );
  }

  if (!activeTournee) {
    return (
      <View style={[sStyles.center, { paddingTop: insets.top }]}>
        <Feather name="clipboard" size={48} color={Colors.slateLight} />
        <Text style={sStyles.emptyTitle}>Aucune tournée active</Text>
        <Text style={sStyles.emptyText}>Le rapport sera disponible lorsqu'une tournée est en cours.</Text>
      </View>
    );
  }

  const isTerminee = activeTournee.statut === "terminee";

  return (
    <View style={[sStyles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={sStyles.header}>
        <View style={sStyles.headerLeft}>
          <View style={sStyles.logoBox}>
            <Feather name="file-text" size={16} color="#fff" />
          </View>
          <View>
            <Text style={sStyles.headerTitle}>Rapport Tournée</Text>
            <Text style={sStyles.headerSub}>TRN-{String(activeTournee.id).padStart(5, "0")} · {fmtDate(activeTournee.date)}</Text>
          </View>
        </View>
        <TouchableOpacity style={sStyles.shareBtn} onPress={handleShare}>
          <Feather name="share-2" size={16} color={Colors.primary} />
          <Text style={sStyles.shareBtnText}>Partager</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
        {/* Status banner */}
        <View style={[sStyles.banner, isTerminee ? sStyles.bannerGreen : tauxReussite >= 80 ? sStyles.bannerGreen : tauxReussite >= 60 ? sStyles.bannerOrange : sStyles.bannerRed]}>
          <Feather name={isTerminee ? "check-circle" : "activity"} size={20} color={isTerminee ? Colors.green : tauxReussite >= 80 ? Colors.green : tauxReussite >= 60 ? "#f59e0b" : Colors.red} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={sStyles.bannerTitle}>{isTerminee ? "Tournée terminée" : "Tournée en cours"} — {tauxReussite}% de réussite</Text>
            <Text style={sStyles.bannerSub}>{reussies.length}/{livraisons.length} livraisons effectuées</Text>
          </View>
        </View>

        {/* Stats grid */}
        <View style={sStyles.statsGrid}>
          <StatCard icon="check-circle" label="Livrées" value={reussies.length} color={Colors.green} />
          <StatCard icon="x-circle" label="Échecs" value={echecs.length} color={Colors.red} />
          <StatCard icon="alert-triangle" label="Litiges" value={litiges.length} color="#f59e0b" />
          <StatCard icon="camera" label="Photos" value={nbPhotos} color="#8b5cf6" />
        </View>

        {/* Encaissements */}
        <View style={sStyles.section}>
          <Text style={sStyles.sectionTitle}>💰 Encaissements</Text>
          <View style={sStyles.encaisseCard}>
            <View style={sStyles.encaisseTotal}>
              <Text style={sStyles.encaisseTotalLabel}>Total encaissé</Text>
              <Text style={sStyles.encaisseTotalVal}>{fmt(totalEncaisse)}</Text>
            </View>
            {[
              { label: "Espèces", icon: "dollar-sign" as const, val: especes, color: Colors.green },
              { label: "Mobile Money", icon: "smartphone" as const, val: mobile, color: Colors.primary },
              { label: "Crédit", icon: "credit-card" as const, val: credit, color: "#8b5cf6" },
            ].map(m => (
              <View key={m.label} style={sStyles.payRow}>
                <View style={[sStyles.payIconBox, { backgroundColor: m.color + "18" }]}>
                  <Feather name={m.icon} size={14} color={m.color} />
                </View>
                <Text style={sStyles.payLabel}>{m.label}</Text>
                <Text style={[sStyles.payVal, { color: m.color }]}>{fmt(m.val)}</Text>
              </View>
            ))}
            {totalRestant > 0 && (
              <View style={[sStyles.payRow, { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: 8, paddingTop: 12 }]}>
                <Feather name="clock" size={14} color={Colors.slateLight} />
                <Text style={[sStyles.payLabel, { marginLeft: 10, color: Colors.slateLight }]}>Restant à encaisser</Text>
                <Text style={[sStyles.payVal, { color: Colors.slateLight }]}>{fmt(totalRestant)}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Détail arrêts */}
        <View style={sStyles.section}>
          <Text style={sStyles.sectionTitle}>📍 Détail des arrêts</Text>
          {livraisons.map((l, i) => {
            const hasPhoto = !!localPhotos[l.id];
            const sc = l.statut === "livree" ? Colors.green : l.statut === "echec" ? Colors.red : l.statut === "litige" ? "#f59e0b" : Colors.slateLight;
            const icon = l.statut === "livree" ? "check-circle" : l.statut === "echec" ? "x-circle" : l.statut === "litige" ? "alert-triangle" : "clock";
            const label = l.statut === "livree" ? "Livré" : l.statut === "echec" ? "Échec" : l.statut === "litige" ? "Litige" : "En attente";
            return (
              <View key={l.id} style={sStyles.stopRow}>
                <View style={[sStyles.stopNum, { borderColor: sc, backgroundColor: sc + "14" }]}>
                  <Feather name={icon as any} size={13} color={sc} />
                </View>
                <View style={sStyles.stopInfo}>
                  <Text style={sStyles.stopName}>{l.boutique.nom}</Text>
                  <Text style={sStyles.stopAddr}>{l.boutique.adresse}</Text>
                </View>
                <View style={sStyles.stopRight}>
                  {hasPhoto && <Feather name="camera" size={11} color={Colors.green} style={{ marginBottom: 3 }} />}
                  <Text style={[sStyles.stopMontant, { color: l.statut === "livree" ? Colors.green : Colors.slateLight }]}>
                    {fmt(parseFloat(l.montantTotal || "0"))}
                  </Text>
                  <View style={[sStyles.chip, { backgroundColor: sc + "18" }]}>
                    <Text style={[sStyles.chipText, { color: sc }]}>{label}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer CTA */}
      {!isTerminee && (
        <View style={[sStyles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[sStyles.closeBtn, closeMutation.isPending && { opacity: 0.6 }]}
            onPress={handleClose}
            disabled={closeMutation.isPending}
          >
            {closeMutation.isPending
              ? <ActivityIndicator size="small" color="#fff" />
              : <Feather name="check-square" size={18} color="#fff" />
            }
            <Text style={sStyles.closeBtnText}>
              {closeMutation.isPending ? "Clôture en cours…" : "Clôturer la tournée"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const sStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center", padding: 24 },
  loadingText: { color: Colors.slateLight, marginTop: 12, fontSize: 14 },
  emptyTitle: { color: Colors.white, fontSize: 18, fontWeight: "700", marginTop: 16, textAlign: "center" },
  emptyText: { color: Colors.slateLight, fontSize: 14, marginTop: 6, textAlign: "center", lineHeight: 20 },

  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
    backgroundColor: Colors.navy,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center",
  },
  headerTitle: { color: Colors.white, fontSize: 16, fontWeight: "700" },
  headerSub: { color: Colors.slateLight, fontSize: 12, marginTop: 1 },
  shareBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    borderWidth: 1, borderColor: Colors.primary + "50",
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  shareBtnText: { color: Colors.primary, fontSize: 13, fontWeight: "600" },

  banner: {
    flexDirection: "row", alignItems: "center",
    margin: 16, borderRadius: 16, padding: 16,
    borderWidth: 1,
  },
  bannerGreen: { backgroundColor: Colors.green + "12", borderColor: Colors.green + "30" },
  bannerOrange: { backgroundColor: "#f59e0b12", borderColor: "#f59e0b30" },
  bannerRed: { backgroundColor: Colors.red + "12", borderColor: Colors.red + "30" },
  bannerTitle: { color: Colors.white, fontSize: 14, fontWeight: "700" },
  bannerSub: { color: Colors.slateLight, fontSize: 12, marginTop: 2 },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12, gap: 8, marginBottom: 4 },
  statCard: {
    flex: 1, minWidth: "44%", backgroundColor: Colors.surface,
    borderRadius: 14, padding: 16, borderLeftWidth: 3,
  },
  statVal: { color: Colors.white, fontSize: 24, fontWeight: "800" },
  statLabel: { color: Colors.slateLight, fontSize: 12, marginTop: 2 },

  section: { paddingHorizontal: 16, marginBottom: 16, marginTop: 8 },
  sectionTitle: { color: Colors.white, fontSize: 15, fontWeight: "700", marginBottom: 12 },

  encaisseCard: { backgroundColor: Colors.surface, borderRadius: 16, padding: 16 },
  encaisseTotal: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingBottom: 16, marginBottom: 12, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  encaisseTotalLabel: { color: Colors.slateLight, fontSize: 13, fontWeight: "600" },
  encaisseTotalVal: { color: Colors.white, fontSize: 22, fontWeight: "800" },
  payRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, gap: 10 },
  payIconBox: { width: 28, height: 28, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  payLabel: { flex: 1, color: Colors.slateLight, fontSize: 13 },
  payVal: { fontSize: 14, fontWeight: "700" },

  stopRow: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: Colors.surface, borderRadius: 14,
    padding: 14, marginBottom: 8, gap: 12,
  },
  stopNum: { width: 32, height: 32, borderRadius: 16, borderWidth: 1.5, alignItems: "center", justifyContent: "center" },
  stopInfo: { flex: 1 },
  stopName: { color: Colors.white, fontSize: 14, fontWeight: "600" },
  stopAddr: { color: Colors.slateLight, fontSize: 11, marginTop: 2 },
  stopRight: { alignItems: "flex-end" },
  stopMontant: { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  chip: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  chipText: { fontSize: 10, fontWeight: "700" },

  footer: {
    paddingHorizontal: 16, paddingTop: 12,
    backgroundColor: Colors.navy,
    borderTopWidth: 1, borderTopColor: Colors.border,
  },
  closeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: Colors.primary, borderRadius: 16, padding: 16,
  },
  closeBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
