import React, { useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from "react-native";
import { GestureDetector, Gesture } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  runOnJS,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const { width: SCREEN_W } = Dimensions.get("window");
const CANVAS_W = SCREEN_W - 48;
const CANVAS_H = 200;

interface Props {
  visible: boolean;
  boutiqueName: string;
  montant: number;
  onConfirm: (paths: string[]) => void;
  onClose: () => void;
}

export function SignatureModal({ visible, boutiqueName, montant, onConfirm, onClose }: Props) {
  const [paths, setPaths] = useState<string[]>([]);
  const currentPath = useRef("");
  const currentPathState = useSharedValue("");

  const addPoint = (x: number, y: number, isFirst: boolean) => {
    if (isFirst) {
      currentPath.current = `M${x.toFixed(1)},${y.toFixed(1)}`;
    } else {
      currentPath.current += ` L${x.toFixed(1)},${y.toFixed(1)}`;
    }
  };

  const commitPath = () => {
    if (currentPath.current) {
      setPaths((prev) => [...prev, currentPath.current]);
      currentPath.current = "";
      currentPathState.value = "";
    }
  };

  const animatedProps = useAnimatedProps(() => ({
    d: currentPathState.value,
  }));

  const gesture = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => {
      "worklet";
      runOnJS(addPoint)(e.x, e.y, true);
      currentPathState.value = `M${e.x.toFixed(1)},${e.y.toFixed(1)}`;
    })
    .onUpdate((e) => {
      "worklet";
      runOnJS(addPoint)(e.x, e.y, false);
      currentPathState.value = currentPathState.value + ` L${e.x.toFixed(1)},${e.y.toFixed(1)}`;
    })
    .onFinalize(() => {
      "worklet";
      runOnJS(commitPath)();
    });

  const clear = () => {
    setPaths([]);
    currentPath.current = "";
    currentPathState.value = "";
  };

  const confirm = () => {
    if (paths.length === 0 && !currentPath.current) {
      Alert.alert("Signature requise", "Veuillez faire signer le client.");
      return;
    }
    onConfirm(paths);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent presentationStyle="overFullScreen">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Signature Client</Text>
              <Text style={styles.subtitle}>{boutiqueName}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color={Colors.slate} />
            </TouchableOpacity>
          </View>

          <View style={styles.amountRow}>
            <Feather name="check-circle" size={14} color={Colors.green} />
            <Text style={styles.amountText}>
              Montant à encaisser :{" "}
              <Text style={styles.amountValue}>
                {montant.toLocaleString("fr-FR")} FCFA
              </Text>
            </Text>
          </View>

          <Text style={styles.canvasLabel}>Signature du responsable :</Text>
          <GestureDetector gesture={gesture}>
            <View style={styles.canvas}>
              <Svg width={CANVAS_W} height={CANVAS_H}>
                {paths.map((d, i) => (
                  <Path key={i} d={d} stroke={Colors.navy} strokeWidth={2.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                ))}
                <AnimatedPath
                  animatedProps={animatedProps}
                  stroke={Colors.navy}
                  strokeWidth={2.5}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </Svg>
              {paths.length === 0 && (
                <View style={styles.canvasPlaceholder} pointerEvents="none">
                  <Feather name="edit-3" size={20} color={Colors.slateLight} />
                  <Text style={styles.canvasPlaceholderText}>Signez ici</Text>
                </View>
              )}
            </View>
          </GestureDetector>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.clearBtn} onPress={clear}>
              <Feather name="refresh-ccw" size={14} color={Colors.slate} />
              <Text style={styles.clearBtnText}>Effacer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirm}>
              <Feather name="check" size={16} color="#fff" />
              <Text style={styles.confirmBtnText}>Valider la livraison</Text>
            </TouchableOpacity>
          </View>
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
  amountRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.green + "12",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  amountText: { fontSize: 13, fontFamily: "Inter_400Regular", color: Colors.navy },
  amountValue: { fontFamily: "Inter_700Bold", color: Colors.green },
  canvasLabel: {
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
    color: Colors.slate,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  canvas: {
    width: CANVAS_W,
    height: CANVAS_H,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    backgroundColor: "#fafafa",
    overflow: "hidden",
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  canvasPlaceholder: {
    position: "absolute",
    alignItems: "center",
    gap: 6,
  },
  canvasPlaceholderText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    color: Colors.slateLight,
  },
  actions: { flexDirection: "row", gap: 12 },
  clearBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: "#fff",
  },
  clearBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold", color: Colors.slate },
  confirmBtn: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Colors.green,
  },
  confirmBtnText: { fontSize: 14, fontFamily: "Inter_700Bold", color: "#fff" },
});
