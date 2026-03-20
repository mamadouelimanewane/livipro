import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Alert,
  Vibration,
  TextInput,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

interface Props {
  visible: boolean;
  onScan: (code: string) => void;
  onClose: () => void;
}

function ScannerViewNative({ onScan }: { onScan: (code: string) => void }) {
  const [CameraView, setCameraView] = useState<any>(null);

  useEffect(() => {
    import("expo-camera").then((mod) => {
      setCameraView(() => mod.CameraView);
    }).catch(() => setCameraView(null));
  }, []);

  if (!CameraView) {
    return (
      <View style={native.placeholder}>
        <Feather name="camera" size={40} color={Colors.slateLight} />
        <Text style={native.placeholderText}>Caméra non disponible</Text>
      </View>
    );
  }

  return (
    <CameraView
      style={{ flex: 1 }}
      facing="back"
      onBarcodeScanned={(result: any) => {
        Vibration.vibrate(100);
        onScan(result.data);
      }}
      barcodeScannerSettings={{
        barcodeTypes: ["ean13", "ean8", "code128", "code39", "qr", "datamatrix"],
      }}
    />
  );
}

export function ScannerModal({ visible, onScan, onClose }: Props) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [mode, setMode] = useState<"camera" | "manual">(Platform.OS === "web" ? "manual" : "camera");

  useEffect(() => {
    if (!visible) {
      setScanned(false);
      setManualCode("");
      return;
    }
    if (Platform.OS !== "web") {
      import("expo-camera").then((mod) => {
        mod.Camera.requestCameraPermissionsAsync().then(({ status }: any) => {
          setHasPermission(status === "granted");
          if (status !== "granted") setMode("manual");
        });
      }).catch(() => {
        setHasPermission(false);
        setMode("manual");
      });
    }
  }, [visible]);

  const handleScan = (code: string) => {
    if (scanned) return;
    setScanned(true);
    onScan(code);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim()) {
      Alert.alert("Code requis", "Saisissez un code produit à rechercher.");
      return;
    }
    handleScan(manualCode.trim().toUpperCase());
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Scanner un produit</Text>
            <Text style={styles.subtitle}>Vérification de la référence</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={20} color={Colors.slate} />
          </TouchableOpacity>
        </View>

        {/* Mode switcher */}
        <View style={styles.modeSwitcher}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === "camera" && styles.modeBtnActive]}
            onPress={() => setMode("camera")}
          >
            <Feather name="camera" size={14} color={mode === "camera" ? Colors.primary : Colors.slate} />
            <Text style={[styles.modeBtnText, mode === "camera" && styles.modeBtnTextActive]}>Caméra</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === "manual" && styles.modeBtnActive]}
            onPress={() => setMode("manual")}
          >
            <Feather name="edit-2" size={14} color={mode === "manual" ? Colors.primary : Colors.slate} />
            <Text style={[styles.modeBtnText, mode === "manual" && styles.modeBtnTextActive]}>Saisie manuelle</Text>
          </TouchableOpacity>
        </View>

        {mode === "camera" && Platform.OS !== "web" ? (
          <View style={styles.cameraContainer}>
            {hasPermission === false ? (
              <View style={styles.noPermission}>
                <Feather name="camera-off" size={40} color={Colors.slateLight} />
                <Text style={styles.noPermTitle}>Caméra non autorisée</Text>
                <Text style={styles.noPermText}>Autorisez l'accès à la caméra dans les paramètres de votre téléphone, ou utilisez la saisie manuelle.</Text>
                <TouchableOpacity style={styles.switchBtn} onPress={() => setMode("manual")}>
                  <Text style={styles.switchBtnText}>Saisie manuelle</Text>
                </TouchableOpacity>
              </View>
            ) : scanned ? (
              <View style={styles.scannedView}>
                <Feather name="check-circle" size={60} color={Colors.green} />
                <Text style={styles.scannedText}>Code scanné !</Text>
                <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
                  <Feather name="refresh-cw" size={14} color={Colors.primary} />
                  <Text style={styles.rescanText}>Scanner à nouveau</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <ScannerViewNative onScan={handleScan} />
                {/* Scanning overlay */}
                <View style={styles.scanOverlay} pointerEvents="none">
                  <View style={styles.scanTarget}>
                    <View style={[styles.corner, styles.cornerTL]} />
                    <View style={[styles.corner, styles.cornerTR]} />
                    <View style={[styles.corner, styles.cornerBL]} />
                    <View style={[styles.corner, styles.cornerBR]} />
                    <View style={styles.scanLine} />
                  </View>
                  <Text style={styles.scanHint}>Positionnez le code-barres dans le cadre</Text>
                </View>
              </>
            )}
          </View>
        ) : (
          <View style={styles.manualContainer}>
            <View style={styles.manualIllustration}>
              <Feather name="maximize" size={48} color={Colors.slateLight} />
              {Platform.OS === "web" && (
                <Text style={styles.webNote}>Le scanner caméra n'est disponible que sur l'application mobile.</Text>
              )}
            </View>

            <Text style={styles.manualLabel}>Référence ou code produit</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="Ex: EAN123456789"
                placeholderTextColor={Colors.slateLight}
                autoCapitalize="characters"
                autoCorrect={false}
                keyboardType="default"
                returnKeyType="search"
                onSubmitEditing={handleManualSubmit}
              />
              <TouchableOpacity style={styles.searchBtn} onPress={handleManualSubmit}>
                <Feather name="search" size={18} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.quickCodes}>
              <Text style={styles.quickLabel}>Codes rapides (test) :</Text>
              <View style={styles.quickRow}>
                {["PROD-001", "PROD-042", "NIDO-5KG", "LAIT-UHT"].map((c) => (
                  <TouchableOpacity key={c} style={styles.quickChip} onPress={() => setManualCode(c)}>
                    <Text style={styles.quickChipText}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.submitBtn} onPress={handleManualSubmit} activeOpacity={0.8}>
              <Feather name="check" size={18} color="#fff" />
              <Text style={styles.submitBtnText}>Vérifier le produit</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Modal>
  );
}

const native = StyleSheet.create({
  placeholder: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#000" },
  placeholderText: { fontSize: 14, color: Colors.slateLight, fontFamily: "Inter_400Regular" },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.navy },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.slate, marginTop: 2 },
  closeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" },
  modeSwitcher: { flexDirection: "row", margin: 16, gap: 8, backgroundColor: "#fff", borderRadius: 12, padding: 4, borderWidth: 1, borderColor: Colors.border },
  modeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 9 },
  modeBtnActive: { backgroundColor: Colors.primary + "15" },
  modeBtnText: { fontSize: 13, fontFamily: "Inter_500Medium", color: Colors.slate },
  modeBtnTextActive: { color: Colors.primary, fontFamily: "Inter_600SemiBold" },
  cameraContainer: { flex: 1, position: "relative", backgroundColor: "#000" },
  noPermission: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 12, backgroundColor: Colors.background },
  noPermTitle: { fontSize: 16, fontFamily: "Inter_700Bold", color: Colors.navy },
  noPermText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.slate, textAlign: "center", lineHeight: 19 },
  switchBtn: { backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12, marginTop: 8 },
  switchBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
  scannedView: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16, backgroundColor: Colors.background },
  scannedText: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.navy },
  rescanBtn: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: Colors.primary },
  rescanText: { fontSize: 14, fontFamily: "Inter_500Medium", color: Colors.primary },
  scanOverlay: { position: "absolute", inset: 0, alignItems: "center", justifyContent: "center" },
  scanTarget: { width: 240, height: 160, position: "relative", alignItems: "center", justifyContent: "center" },
  corner: { position: "absolute", width: 24, height: 24, borderColor: Colors.primary, borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  scanLine: { width: 200, height: 2, backgroundColor: Colors.primary, opacity: 0.8, borderRadius: 1 },
  scanHint: { marginTop: 20, fontSize: 12, color: "#fff", fontFamily: "Inter_400Regular", textShadowColor: "#000", textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  manualContainer: { flex: 1, padding: 20, gap: 16 },
  manualIllustration: { alignItems: "center", paddingVertical: 24, gap: 10 },
  webNote: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.slateLight, textAlign: "center", paddingHorizontal: 32 },
  manualLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", color: Colors.navy },
  inputRow: { flexDirection: "row", gap: 10 },
  input: { flex: 1, backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15, fontFamily: "Inter_400Regular", color: Colors.navy, borderWidth: 1.5, borderColor: Colors.border },
  searchBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  quickCodes: { gap: 8 },
  quickLabel: { fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.slate },
  quickRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  quickChip: { backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border },
  quickChipText: { fontSize: 11, fontFamily: "Inter_500Medium", color: Colors.navy },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: Colors.navyMid, paddingVertical: 14, borderRadius: 14 },
  submitBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
});
