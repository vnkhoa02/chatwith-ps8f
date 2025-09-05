import { useQrPairing } from "@/hooks/useQrPairing";
import { useIsFocused } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function QrScan() {
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastQr, setLastQr] = useState<string | null>(null);
  const [pairResult, setPairResult] = useState<any | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const cameraRef = useRef<CameraView | null>(null);

  const {
    scan,
    approve,
    isScanning,
    isApproving,
    scanData,
    approveData,
    scanError,
    approveError,
  } = useQrPairing();

  useEffect(() => {
    if (scanData) {
      setPairResult((prev: any) => ({ ...prev, scan: scanData }));
      const userCode = scanData?.raw?.user_code;
      if (userCode) {
        Alert.alert(
          "Approve Pairing?",
          "Do you want to approve this pairing?",
          [
            {
              text: "No",
              style: "cancel",
              onPress: () => {
                setScanned(false);
              },
            },
            {
              text: "Yes",
              onPress: async () => {
                try {
                  await approve(userCode);
                  Alert.alert("Approved", "Pairing approved successfully.");
                } catch (err: any) {
                  console.error("Approve failed", err);
                  Alert.alert("Approve failed", err?.message ?? String(err));
                }
              },
            },
          ]
        );
      } else {
        Alert.alert("Scanned", "QR scanned successfully. No approval needed.");
      }
    }
  }, [scanData, approve]);

  useEffect(() => {
    if (approveData) {
      setPairResult((prev: any) => ({ ...prev, approve: approveData }));
    }
  }, [approveData]);

  useEffect(() => {
    if (scanError) {
      Alert.alert(
        "Scan failed",
        String((scanError as any)?.message || scanError)
      );
    }
  }, [scanError]);

  useEffect(() => {
    if (approveError) {
      Alert.alert(
        "Approve failed",
        String((approveError as any)?.message || approveError)
      );
    }
  }, [approveError]);

  useEffect(() => {
    if (isFocused) {
      setScanned(false);
      setLastQr(null);
      setPairResult(null);
    }
  }, [isFocused]);

  // Debounced QR handler
  const handleBarCodeScanned = useCallback(
    (event: { data: string; type?: string }) => {
      if (!permission?.granted) {
        Alert.alert(
          "No camera permission",
          "Please grant camera permission first."
        );
        return;
      }

      if (scanned || isScanning || isApproving) return;

      // debounce logic (ignore rapid duplicate scans within 1.5s)
      if (debounceRef.current) return;
      setTimeout(() => {
        debounceRef.current = null;
      }, 1500);

      const data = event.data;
      setScanned(true);
      setLastQr(data);

      (async () => {
        try {
          await scan(data);
        } catch (err: any) {
          console.error("Scan failed", err);
          Alert.alert("Scan failed", err?.message ?? String(err));
          setScanned(false);
        }
      })();
    },
    [permission, scanned, isScanning, isApproving, scan]
  );

  if (!permission) {
    return (
      <View style={styles.center}>
        <Text style={styles.text}>Checking camera permission…</Text>
      </View>
    );
  }

  if (!permission.granted) {
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
        {isFocused && (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr"],
            }}
          />
        )}

        {/* top overlay */}
        <View style={styles.overlayTop}>
          <Text style={styles.title}>Scan QR to Pair</Text>
          <Text style={styles.subtitle}>
            Point camera at the QR code shown on desktop
          </Text>
        </View>

        {/* center crosshair */}
        <View pointerEvents="none" style={styles.centerOverlay}>
          <View style={styles.scanBox} />
        </View>

        {/* bottom status */}
        <View style={styles.bottomPanel}>
          {isScanning || isApproving ? (
            <View style={styles.row}>
              <ActivityIndicator color="#fff" />
              <Text style={styles.statusText}>
                {isScanning ? "Scanning..." : "Approving..."}
              </Text>
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

      {/* result */}
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
