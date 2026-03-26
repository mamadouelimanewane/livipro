import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, StyleSheet, TouchableOpacity, Modal,
  Animated, Platform, ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface VoiceCommand {
  text: string;
  action: string;
  timestamp: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onCommand: (action: string, data: Record<string, any>) => void;
  boutiquesDisponibles?: string[];
}

const EXEMPLES = [
  "Livraison validée boutique Diallo, paiement Wave 85 000",
  "Boutique fermée, noter comme échec",
  "Litige boutique Ndiaye, montant 50 000",
  "Passer à l'arrêt suivant",
  "Photo prise pour boutique Al-Amine",
];

function parseCommande(text: string): { action: string; data: Record<string, any> } {
  const t = text.toLowerCase();
  if (t.includes("livraison validée") || t.includes("livraison ok") || t.includes("livré")) {
    const montantMatch = text.match(/(\d[\d\s]*)\s*(fcfa|f|franc)?/i);
    const montant = montantMatch ? parseInt(montantMatch[1].replace(/\s/g, "")) : null;
    const methode = t.includes("wave") ? "Wave" : t.includes("orange") ? "Orange Money" : t.includes("espèce") || t.includes("cash") ? "Espèces" : "non précisé";
    return { action: "LIVREE", data: { montant, methode } };
  }
  if (t.includes("fermé") || t.includes("absent") || t.includes("échec") || t.includes("echeC")) {
    return { action: "ECHEC", data: {} };
  }
  if (t.includes("litige") || t.includes("problème") || t.includes("incident")) {
    return { action: "LITIGE", data: {} };
  }
  if (t.includes("suivant") || t.includes("prochain") || t.includes("next")) {
    return { action: "NEXT", data: {} };
  }
  if (t.includes("photo") || t.includes("preuve")) {
    return { action: "PHOTO", data: {} };
  }
  if (t.includes("scanner") || t.includes("code-barre") || t.includes("code barre")) {
    return { action: "SCAN", data: {} };
  }
  return { action: "UNKNOWN", data: { text } };
}

function getActionLabel(action: string, data: Record<string, any>): { label: string; color: string; icon: string } {
  switch (action) {
    case "LIVREE": return { label: `✅ Livraison validée${data.montant ? ` — ${data.montant.toLocaleString("fr-FR")} FCFA` : ""}${data.methode && data.methode !== "non précisé" ? ` (${data.methode})` : ""}`, color: Colors.green, icon: "check-circle" };
    case "ECHEC": return { label: "❌ Marqué comme échec (boutique fermée)", color: Colors.red, icon: "x-circle" };
    case "LITIGE": return { label: "⚠️ Litige déclaré", color: "#f59e0b", icon: "alert-triangle" };
    case "NEXT": return { label: "➡️ Passage à l'arrêt suivant", color: Colors.primary, icon: "arrow-right" };
    case "PHOTO": return { label: "📷 Ouverture appareil photo", color: Colors.primary, icon: "camera" };
    case "SCAN": return { label: "📦 Ouverture scanner", color: Colors.primary, icon: "maximize" };
    default: return { label: "❓ Commande non reconnue — réessayez", color: Colors.slateLight, icon: "help-circle" };
  }
}

