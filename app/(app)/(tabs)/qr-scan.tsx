import { AUTH_CONFIG } from "@/config/auth";
import { useQrPairing } from "@/hooks/useQrPairing";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function QrScan() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastQr, setLastQr] = useState<string | null>(null);
  const [pairResult, setPairResult] = useState<any | null>(null);
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);

  const { scan, isScanning, scanData, scanError } = useQrPairing();

  useEffect(() => {
    if (scanData) {
      setPairResult(scanData);
    }
  }, [scanData, router]);

  useEffect(() => {
    if (scanError) {
      Alert.alert(
        "Pairing failed",
        String((scanError as any)?.message || scanError)
      );
    }
  }, [scanError]);

  // barcode handler from CameraView
  const handleBarCodeScanned = async (event: {
    data: string;
    type?: string;
  }) => {
    const data = event.data;
    if (!permission || !permission.granted) {
      Alert.alert(
        "No camera permission",
        "Please grant camera permission first."
      );
      return;
    }

    if (scanned || isScanning) return;
    setScanned(true);
    setLastQr(data);

    try {
      const token = await AsyncStorage.getItem(
        AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN
      );

      const result = await scan({
        qrString: data,
        authToken: token ?? undefined,
      });
      setPairResult(result);
      Alert.alert("Paired", "Pairing successful.");
    } catch (err: any) {
      console.error("Scan failed", err);
      Alert.alert("Scan failed", err?.message ?? String(err));
      setScanned(false);
    }
  };

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
    // not granted yet
    return (
      <View style={styles.containerCentered}>
        <Text style={styles.text}>
          We need camera permission to scan QR codes.
        </Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.scannerWrapper}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFillObject}
          // restrict to QR codes only
          barcodeScannerSettings={{
            barcodeTypes: ["qr"],
          }}
          onBarcodeScanned={handleBarCodeScanned}
        />

        {/* top overlay */}
        <View style={styles.overlayTop}>
          <Text style={styles.title}>Scan QR to Pair</Text>
          <Text style={styles.subtitle}>
            Point camera at the QR code shown on desktop
          </Text>
        </View>

        {/* center crosshair / hint */}
        <View pointerEvents="none" style={styles.centerOverlay}>
          <View style={styles.scanBox} />
        </View>

        {/* bottom controls / status */}
        <View style={styles.bottomPanel}>
          {isScanning ? (
            <View style={styles.row}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.statusText}>Pairing...</Text>
            </View>
          ) : (
            <Text style={styles.statusText}>
              {scanned
                ? "QR scanned. Tap Rescan to scan again."
                : "Ready to scan"}
            </Text>
          )}

          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => {
                setScanned(false);
                setPairResult(null);
                setLastQr(null);
              }}
            >
              <Text style={styles.buttonText}>Rescan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* result area */}
      <View style={styles.resultContainer}>
        <Text style={styles.resultTitle}>Last scanned QR:</Text>
        <Text style={styles.resultText}>{lastQr ?? "-"}</Text>

        <Text style={[styles.resultTitle, { marginTop: 12 }]}>
          Pairing result:
        </Text>
        <Text style={styles.resultText}>
          {pairResult ? JSON.stringify(pairResult, null, 2) : "No pairing yet."}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  containerCentered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  scannerWrapper: { flex: 1, position: "relative" },
  overlayTop: {
    position: "absolute",
    top: 40,
    left: 12,
    right: 12,
    alignItems: "center",
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "600" },
  subtitle: { color: "#ddd", fontSize: 13, marginTop: 4 },
  centerOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: "30%",
    alignItems: "center",
  },
  scanBox: {
    width: 220,
    height: 220,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.7)",
    borderRadius: 12,
  },
  bottomPanel: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 24,
    alignItems: "center",
  },
  row: { flexDirection: "row", alignItems: "center" },
  statusText: { color: "#fff", marginTop: 8 },
  buttonsRow: {
    flexDirection: "row",
    marginTop: 10,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#0A84FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 6,
    marginVertical: 6,
  },
  cancelButton: { backgroundColor: "#444" },
  torchOn: { backgroundColor: "#FFD700" },
  buttonText: { color: "#fff", fontWeight: "600" },

  resultContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#111",
    backgroundColor: "#000",
  },
  resultTitle: { color: "#999", fontSize: 12, marginBottom: 6 },
  resultText: { color: "#fff", fontSize: 13 },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#000",
  },
  text: { color: "#fff" },
});
