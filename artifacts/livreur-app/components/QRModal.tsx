import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import QRCode from "react-native-qrcode-svg";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const { width: SCREEN_W } = Dimensions.get("window");

interface Props {
  visible: boolean;
  boutiqueName: string;
  montant: number;
  tourneeId: string;
  onConfirm: () => void;
  onClose: () => void;
}

type PaymentMethod = "wave" | "orange_money" | "free_money" | "especes";

const PAYMENT_METHODS: { id: PaymentMethod; label: string; icon: string; color: string }[] = [
  { id: "wave", label: "Wave", icon: "wifi", color: "#0057FF" },
  { id: "orange_money", label: "Orange Money", icon: "smartphone", color: "#FF6900" },
  { id: "free_money", label: "Free Money", icon: "credit-card", color: "#E30613" },
  { id: "especes", label: "Espèces", icon: "dollar-sign", color: Colors.green },
];

export function QRModal({ visible, boutiqueName, montant, tourneeId, onConfirm, onClose }: Props) {
  const [method, setMethod] = useState<PaymentMethod>("wave");

  const qrValue = JSON.stringify({
    livipro: true,
    tournee: tourneeId,
    boutique: boutiqueName,
    montant,
    methode: method,
    timestamp: Date.now(),
  });

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Paiement Mobile</Text>
              <Text style={styles.subtitle}>{boutiqueName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={Colors.slate} />
            </TouchableOpacity>
          </View>

          <View style={styles.amountBox}>
            <Text style={styles.amountLabel}>Montant à payer</Text>
            <Text style={styles.amountValue}>{montant.toLocaleString("fr-FR")} FCFA</Text>
          </View>

          <Text style={styles.sectionLabel}>Mode de paiement</Text>
          <View style={styles.methodGrid}>
            {PAYMENT_METHODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                style={[styles.methodBtn, method === m.id && { borderColor: m.color, backgroundColor: m.color + "12" }]}
                onPress={() => setMethod(m.id)}
              >
                <Feather name={m.icon as any} size={16} color={method === m.id ? m.color : Colors.slate} />
                <Text style={[styles.methodLabel, method === m.id && { color: m.color }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {method !== "especes" ? (
            <View style={styles.qrContainer}>
              <QRCode
                value={qrValue}
                size={SCREEN_W * 0.45}
                color={Colors.navy}
                backgroundColor="#fff"
              />
              <Text style={styles.qrHint}>
                Faites scanner ce code par le responsable de la boutique
              </Text>
            </View>
          ) : (
            <View style={styles.especesBox}>
              <Feather name="dollar-sign" size={36} color={Colors.green} />
              <Text style={styles.especesText}>
                Collectez {montant.toLocaleString("fr-FR")} FCFA en espèces
              </Text>
            </View>
          )}

          <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
            <Feather name="check-circle" size={16} color="#fff" />
            <Text style={styles.confirmBtnText}>Paiement confirmé</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 36,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: "center",
    marginBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.navy },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.slate, marginTop: 2 },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  amountBox: {
    backgroundColor: Colors.navy,
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 20,
  },
  amountLabel: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.slateLight, marginBottom: 4 },
  amountValue: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.slate,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  methodGrid: { flexDirection: "row", gap: 8, marginBottom: 20, flexWrap: "wrap" },
  methodBtn: {
    flex: 1,
    minWidth: "22%",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  methodLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", color: Colors.slate, textAlign: "center" },
  qrContainer: {
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
    marginBottom: 20,
  },
  qrHint: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    color: Colors.slate,
    textAlign: "center",
    maxWidth: 220,
  },
  especesBox: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 12,
    marginBottom: 20,
    backgroundColor: Colors.green + "10",
    borderRadius: 16,
  },
  especesText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    color: Colors.navy,
    textAlign: "center",
  },
  confirmBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: Colors.green,
  },
  confirmBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
