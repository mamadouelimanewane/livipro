import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, TextInput, Alert, Platform,
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
function formatDate(s: string) {
  return new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

const METHODES = [
  { id: "especes", label: "Espèces", icon: "dollar-sign" as const },
  { id: "mobile_money", label: "Mobile Money", icon: "smartphone" as const },
  { id: "virement", label: "Virement", icon: "send" as const },
];

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const qc = useQueryClient();
  const [grossisteId, setGrossisteId] = useState<number | null>(null);
  const [chauffeurId, setChauffeurId] = useState<number | null>(null);
  const [montant, setMontant] = useState("");
  const [description, setDescription] = useState("");
  const [methode, setMethode] = useState("especes");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    AsyncStorage.multiGet(["grossisteId", "chauffeurId"]).then(
      ([[, gId], [, cId]]) => {
        if (gId) setGrossisteId(Number(gId));
        if (cId) setChauffeurId(Number(cId));
      }
    );
  }, []);

  const { data: wallet, isLoading } = useQuery({
    queryKey: ["wallet-chauffeur", grossisteId, chauffeurId],
    queryFn: async () => {
      const r = await fetch(`${BASE_URL}/grossistes/${grossisteId}/wallet/chauffeur/${chauffeurId}`);
      if (!r.ok) throw new Error("Erreur wallet");
      return r.json();
    },
    enabled: !!grossisteId && !!chauffeurId,
    refetchInterval: 30000,
  });

  const addTx = useMutation({
    mutationFn: async (data: any) => {
      const r = await fetch(`${BASE_URL}/grossistes/${grossisteId}/wallet/chauffeur/${chauffeurId}`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
      });
      if (!r.ok) throw new Error("Erreur");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet-chauffeur"] });
      setMontant(""); setDescription(""); setShowForm(false);
      Alert.alert("✅ Enregistré", "Transaction ajoutée avec succès.");
    },
    onError: () => Alert.alert("Erreur", "Impossible d'enregistrer la transaction."),
  });

  const solde = wallet?.solde ?? 0;
  const transactions: any[] = wallet?.transactions ?? [];

  const handleSubmit = () => {
    if (!montant || isNaN(Number(montant)) || Number(montant) <= 0) {
      Alert.alert("Erreur", "Montant invalide."); return;
    }
    addTx.mutate({ type: "credit", montant: Number(montant), description: description || "Collecte", methodePaiement: methode });
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Wallet</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addBtn}>
          <Feather name={showForm ? "x" : "plus"} size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.primary} size="large" />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
          {/* Solde Card */}
          <View style={styles.soldeCard}>
            <Text style={styles.soldeLabel}>Solde à remettre</Text>
            <Text style={styles.soldeValue}>{fmt(Math.abs(solde))}</Text>
            <View style={styles.soldeRow}>
              <View style={styles.soldeMini}>
                <Feather name="arrow-up-circle" size={14} color={Colors.green} />
                <Text style={[styles.soldeMiniVal, { color: Colors.green }]}>
                  {fmt(transactions.filter(t => t.type === "credit").reduce((s, t) => s + Number(t.montant), 0))}
                </Text>
                <Text style={styles.soldeMiniLabel}>Collecté</Text>
              </View>
              <View style={styles.soldeSep} />
              <View style={styles.soldeMini}>
                <Feather name="arrow-down-circle" size={14} color={Colors.red} />
                <Text style={[styles.soldeMiniVal, { color: Colors.red }]}>
                  {fmt(transactions.filter(t => t.type === "debit").reduce((s, t) => s + Number(t.montant), 0))}
                </Text>
                <Text style={styles.soldeMiniLabel}>Remis</Text>
              </View>
            </View>
          </View>

          {/* Form: Add transaction */}
          {showForm && (
            <View style={styles.form}>
              <Text style={styles.formTitle}>Enregistrer une collecte</Text>

              {/* Méthode selector */}
              <View style={styles.methodeRow}>
                {METHODES.map(m => (
                  <TouchableOpacity key={m.id} onPress={() => setMethode(m.id)}
                    style={[styles.methodeBtn, methode === m.id && styles.methodeBtnActive]}>
                    <Feather name={m.icon} size={14} color={methode === m.id ? Colors.primary : Colors.slate} />
                    <Text style={[styles.methodeBtnText, methode === m.id && styles.methodeBtnTextActive]}>{m.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                placeholder="Montant (FCFA)"
                placeholderTextColor={Colors.slateLight}
                keyboardType="numeric"
                value={montant}
                onChangeText={setMontant}
              />
              <TextInput
                style={styles.input}
                placeholder="Description (optionnel)"
                placeholderTextColor={Colors.slateLight}
                value={description}
                onChangeText={setDescription}
              />
              <TouchableOpacity onPress={handleSubmit} disabled={addTx.isPending} style={styles.submitBtn}>
                {addTx.isPending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>✅ Enregistrer</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Transactions */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Historique des transactions</Text>
            {transactions.length === 0 ? (
              <View style={styles.empty}>
                <Feather name="credit-card" size={36} color={Colors.slateLight} />
                <Text style={styles.emptyText}>Aucune transaction</Text>
              </View>
            ) : transactions.map((tx: any) => (
              <View key={tx.id} style={styles.txItem}>
                <View style={[styles.txIcon, { backgroundColor: tx.type === "credit" ? Colors.green + "20" : Colors.red + "20" }]}>
                  <Feather
                    name={tx.type === "credit" ? "arrow-up" : "arrow-down"}
                    size={16}
                    color={tx.type === "credit" ? Colors.green : Colors.red}
                  />
                </View>
                <View style={styles.txInfo}>
                  <Text style={styles.txDesc}>{tx.description}</Text>
                  <Text style={styles.txDate}>{formatDate(tx.createdAt)} • {tx.methodePaiement}</Text>
                </View>
                <Text style={[styles.txAmount, { color: tx.type === "credit" ? Colors.green : Colors.red }]}>
                  {tx.type === "credit" ? "+" : "−"}{fmt(Number(tx.montant))}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { backgroundColor: Colors.navy, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff" },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10 },
  loadingText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.slate },
  soldeCard: { margin: 16, borderRadius: 24, backgroundColor: Colors.primary, padding: 24, alignItems: "center", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 16, elevation: 8 },
  soldeLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", marginBottom: 6 },
  soldeValue: { fontSize: 36, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 20 },
  soldeRow: { flexDirection: "row", gap: 24 },
  soldeMini: { alignItems: "center", gap: 4 },
  soldeMiniVal: { fontSize: 14, fontFamily: "Inter_700Bold" },
  soldeMiniLabel: { fontSize: 10, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  soldeSep: { width: 1, backgroundColor: "rgba(255,255,255,0.25)" },
  form: { marginHorizontal: 16, marginBottom: 16, backgroundColor: "#fff", borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  formTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.navy, marginBottom: 16 },
  methodeRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  methodeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, padding: 10, borderRadius: 12, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border },
  methodeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primary + "12" },
  methodeBtnText: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: Colors.slate },
  methodeBtnTextActive: { color: Colors.primary },
  input: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, color: Colors.navy, fontFamily: "Inter_400Regular", fontSize: 15, marginBottom: 10 },
  submitBtn: { backgroundColor: Colors.primary, borderRadius: 14, padding: 16, alignItems: "center", marginTop: 4 },
  submitBtnText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 15 },
  section: { paddingHorizontal: 16, marginTop: 8 },
  sectionLabel: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: Colors.slate, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 12 },
  empty: { alignItems: "center", paddingVertical: 32, gap: 10 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.slateLight },
  txItem: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  txIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  txInfo: { flex: 1 },
  txDesc: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.navy },
  txDate: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slate, marginTop: 2 },
  txAmount: { fontSize: 14, fontFamily: "Inter_700Bold" },
});
