import React, { useRef, useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;
const fmt = (v: number) =>
  new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(v) + " FCFA";

interface ColisageItem {
  id: number;
  montantTotal: string;
  statut: string;
  boutique: { nom: string; adresse: string };
  items: { produit?: { nom: string; unite: string }; quantite: number; prixUnitaire: string }[];
}

interface Props {
  visible: boolean;
  onClose: () => void;
  grossisteId: number;
  chauffeurId: number;
  tourneeId: number | null;
  onSuccess: () => void;
}

export function ColisageModal({ visible, onClose, grossisteId, chauffeurId, tourneeId, onSuccess }: Props) {
  const canvasRef = useRef<any>(null);
  const [commandes, setCommandes] = useState<ColisageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  // Charger les commandes à coliser
  useEffect(() => {
    if (!visible || !grossisteId) return;
    setLoading(true);
    setSigned(false);
    setSignatureData(null);
    fetch(`${BASE_URL}/grossistes/${grossisteId}/commandes?statut=en_preparation,confirmee`)
      .then(r => r.json())
      .then((data: ColisageItem[]) => {
        const ready = (data || []).filter((c: any) => !c.signatureColisage &&
          ["confirmee", "en_preparation"].includes(c.statut));
        setCommandes(ready);
        const initChecked: Record<number, boolean> = {};
        ready.forEach((c: ColisageItem) => { initChecked[c.id] = true; });
        setChecked(initChecked);
      })
      .catch(() => setCommandes([]))
      .finally(() => setLoading(false));
  }, [visible, grossisteId]);

  // Signature pad (web canvas)
  useEffect(() => {
    if (!visible || Platform.OS !== "web") return;
    const timeout = setTimeout(() => {
      const canvas = document.getElementById("colisage-sig-canvas") as HTMLCanvasElement;
      if (!canvas) return;
      canvasRef.current = canvas;
      const ctx = canvas.getContext("2d")!;
      let drawing = false;
      const start = (e: MouseEvent | TouchEvent) => {
        drawing = true;
        ctx.beginPath();
        const pos = getPos(e, canvas);
        ctx.moveTo(pos.x, pos.y);
        setSigned(true);
      };
      const draw = (e: MouseEvent | TouchEvent) => {
        if (!drawing) return;
        const pos = getPos(e, canvas);
        ctx.lineTo(pos.x, pos.y);
        ctx.strokeStyle = "#f97316";
        ctx.lineWidth = 2.5;
        ctx.lineCap = "round";
        ctx.stroke();
      };
      const end = () => {
        drawing = false;
        setSignatureData(canvas.toDataURL("image/png"));
      };
      canvas.addEventListener("mousedown", start);
      canvas.addEventListener("mousemove", draw);
      canvas.addEventListener("mouseup", end);
      canvas.addEventListener("touchstart", start as any, { passive: true });
      canvas.addEventListener("touchmove", draw as any, { passive: true });
      canvas.addEventListener("touchend", end);
    }, 300);
    return () => clearTimeout(timeout);
  }, [visible]);

  function getPos(e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    if ("touches" in e) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: (e as MouseEvent).clientX - rect.left, y: (e as MouseEvent).clientY - rect.top };
  }

  const clearSig = () => {
    setSigned(false);
    setSignatureData(null);
    if (Platform.OS === "web") {
      const canvas = document.getElementById("colisage-sig-canvas") as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext("2d")!;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const selectedIds = commandes.filter(c => checked[c.id]).map(c => c.id);

  const handleSubmit = async () => {
    if (!signatureData && Platform.OS === "web") {
      Alert.alert("Signature requise", "Veuillez signer le colisage avant de valider.");
      return;
    }
    if (selectedIds.length === 0) {
      Alert.alert("Aucune commande", "Cochez au moins une commande à coliser.");
      return;
    }
    setSubmitting(true);
    let successCount = 0;
    for (const commandeId of selectedIds) {
      try {
        const res = await fetch(`${BASE_URL}/grossistes/${grossisteId}/commandes/${commandeId}/colisage`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chauffeurId,
            signatureColisage: signatureData || `SIG-COLISAGE-${chauffeurId}-${Date.now()}`,
          }),
        });
        if (res.ok) successCount++;
      } catch { /* continue */ }
    }
    setSubmitting(false);
    Alert.alert(
      "✅ Colisage authentifié",
      `${successCount} commande(s) sur ${selectedIds.length} validée(s).\nLa signature a été enregistrée.`,
      [{ text: "OK", onPress: () => { onSuccess(); onClose(); } }]
    );
  };

  const totalSelected = commandes.filter(c => checked[c.id])
    .reduce((s, c) => s + Number(c.montantTotal), 0);

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.root}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Colisage</Text>
            <Text style={styles.headerSub}>Authentification de prise en charge</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
          {/* Info */}
          <View style={styles.infoBanner}>
            <Feather name="package" size={16} color="#f97316" />
            <Text style={styles.infoText}>
              Vérifiez les colis avant départ et signez pour confirmer la prise en charge.
            </Text>
          </View>

          {/* Commandes à coliser */}
          <Text style={styles.sectionLabel}>Commandes à enlever</Text>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginVertical: 24 }} />
          ) : commandes.length === 0 ? (
            <View style={styles.emptyBox}>
              <Feather name="check-circle" size={32} color="#22c55e" />
              <Text style={styles.emptyText}>Aucun colis en attente</Text>
              <Text style={styles.emptySub}>Toutes les commandes ont été prises en charge</Text>
            </View>
          ) : (
            commandes.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.commandeCard, !checked[c.id] && styles.commandeCardUnchecked]}
                onPress={() => setChecked(prev => ({ ...prev, [c.id]: !prev[c.id] }))}
              >
                <View style={styles.commandeRow}>
                  <View style={[styles.checkbox, checked[c.id] && styles.checkboxChecked]}>
                    {checked[c.id] && <Feather name="check" size={12} color="#fff" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commandeNom}>{c.boutique?.nom || "Boutique"}</Text>
                    <Text style={styles.commandeRef}>
                      BC-{String(c.id).padStart(5, "0")} · {c.boutique?.adresse || ""}
                    </Text>
                    <View style={styles.itemsList}>
                      {(c.items || []).slice(0, 3).map((it, i) => (
                        <Text key={i} style={styles.itemLine}>
                          • {it.produit?.nom || "Produit"} — {it.quantite} {it.produit?.unite || "u."}
                        </Text>
                      ))}
                      {(c.items || []).length > 3 && (
                        <Text style={styles.itemLine}>+ {(c.items || []).length - 3} autre(s)</Text>
                      )}
                    </View>
                  </View>
                  <Text style={styles.commandeMontant}>{fmt(Number(c.montantTotal))}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}

          {/* Récapitulatif */}
          {selectedIds.length > 0 && (
            <View style={styles.recap}>
              <Text style={styles.recapLabel}>{selectedIds.length} colis sélectionné(s)</Text>
              <Text style={styles.recapTotal}>{fmt(totalSelected)}</Text>
            </View>
          )}

          {/* Signature pad */}
          {commandes.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>Signature du chauffeur</Text>
              <View style={styles.sigContainer}>
                {Platform.OS === "web" ? (
                  <canvas
                    id="colisage-sig-canvas"
                    width={320}
                    height={140}
                    style={{ width: "100%", height: 140, cursor: "crosshair", borderRadius: 12, background: "#0f172a" } as any}
                  />
                ) : (
                  <View style={styles.sigPlaceholder}>
                    <Feather name="edit-3" size={24} color="#475569" />
                    <Text style={styles.sigPlaceholderText}>Signez ici (disponible sur web)</Text>
                  </View>
                )}
                {!signed && Platform.OS === "web" && (
                  <Text style={styles.sigHint}>Signez dans la zone ci-dessus</Text>
                )}
                {signed && (
                  <TouchableOpacity onPress={clearSig} style={styles.clearBtn}>
                    <Feather name="trash-2" size={14} color="#94a3b8" />
                    <Text style={styles.clearBtnText}>Effacer la signature</Text>
                  </TouchableOpacity>
                )}
              </View>
            </>
          )}
        </ScrollView>

        {/* Footer CTA */}
        {commandes.length > 0 && (
          <View style={styles.footer}>
            <TouchableOpacity
              style={[styles.submitBtn, (!signed && Platform.OS === "web") && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting || (!signed && Platform.OS === "web")}
            >
              {submitting
                ? <ActivityIndicator color="#fff" />
                : <>
                    <Feather name="check-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.submitBtnText}>
                      Valider le colisage ({selectedIds.length} colis)
                    </Text>
                  </>
              }
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: "#1e293b" },
  headerTitle: { color: "#fff", fontSize: 20, fontWeight: "700" },
  headerSub: { color: "#64748b", fontSize: 13, marginTop: 2 },
  closeBtn: { padding: 8, backgroundColor: "#1e293b", borderRadius: 10 },
  scroll: { flex: 1 },
  infoBanner: { flexDirection: "row", alignItems: "flex-start", gap: 10, backgroundColor: "#f9731615", borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: "#f9731630" },
  infoText: { color: "#94a3b8", fontSize: 13, flex: 1, lineHeight: 19 },
  sectionLabel: { color: "#64748b", fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12, marginTop: 4 },
  emptyBox: { alignItems: "center", padding: 32, gap: 8 },
  emptyText: { color: "#fff", fontSize: 16, fontWeight: "600", marginTop: 8 },
  emptySub: { color: "#64748b", fontSize: 13, textAlign: "center" },
  commandeCard: { backgroundColor: "#1e293b", borderRadius: 16, padding: 16, marginBottom: 10, borderWidth: 1, borderColor: "#334155" },
  commandeCardUnchecked: { opacity: 0.5 },
  commandeRow: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 2, borderColor: "#475569", marginTop: 2, alignItems: "center", justifyContent: "center" },
  checkboxChecked: { backgroundColor: "#f97316", borderColor: "#f97316" },
  commandeNom: { color: "#fff", fontWeight: "700", fontSize: 15 },
  commandeRef: { color: "#64748b", fontSize: 12, marginTop: 2 },
  itemsList: { marginTop: 8, gap: 2 },
  itemLine: { color: "#94a3b8", fontSize: 12 },
  commandeMontant: { color: "#f97316", fontWeight: "800", fontSize: 15, marginLeft: 8 },
  recap: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#0f172a", borderRadius: 12, padding: 14, marginTop: 4, marginBottom: 20, borderWidth: 1, borderColor: "#334155" },
  recapLabel: { color: "#94a3b8", fontSize: 13, fontWeight: "600" },
  recapTotal: { color: "#f97316", fontSize: 18, fontWeight: "800" },
  sigContainer: { backgroundColor: "#1e293b", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#334155", marginBottom: 24, alignItems: "center" },
  sigPlaceholder: { width: "100%", height: 140, alignItems: "center", justifyContent: "center", gap: 8 },
  sigPlaceholderText: { color: "#475569", fontSize: 14 },
  sigHint: { color: "#475569", fontSize: 12, marginTop: 8 },
  clearBtn: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 12, padding: 8 },
  clearBtnText: { color: "#94a3b8", fontSize: 13 },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 20, paddingBottom: 34, backgroundColor: "#0f172a", borderTopWidth: 1, borderTopColor: "#1e293b" },
  submitBtn: { backgroundColor: "#f97316", borderRadius: 16, padding: 18, flexDirection: "row", alignItems: "center", justifyContent: "center" },
  submitBtnDisabled: { opacity: 0.5 },
  submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