export function VoiceAssistant({ visible, onClose, onCommand, boutiquesDisponibles = [] }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState<VoiceCommand | null>(null);
  const [history, setHistory] = useState<VoiceCommand[]>([]);
  const [statusMsg, setStatusMsg] = useState("Appuyez sur le micro pour parler");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recognitionRef = useRef<any>(null);

  const isWeb = Platform.OS === "web";

  useEffect(() => {
    if (!visible) { stopListening(); setTranscript(""); }
  }, [visible]);

  useEffect(() => {
    if (isListening) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isListening]);

  const startListening = () => {
    if (!isWeb) {
      setStatusMsg("L'assistant vocal est disponible sur web (ou via React Native Voice sur mobile)");
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusMsg("Votre navigateur ne supporte pas la reconnaissance vocale. Essayez Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onstart = () => { setIsListening(true); setStatusMsg("Écoute en cours... parlez maintenant !"); };
    recognition.onresult = (event: any) => {
      const text = Array.from(event.results).map((r: any) => r[0].transcript).join(" ");
      setTranscript(text);
      if (event.results[event.results.length - 1].isFinal) {
        const { action, data } = parseCommande(text);
        const cmd: VoiceCommand = { text, action, timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
        setLastCommand(cmd);
        setHistory(prev => [cmd, ...prev.slice(0, 9)]);
        if (action !== "UNKNOWN") onCommand(action, data);
        setStatusMsg("Commande reconnue !");
      }
    };
    recognition.onerror = (e: any) => { setStatusMsg(`Erreur : ${e.error}. Réessayez.`); setIsListening(false); };
    recognition.onend = () => { setIsListening(false); if (statusMsg === "Écoute en cours... parlez maintenant !") setStatusMsg("Appuyez sur le micro pour parler"); };
    recognition.start();
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  const handleMicPress = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const useExemple = (ex: string) => {
    setTranscript(ex);
    const { action, data } = parseCommande(ex);
    const cmd: VoiceCommand = { text: ex, action, timestamp: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) };
    setLastCommand(cmd);
    setHistory(prev => [cmd, ...prev.slice(0, 9)]);
    if (action !== "UNKNOWN") onCommand(action, data);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.aiDot} />
            <Text style={styles.title}>Assistant Vocal</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Feather name="x" size={22} color={Colors.slate} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.micArea}>
            <Text style={styles.statusMsg}>{statusMsg}</Text>
            <Animated.View style={[styles.micRing, { transform: [{ scale: pulseAnim }] }]}>
              <TouchableOpacity style={[styles.micBtn, isListening && styles.micBtnActive]} onPress={handleMicPress}>
                <Feather name={isListening ? "mic-off" : "mic"} size={40} color="white" />
              </TouchableOpacity>
            </Animated.View>
            {transcript ? (
              <View style={styles.transcriptBox}>
                <Text style={styles.transcriptLabel}>Transcription :</Text>
                <Text style={styles.transcriptText}>"{transcript}"</Text>
              </View>
            ) : null}
          </View>

          {lastCommand && (() => {
            const { label, color, icon } = getActionLabel(lastCommand.action, {});
            return (
              <View style={[styles.resultCard, { borderColor: color }]}>
                <Feather name={icon as any} size={20} color={color} />
                <Text style={[styles.resultText, { color }]}>{label}</Text>
              </View>
            );
          })()}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Commandes vocales reconnues</Text>
            <View style={styles.commandsGrid}>
              {[
                { ex: "Livraison validée, paiement Wave 85 000", icon: "check-circle", color: Colors.green },
                { ex: "Boutique fermée, noter échec", icon: "x-circle", color: Colors.red },
                { ex: "Passer à l'arrêt suivant", icon: "arrow-right", color: Colors.primary },
                { ex: "Déclarer un litige", icon: "alert-triangle", color: "#f59e0b" },
                { ex: "Prendre une photo", icon: "camera", color: Colors.primary },
                { ex: "Ouvrir le scanner", icon: "maximize", color: Colors.primary },
              ].map((c, i) => (
                <TouchableOpacity key={i} style={styles.commandChip} onPress={() => useExemple(c.ex)}>
                  <Feather name={c.icon as any} size={14} color={c.color} />
                  <Text style={styles.commandChipText}>{c.ex}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {history.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historique de session</Text>
              {history.map((h, i) => {
                const { label, color } = getActionLabel(h.action, {});
                return (
                  <View key={i} style={styles.historyItem}>
                    <Text style={styles.historyTime}>{h.timestamp}</Text>
                    <Text style={[styles.historyAction, { color }]}>{label}</Text>
                    <Text style={styles.historyText}>"{h.text}"</Text>
                  </View>
                );
              })}
            </View>
          )}

          <View style={{ height: 32 }} />
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  aiDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primary },
  title: { fontSize: 18, fontWeight: "700", color: Colors.navy },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#f8fafc", alignItems: "center", justifyContent: "center" },
  scroll: { flex: 1 },
  micArea: { alignItems: "center", paddingVertical: 32, paddingHorizontal: 20 },
  statusMsg: { fontSize: 14, color: Colors.slate, marginBottom: 24, textAlign: "center" },
  micRing: { width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(249,115,22,0.12)", alignItems: "center", justifyContent: "center", marginBottom: 24 },
  micBtn: { width: 88, height: 88, borderRadius: 44, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", shadowColor: Colors.primary, shadowOpacity: 0.4, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  micBtnActive: { backgroundColor: Colors.red },
  transcriptBox: { backgroundColor: "#f8fafc", borderRadius: 12, padding: 14, width: "100%", marginTop: 4 },
  transcriptLabel: { fontSize: 11, color: Colors.slateLight, marginBottom: 4, fontWeight: "600", textTransform: "uppercase" },
  transcriptText: { fontSize: 16, color: Colors.navy, fontStyle: "italic" },
  resultCard: { marginHorizontal: 20, marginBottom: 16, flexDirection: "row", alignItems: "center", gap: 10, padding: 14, borderRadius: 14, borderWidth: 1.5, backgroundColor: "#f8fafc" },
  resultText: { fontSize: 14, fontWeight: "600", flex: 1 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: Colors.slateLight, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 },
  commandsGrid: { gap: 8 },
  commandChip: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#f8fafc", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: "#e2e8f0" },
  commandChipText: { fontSize: 13, color: Colors.slate, flex: 1 },
  historyItem: { marginBottom: 10, padding: 10, backgroundColor: "#f8fafc", borderRadius: 10 },
  historyTime: { fontSize: 10, color: Colors.slateLight, marginBottom: 2 },
  historyAction: { fontSize: 12, fontWeight: "600", marginBottom: 2 },
  historyText: { fontSize: 12, color: Colors.slate, fontStyle: "italic" },
});
