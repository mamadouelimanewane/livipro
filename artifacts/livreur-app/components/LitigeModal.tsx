import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface Props {
  visible: boolean;
  boutiqueName: string;
  montant: number;
  onConfirm: (data: { motif: string; nbCasses: number; newMontant: number }) => void;
  onClose: () => void;
}

const MOTIFS = [
  { id: "casse", label: "Casse déchargement", icon: "package" },
  { id: "refus", label: "Refus de commande", icon: "x-circle" },
  { id: "ferme", label: "Boutique fermée", icon: "lock" },
  { id: "qualite", label: "Problème qualité", icon: "alert-triangle" },
  { id: "autre", label: "Autre motif", icon: "more-horizontal" },
];

export function LitigeModal({ visible, boutiqueName, montant, onConfirm, onClose }: Props) {
  const [motif, setMotif] = useState("casse");
  const [nbCasses, setNbCasses] = useState(0);
  const [note, setNote] = useState("");

  const deductionParCaisse = 10000;
  const deduction = nbCasses * deductionParCaisse;
  const newMontant = Math.max(0, montant - deduction);

  const confirm = () => {
    onConfirm({ motif, nbCasses, newMontant });
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Signaler un Litige</Text>
              <Text style={styles.subtitle}>{boutiqueName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={Colors.slate} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionLabel}>Type de litige</Text>
            <View style={styles.motifGrid}>
              {MOTIFS.map((m) => (
                <TouchableOpacity
                  key={m.id}
                  style={[styles.motifBtn, motif === m.id && styles.motifBtnActive]}
                  onPress={() => setMotif(m.id)}
                >
                  <Feather
                    name={m.icon as any}
                    size={16}
                    color={motif === m.id ? Colors.red : Colors.slate}
                  />
                  <Text style={[styles.motifLabel, motif === m.id && styles.motifLabelActive]}>
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {motif === "casse" && (
              <>
                <Text style={styles.sectionLabel}>Nombre de casses</Text>
                <View style={styles.counter}>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setNbCasses((n) => Math.max(0, n - 1))}
                  >
                    <Feather name="minus" size={20} color={Colors.navy} />
                  </TouchableOpacity>
                  <View style={styles.counterValue}>
                    <Text style={styles.counterNum}>{nbCasses}</Text>
                    <Text style={styles.counterUnit}>cartons</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.counterBtn}
                    onPress={() => setNbCasses((n) => n + 1)}
                  >
                    <Feather name="plus" size={20} color={Colors.navy} />
                  </TouchableOpacity>
                </View>

                {nbCasses > 0 && (
                  <View style={styles.deductionBox}>
                    <View style={styles.deductionRow}>
                      <Text style={styles.deductionLabel}>Montant initial</Text>
                      <Text style={styles.deductionVal}>{montant.toLocaleString("fr-FR")} F</Text>
                    </View>
                    <View style={styles.deductionRow}>
                      <Text style={[styles.deductionLabel, { color: Colors.red }]}>Déduction casse</Text>
                      <Text style={[styles.deductionVal, { color: Colors.red }]}>
                        − {deduction.toLocaleString("fr-FR")} F
                      </Text>
                    </View>
                    <View style={[styles.deductionRow, styles.deductionTotal]}>
                      <Text style={styles.deductionLabelBold}>Nouveau total</Text>
                      <Text style={styles.deductionValBold}>
                        {newMontant.toLocaleString("fr-FR")} F
                      </Text>
                    </View>
                  </View>
                )}
              </>
            )}

            <Text style={styles.sectionLabel}>Note (optionnelle)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Décrivez le problème rencontré..."
              placeholderTextColor={Colors.slateLight}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirm}>
                <Feather name="alert-circle" size={16} color="#fff" />
                <Text style={styles.confirmBtnText}>Confirmer le litige</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
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
    maxHeight: "90%",
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
    marginBottom: 20,
  },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.navy },
  subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.slate, marginTop: 2 },
  closeBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: "center", justifyContent: "center",
  },
  sectionLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.slate,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
    marginTop: 4,
  },
  motifGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  motifBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: "#fff",
  },
  motifBtnActive: {
    borderColor: Colors.red,
    backgroundColor: Colors.red + "10",
  },
  motifLabel: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.slate },
  motifLabelActive: { color: Colors.red },
  counter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.background,
    marginBottom: 16,
  },
  counterBtn: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.border,
    alignItems: "center", justifyContent: "center",
  },
  counterValue: { alignItems: "center" },
  counterNum: { fontSize: 32, fontFamily: "Inter_700Bold", color: Colors.navy },
  counterUnit: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slate },
  deductionBox: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    marginBottom: 16,
  },
  deductionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  deductionTotal: {
    backgroundColor: Colors.navy,
    borderBottomWidth: 0,
  },
  deductionLabel: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.slate },
  deductionVal: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.navy },
  deductionLabelBold: { fontSize: 13, fontFamily: "Inter_700Bold", color: "#fff" },
  deductionValBold: { fontSize: 15, fontFamily: "Inter_700Bold", color: Colors.green },
  textInput: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    padding: 14,
    fontFamily: "Inter_400Regular",
    fontSize: 14,
    color: Colors.navy,
    textAlignVertical: "top",
    minHeight: 80,
    marginBottom: 20,
  },
  actions: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.slate },
  confirmBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.red,
  },
  confirmBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
});
