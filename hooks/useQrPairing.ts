import { AUTH_CONFIG } from "@/config/auth";
import { ILoginSession } from "@/types/auth";
import { KeyPair, signMessage } from "@/utils/ed25519";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import naclUtil from "tweetnacl-util";

async function postJsonForm(url: string, formData: FormData, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "multipart/form-data",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: formData,
  });
  const json = await res.json().catch((err) => {
    console.error("postJsonForm error parsing json", err);
  });
  return json;
}

/** Load stored Ed25519 keypair (used for signing approval). Throws if missing. */
async function loadEdKeyPair(): Promise<KeyPair> {
  const [privBase64, pubBase64] = await Promise.all([
    AsyncStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.ED_PRIV_KEY),
    AsyncStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.ED_PUB_KEY),
  ]);

  if (!privBase64 || !pubBase64) {
    throw new Error("Ed25519 key pair not found in storage.");
  }

  return {
    privateKey: naclUtil.decodeBase64(privBase64),
    publicKey: naclUtil.decodeBase64(pubBase64),
    privateKeyBase64: privBase64,
    publicKeyBase64: pubBase64,
  };
}

/**
 * Hook: useQrPairing
 * - scan({ qrString, authToken }) -> performs /device/qr/scan, decrypts returned ciphertext,
 *   and returns the scan response (including user_code if present).
 * - approve(userCode) -> signs and calls /device/approve/{user_code}.
 */
export function useQrPairing() {
  const scanMutation = useMutation({
    mutationFn: async (qrData: ILoginSession) => {
      console.log("Scanning QR data:", qrData);
      const authToken = await AsyncStorage.getItem(
        AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN
      );

      if (!authToken) throw new Error("No auth token found. Please log in.");
      const { publicKeyBase64, privateKey } = await loadEdKeyPair();

      console.log("payload", {
        publicKeyBase64,
        authToken,
      });

      // 3) POST /device/qr/scan
      // const scanResp = await postJson(
      //   `${AUTH_CONFIG.BASE_URL}/api/v1/device/qr/scan`,
      //   { session_id: sessionId, mobile_public_key: publicKeyBase64 },
      //   authToken
      // );
      // console.log("Scan response:", scanResp);
      return qrData;
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (userCode: string) => {
      console.log("Approving user code:", userCode);
      const authToken = await AsyncStorage.getItem(
        AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN
      );
      if (!authToken) {
        throw new Error("No auth token found. Please log in.");
      }
      const { privateKey } = await loadEdKeyPair();

      const formData = new FormData();
      formData.append("user_code", userCode);
      formData.append("signature", signMessage(userCode, privateKey));

      const scanResp = await postJsonForm(
        `${AUTH_CONFIG.BASE_URL}/oauth/device/approve`,
        formData,
        authToken
      );
      console.log("Scan response:", scanResp);
      return true;
    },
  });

  return {
    scan: scanMutation.mutateAsync,
    approve: approveMutation.mutateAsync,
    isScanning: scanMutation.isPending,
    isApproving: approveMutation.isPending,
    scanData: scanMutation.data,
    approveData: approveMutation.data,
    scanError: scanMutation.error,
    approveError: approveMutation.error,
  };
}
