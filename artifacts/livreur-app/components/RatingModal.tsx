import React, { useState } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, TextInput,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

interface Props {
  visible: boolean;
  onClose: () => void;
  grossisteId: number;
  chauffeurId: number;
  boutiqueId: number;
  boutiqueNom: string;
  tourneeId?: number;
}

export function RatingModal({ visible, onClose, grossisteId, chauffeurId, boutiqueId, boutiqueNom, tourneeId }: Props) {
  const [scoreChauffeur, setScoreChauffeur] = useState(0);
  const [scoreBoutique, setScoreBoutique] = useState(0);
  const [commentaireChauffeur, setCommentaireChauffeur] = useState("");
  const [commentaireBoutique, setCommentaireBoutique] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const handleSave = async () => {
    if (scoreChauffeur === 0) { Alert.alert("Note requise", "Veuillez donner une note à la boutique."); return; }
    setSaving(true);
    try {
      await fetch(`${BASE_URL}/grossistes/${grossisteId}/innovations/ratings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chauffeurId, boutiqueId, tourneeId: tourneeId ?? null,
          type: "boutique_by_chauffeur", score: scoreChauffeur, commentaire: commentaireChauffeur || null,
        }),
      });
      if (scoreBoutique > 0) {
        await fetch(`${BASE_URL}/grossistes/${grossisteId}/innovations/ratings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chauffeurId, boutiqueId, tourneeId: tourneeId ?? null,
            type: "chauffeur_by_boutique", score: scoreBoutique, commentaire: commentaireBoutique || null,
          }),
        });
      }
      setDone(true);
    } catch {
      Alert.alert("Erreur", "Impossible d'enregistrer la notation.");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setScoreChauffeur(0); setScoreBoutique(0);
    setCommentaireChauffeur(""); setCommentaireBoutique("");
    setDone(false);
    onClose();
  };

  function StarRow({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
    return (
      <View style={styles.starSection}>
        <Text style={styles.starLabel}>{label}</Text>
        <View style={styles.stars}>
          {[1,2,3,4,5].map(i => (
            <TouchableOpacity key={i} onPress={() => onChange(i)} style={styles.starBtn}>
              <Feather name="star" size={32} color={i <= value ? "#f59e0b" : "#e2e8f0"} />
            </TouchableOpacity>
          ))}
        </View>
        {value > 0 && (
          <Text style={styles.scoreLabel}>
            {value === 1 ? "😞 Très mauvais" : value === 2 ? "😕 Mauvais" : value === 3 ? "😐 Moyen" : value === 4 ? "😊 Bien" : "🤩 Excellent"}
          </Text>
        )}
      </View>
    );
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Notation mutuelle</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color={Colors.slate} />
          </TouchableOpacity>
        </View>

        {done ? (
          <View style={styles.doneContainer}>
            <View style={styles.doneIcon}>
              <Feather name="check-circle" size={64} color={Colors.green} />
            </View>
            <Text style={styles.doneTitle}>Notation enregistrée !</Text>
            <Text style={styles.doneSubtitle}>Merci pour votre retour. Ces informations améliorent la qualité du réseau LiviPro.</Text>
            <TouchableOpacity style={styles.doneBtn} onPress={handleClose}>
              <Text style={styles.doneBtnText}>Fermer</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <View style={styles.boutiqueChip}>
              <Feather name="map-pin" size={14} color={Colors.primary} />
              <Text style={styles.boutiqueNom}>{boutiqueNom}</Text>
            </View>

            <StarRow value={scoreChauffeur} onChange={setScoreChauffeur} label="Notez cette boutique (disponibilité, accueil, paiement)" />
            <TextInput
              style={styles.textInput}
              placeholder="Commentaire optionnel sur la boutique..."
              multiline numberOfLines={2}
              value={commentaireChauffeur}
              onChangeText={setCommentaireChauffeur}
              placeholderTextColor={Colors.slateLight}
            />

            <View style={styles.divider} />
            <Text style={styles.optionalSection}>Section optionnelle — Note que la boutique vous donnerait</Text>
            <StarRow value={scoreBoutique} onChange={setScoreBoutique} label="Simulation note boutique → chauffeur" />
            <TextInput
              style={styles.textInput}
              placeholder="Commentaire de la boutique (optionnel)..."
              multiline numberOfLines={2}
              value={commentaireBoutique}
              onChangeText={setCommentaireBoutique}
              placeholderTextColor={Colors.slateLight}
            />

            <TouchableOpacity
              style={[styles.saveBtn, scoreChauffeur === 0 && styles.saveBtnDisabled]}
              onPress={handleSave}
              disabled={saving || scoreChauffeur === 0}
            >
              {saving ? <ActivityIndicator color="white" /> : (
                <><Feather name="star" size={18} color="white" style={{ marginRight: 8 }} /><Text style={styles.saveBtnText}>Enregistrer les notes</Text></>
              )}
            </TouchableOpacity>
            <View style={{ height: 32 }} />
          </ScrollView>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  title: { fontSize: 18, fontWeight: "700", color: Colors.navy },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1, padding: 20 },
  boutiqueChip: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#fff7ed", borderWidth: 1, borderColor: "#fed7aa", borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, alignSelf: "flex-start", marginBottom: 20 },
  boutiqueNom: { fontSize: 14, fontWeight: "600", color: Colors.primary },
  starSection: { marginBottom: 12 },
  starLabel: { fontSize: 14, fontWeight: "600", color: Colors.navy, marginBottom: 10 },
  stars: { flexDirection: "row", gap: 8 },
  starBtn: { padding: 4 },
  scoreLabel: { fontSize: 14, color: Colors.slate, marginTop: 6 },
  textInput: { borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, padding: 12, fontSize: 14, color: Colors.navy, marginBottom: 16, minHeight: 64, textAlignVertical: "top" },
  divider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 20 },
  optionalSection: { fontSize: 12, color: Colors.slateLight, marginBottom: 12, fontStyle: "italic" },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", marginTop: 8 },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
  doneContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 40 },
  doneIcon: { marginBottom: 20 },
  doneTitle: { fontSize: 22, fontWeight: "700", color: Colors.navy, marginBottom: 8 },
  doneSubtitle: { fontSize: 14, color: Colors.slate, textAlign: "center", lineHeight: 22 },
  doneBtn: { marginTop: 32, backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32 },
  doneBtnText: { color: "white", fontSize: 16, fontWeight: "700" },
});
