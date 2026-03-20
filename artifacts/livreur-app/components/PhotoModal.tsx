import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Platform,
  Image,
  Dimensions,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import Colors from "@/constants/colors";

interface Props {
  visible: boolean;
  boutiqueName: string;
  onCapture: (uri: string) => void;
  onClose: () => void;
  existingUri?: string | null;
}

const { width } = Dimensions.get("window");

export function PhotoModal({ visible, boutiqueName, onCapture, onClose, existingUri }: Props) {
  const [preview, setPreview] = useState<string | null>(existingUri ?? null);
  const [mode, setMode] = useState<"choice" | "preview">(existingUri ? "preview" : "choice");

  useEffect(() => {
    if (visible) {
      setPreview(existingUri ?? null);
      setMode(existingUri ? "preview" : "choice");
    }
  }, [visible, existingUri]);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à la caméra est nécessaire pour prendre une preuve photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPreview(result.assets[0].uri);
      setMode("preview");
    }
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'accès à la galerie est nécessaire.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPreview(result.assets[0].uri);
      setMode("preview");
    }
  };

  const confirmPhoto = () => {
    if (preview) onCapture(preview);
  };

  const retake = () => {
    setPreview(null);
    setMode("choice");
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.root}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Preuve de livraison</Text>
            <Text style={styles.subtitle} numberOfLines={1}>{boutiqueName}</Text>
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Feather name="x" size={20} color={Colors.slate} />
          </TouchableOpacity>
        </View>

        {mode === "choice" ? (
          <View style={styles.choiceContainer}>
            <View style={styles.illustrationBox}>
              <Feather name="camera" size={60} color={Colors.slateLight} />
              <Text style={styles.illustrationText}>Photographiez les colis déposés devant la boutique</Text>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={takePhoto} activeOpacity={0.8}>
              <Feather name="camera" size={20} color="#fff" />
              <Text style={styles.primaryBtnText}>Prendre une photo</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={pickFromGallery} activeOpacity={0.8}>
              <Feather name="image" size={18} color={Colors.navyMid} />
              <Text style={styles.secondaryBtnText}>Choisir depuis la galerie</Text>
            </TouchableOpacity>

            <View style={styles.tipBox}>
              <Feather name="info" size={12} color={Colors.primary} />
              <Text style={styles.tipText}>La photo sera horodatée et associée à cet arrêt comme preuve légale de livraison.</Text>
            </View>
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <View style={styles.previewFrame}>
              {preview ? (
                <Image source={{ uri: preview }} style={styles.previewImage} resizeMode="cover" />
              ) : null}
              <View style={styles.previewOverlay}>
                <View style={styles.previewBadge}>
                  <Feather name="check-circle" size={12} color="#fff" />
                  <Text style={styles.previewBadgeText}>Photo capturée</Text>
                </View>
              </View>
            </View>

            <View style={styles.previewMeta}>
              <Feather name="map-pin" size={13} color={Colors.primary} />
              <Text style={styles.previewMetaText}>{boutiqueName}</Text>
            </View>
            <View style={styles.previewMeta}>
              <Feather name="clock" size={13} color={Colors.slate} />
              <Text style={styles.previewMetaText}>{new Date().toLocaleString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</Text>
            </View>

            <View style={styles.previewActions}>
              <TouchableOpacity style={styles.retakeBtn} onPress={retake} activeOpacity={0.8}>
                <Feather name="refresh-cw" size={16} color={Colors.navyMid} />
                <Text style={styles.retakeBtnText}>Reprendre</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmBtn} onPress={confirmPhoto} activeOpacity={0.8}>
                <Feather name="check" size={16} color="#fff" />
                <Text style={styles.confirmBtnText}>Valider la preuve</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: Colors.border },
  title: { fontSize: 18, fontFamily: "Inter_700Bold", color: Colors.navy },
  subtitle: { fontSize: 12, fontFamily: "Inter_400Regular", color: Colors.slate, marginTop: 2, maxWidth: 240 },
  closeBtn: { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.background, alignItems: "center", justifyContent: "center" },
  choiceContainer: { flex: 1, padding: 24, gap: 12 },
  illustrationBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 16 },
  illustrationText: { fontSize: 14, fontFamily: "Inter_400Regular", color: Colors.slate, textAlign: "center", paddingHorizontal: 24, lineHeight: 20 },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: Colors.primary, paddingVertical: 15, borderRadius: 14, shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 5 },
  primaryBtnText: { fontSize: 15, fontFamily: "Inter_700Bold", color: "#fff" },
  secondaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, backgroundColor: "#fff", paddingVertical: 13, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border },
  secondaryBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.navyMid },
  tipBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: Colors.primary + "10", borderRadius: 10, padding: 12 },
  tipText: { flex: 1, fontSize: 11, fontFamily: "Inter_400Regular", color: Colors.navyMid, lineHeight: 16 },
  previewContainer: { flex: 1, padding: 20, gap: 12 },
  previewFrame: { flex: 1, borderRadius: 18, overflow: "hidden", backgroundColor: Colors.navyLight },
  previewImage: { width: "100%", height: "100%" },
  previewOverlay: { position: "absolute", bottom: 12, left: 12 },
  previewBadge: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.green, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5 },
  previewBadgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold", color: "#fff" },
  previewMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  previewMetaText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.slate },
  previewActions: { flexDirection: "row", gap: 10 },
  retakeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: "#fff" },
  retakeBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.navyMid },
  confirmBtn: { flex: 2, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 13, borderRadius: 14, backgroundColor: Colors.green, shadowColor: Colors.green, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4 },
  confirmBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
});
