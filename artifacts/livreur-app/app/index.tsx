import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

const BASE_URL = `https://${process.env.EXPO_PUBLIC_DOMAIN}/api`;

interface Grossiste { id: number; nom: string; ville: string; statut: string; }
interface Chauffeur { id: number; nom: string; prenom: string; telephone: string; statut: string; }

function fetchGrossistes(): Promise<Grossiste[]> {
  return fetch(`${BASE_URL}/admin/grossistes`).then((r) => r.json());
}
function fetchChauffeurs(id: number): Promise<Chauffeur[]> {
  return fetch(`${BASE_URL}/grossistes/${id}/chauffeurs`).then((r) => r.json());
}

type Step = "grossiste" | "chauffeur" | "pin_set" | "pin_verify";

const PIN_LEN = 4;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<Step>("grossiste");
  const [selectedGrossisteId, setSelectedGrossisteId] = useState<number | null>(null);
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(null);
  const [pin, setPin] = useState("");
  const [pinConfirm, setPinConfirm] = useState("");
  const [pinStage, setPinStage] = useState<"first" | "confirm">("first");
  const [pinError, setPinError] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);

  // Auto-login if session exists
  useEffect(() => {
    AsyncStorage.multiGet(["grossisteId", "chauffeurId", "chauffeurNom"]).then(
      ([[, gId], [, cId], [, nom]]) => {
        if (gId && cId && nom) router.replace("/(main)" as never);
      }
    );
  }, []);

  const { data: grossistes = [], isLoading: loadingG } = useQuery({
    queryKey: ["grossistes"],
    queryFn: fetchGrossistes,
  });
  const { data: chauffeurs = [], isLoading: loadingC } = useQuery({
    queryKey: ["chauffeurs", selectedGrossisteId],
    queryFn: () => fetchChauffeurs(selectedGrossisteId!),
    enabled: !!selectedGrossisteId,
  });

  const activeGrossiste = grossistes.find((g) => g.id === selectedGrossisteId);

  const handleGrossisteSelect = (g: Grossiste) => {
    setSelectedGrossisteId(g.id);
    setStep("chauffeur");
  };

  const handleChauffeurSelect = async (c: Chauffeur) => {
    setSelectedChauffeur(c);
    const storedPin = await AsyncStorage.getItem(`pin_${c.id}`);
    if (storedPin) {
      setIsNewUser(false);
      setStep("pin_verify");
    } else {
      setIsNewUser(true);
      setPinStage("first");
      setStep("pin_set");
    }
    setPin("");
    setPinConfirm("");
    setPinError("");
  };

  const handlePinDigit = (d: string) => {
    if (Platform.OS !== "web") Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step === "pin_verify") {
      const next = (pin + d).slice(0, PIN_LEN);
      setPin(next);
      if (next.length === PIN_LEN) setTimeout(() => verifyPin(next), 120);
    } else {
      if (pinStage === "first") {
        const next = (pin + d).slice(0, PIN_LEN);
        setPin(next);
        if (next.length === PIN_LEN) {
          setTimeout(() => {
            setPinStage("confirm");
            setPinConfirm("");
            setPinError("");
          }, 120);
        }
      } else {
        const next = (pinConfirm + d).slice(0, PIN_LEN);
        setPinConfirm(next);
        if (next.length === PIN_LEN) setTimeout(() => confirmPin(pin, next), 120);
      }
    }
  };

  const handlePinDelete = () => {
    if (step === "pin_verify") setPin((p) => p.slice(0, -1));
    else if (pinStage === "first") setPin((p) => p.slice(0, -1));
    else setPinConfirm((p) => p.slice(0, -1));
  };

  const verifyPin = async (entered: string) => {
    const stored = await AsyncStorage.getItem(`pin_${selectedChauffeur!.id}`);
    if (entered === stored) {
      await saveSession();
    } else {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPinError("PIN incorrect. Réessayez.");
      setPin("");
    }
  };

  const confirmPin = async (first: string, second: string) => {
    if (first !== second) {
      if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setPinError("Les PINs ne correspondent pas. Recommencez.");
      setPin("");
      setPinConfirm("");
      setPinStage("first");
    } else {
      await AsyncStorage.setItem(`pin_${selectedChauffeur!.id}`, first);
      await saveSession();
    }
  };

  const saveSession = async () => {
    if (Platform.OS !== "web") Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const fullName = `${selectedChauffeur!.prenom} ${selectedChauffeur!.nom}`;
    await AsyncStorage.multiSet([
      ["grossisteId", String(selectedGrossisteId)],
      ["chauffeurId", String(selectedChauffeur!.id)],
      ["chauffeurNom", fullName],
    ]);
    router.replace("/(main)" as never);
  };

  const currentPinValue = step === "pin_verify" ? pin : pinStage === "first" ? pin : pinConfirm;
  const currentPinLen = currentPinValue.length;

  const pinTitle = step === "pin_set"
    ? pinStage === "first" ? "Créez votre PIN" : "Confirmez votre PIN"
    : "Entrez votre PIN";
  const pinSub = step === "pin_set"
    ? pinStage === "first"
      ? `Choisissez un code à ${PIN_LEN} chiffres`
      : `Saisissez à nouveau le même code`
    : `Bienvenue, ${selectedChauffeur?.prenom} !`;

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <LinearGradient colors={["#0f172a", "#1e293b"]} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
        <View style={styles.logoRow}>
          <View style={styles.logoBox}>
            <Feather name="truck" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.logoTitle}>LiviPro <Text style={styles.logoSub}>Distri</Text></Text>
            <Text style={styles.logoDesc}>Portail Chauffeur</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        {/* ── STEP: GROSSISTE ── */}
        {step === "grossiste" && (
          <>
            <View style={styles.stepHead}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>Étape 1 / 3</Text></View>
              <Text style={styles.stepTitle}>Votre Distributeur</Text>
              <Text style={styles.stepSub}>Sélectionnez votre espace de travail</Text>
            </View>
            {loadingG ? (
              <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {grossistes.filter((g) => g.statut === "actif").map((g) => (
                  <TouchableOpacity key={g.id} style={styles.row} onPress={() => handleGrossisteSelect(g)} activeOpacity={0.7}>
                    <View style={styles.rowIcon}><Feather name="package" size={17} color={Colors.primary} /></View>
                    <View style={styles.rowInfo}>
                      <Text style={styles.rowName}>{g.nom}</Text>
                      <Text style={styles.rowSub}><Feather name="map-pin" size={11} color={Colors.slate} /> {g.ville}</Text>
                    </View>
                    <Feather name="chevron-right" size={17} color={Colors.slateLight} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </>
        )}

        {/* ── STEP: CHAUFFEUR ── */}
        {step === "chauffeur" && (
          <>
            <TouchableOpacity style={styles.back} onPress={() => setStep("grossiste")}>
              <Feather name="arrow-left" size={15} color={Colors.slate} />
              <Text style={styles.backText}>{activeGrossiste?.nom}</Text>
            </TouchableOpacity>
            <View style={styles.stepHead}>
              <View style={styles.stepBadge}><Text style={styles.stepBadgeText}>Étape 2 / 3</Text></View>
              <Text style={styles.stepTitle}>Qui êtes-vous ?</Text>
              <Text style={styles.stepSub}>Identifiez-vous pour continuer</Text>
            </View>
            {loadingC ? (
              <View style={styles.center}><ActivityIndicator color={Colors.primary} size="large" /></View>
            ) : chauffeurs.length === 0 ? (
              <View style={styles.center}>
                <Feather name="user-x" size={36} color={Colors.slateLight} />
                <Text style={styles.emptyText}>Aucun chauffeur trouvé</Text>
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>
                {chauffeurs.map((c) => {
                  const fullName = `${c.prenom} ${c.nom}`;
                  const initials = fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
                  const available = c.statut !== "inactif";
                  return (
                    <TouchableOpacity key={c.id} style={[styles.row, !available && { opacity: 0.4 }]}
                      onPress={() => available && handleChauffeurSelect(c)} activeOpacity={available ? 0.7 : 1}>
                      <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
                      <View style={styles.rowInfo}>
                        <Text style={styles.rowName}>{fullName}</Text>
                        <Text style={styles.rowSub}>{c.telephone}</Text>
                      </View>
                      <View style={[styles.dot, {
                        backgroundColor: c.statut === "disponible" ? Colors.green : c.statut === "en_tournee" ? Colors.amber : Colors.slateLight
                      }]} />
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}
          </>
        )}

        {/* ── STEP: PIN ── */}
        {(step === "pin_set" || step === "pin_verify") && (
          <>
            <TouchableOpacity style={styles.back} onPress={() => {
              if (step === "pin_set" && pinStage === "confirm") {
                setPinStage("first"); setPin(""); setPinError("");
              } else {
                setStep("chauffeur"); setPin(""); setPinConfirm(""); setPinError("");
              }
            }}>
              <Feather name="arrow-left" size={15} color={Colors.slate} />
              <Text style={styles.backText}>Retour</Text>
            </TouchableOpacity>

            <View style={styles.pinSection}>
              <View style={styles.pinAvatar}>
                <Text style={styles.pinAvatarText}>
                  {selectedChauffeur?.prenom?.split(" ").map((w) => w[0]).join("").toUpperCase() ?? "?"}
                  {selectedChauffeur?.nom?.[0]?.toUpperCase() ?? ""}
                </Text>
              </View>
              <Text style={styles.pinTitle}>{pinTitle}</Text>
              <Text style={styles.pinSub}>{pinSub}</Text>

              {/* PIN dots */}
              <View style={styles.pinDots}>
                {Array.from({ length: PIN_LEN }).map((_, i) => (
                  <View key={i} style={[styles.pinDot, i < currentPinLen && styles.pinDotFilled]} />
                ))}
              </View>

              {pinError ? (
                <View style={styles.pinError}>
                  <Feather name="alert-circle" size={13} color={Colors.red} />
                  <Text style={styles.pinErrorText}>{pinError}</Text>
                </View>
              ) : null}

              {/* Numpad */}
              <View style={styles.numpad}>
                {["1","2","3","4","5","6","7","8","9","","0","⌫"].map((d, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.numKey, d === "" && { opacity: 0 }]}
                    onPress={() => d === "⌫" ? handlePinDelete() : d !== "" ? handlePinDigit(d) : null}
                    activeOpacity={0.6}
                    disabled={d === ""}
                  >
                    {d === "⌫"
                      ? <Feather name="delete" size={20} color={Colors.navy} />
                      : <Text style={styles.numKeyText}>{d}</Text>
                    }
                  </TouchableOpacity>
                ))}
              </View>

              {!isNewUser && (
                <TouchableOpacity onPress={() => Alert.alert("PIN oublié", "Demandez à votre gestionnaire de réinitialiser votre accès.")}>
                  <Text style={styles.forgotPin}>PIN oublié ?</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>

      <Text style={[styles.footer, { paddingBottom: insets.bottom + 10 }]}>LiviPro B2B — Distribution Logistique</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 24, paddingVertical: 24 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoBox: { width: 42, height: 42, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center", shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  logoTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff", letterSpacing: 0.5 },
  logoSub: { fontFamily: "Inter_400Regular", opacity: 0.7 },
  logoDesc: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slateLight, marginTop: 2 },
  card: { flex: 1, backgroundColor: "#fff", borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.07, shadowRadius: 12 },
  stepHead: { marginBottom: 18 },
  stepBadge: { backgroundColor: Colors.primary + "15", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3, alignSelf: "flex-start", marginBottom: 8 },
  stepBadgeText: { fontSize: 10, fontFamily: "Inter_700Bold", color: Colors.primary, textTransform: "uppercase", letterSpacing: 0.8 },
  stepTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: Colors.navy, marginBottom: 3 },
  stepSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.slate },
  center: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.slateLight },
  row: { flexDirection: "row", alignItems: "center", paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.border, gap: 12 },
  rowIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: Colors.primary + "12", alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.navy, marginBottom: 2 },
  rowSub: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slate },
  avatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.navyLight, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 12, fontFamily: "Inter_700Bold", color: "#fff" },
  dot: { width: 9, height: 9, borderRadius: 5 },
  back: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 16 },
  backText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.slate },
  pinSection: { flex: 1, alignItems: "center", paddingTop: 8 },
  pinAvatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.navyLight, alignItems: "center", justifyContent: "center", marginBottom: 14, borderWidth: 3, borderColor: Colors.primary },
  pinAvatarText: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  pinTitle: { fontSize: 20, fontFamily: "Inter_700Bold", color: Colors.navy, marginBottom: 4 },
  pinSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.slate, marginBottom: 24, textAlign: "center" },
  pinDots: { flexDirection: "row", gap: 16, marginBottom: 12 },
  pinDot: { width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.border, borderWidth: 2, borderColor: Colors.slateLight },
  pinDotFilled: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  pinError: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.red + "12", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginBottom: 12 },
  pinErrorText: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.red },
  numpad: { flexDirection: "row", flexWrap: "wrap", width: 264, gap: 0 },
  numKey: { width: 88, height: 72, alignItems: "center", justifyContent: "center" },
  numKeyText: { fontSize: 26, fontFamily: "Inter_400Regular", color: Colors.navy },
  forgotPin: { fontSize: 12, fontFamily: "Inter_500Medium", color: Colors.primary, marginTop: 16, textDecorationLine: "underline" },
  footer: { textAlign: "center", fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slateLight, paddingTop: 10 },
});
