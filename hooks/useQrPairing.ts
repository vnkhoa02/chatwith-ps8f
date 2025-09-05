import { AUTH_CONFIG } from "@/config/auth";
import { KeyPair, signMessage as signEdMessage } from "@/utils/ed25519";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useMutation } from "@tanstack/react-query";
import nacl from "tweetnacl";
import naclUtil from "tweetnacl-util";

const BASE_URL = process.env.P8_FS_API || "https://p8fs.percolationlabs.ai";

const STORAGE_KEYS = {
  X25519_PUB: "x25519_pub",
  X25519_SECRET: "x25519_secret",
};

type QrCreate = {
  session_id: string;
  public_key?: string;
  expires_in?: number;
};

type ScanInput = {
  qrString: string;
  authToken?: string;
};

/** try a list of fields and return the first defined one */
function pick(obj: any, ...keys: string[]) {
  for (const k of keys) {
    if (obj && typeof obj[k] !== "undefined") return obj[k];
  }
  return undefined;
}

async function postJson(url: string, body: any, token?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      json?.error?.message || json?.message || `Request failed: ${res.status}`
    );
  }
  return json;
}

/** Ensure X25519 keypair (nacl.box) exists and is persisted */
async function ensureX25519Keys() {
  const [pubB64, secB64] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.X25519_PUB),
    AsyncStorage.getItem(STORAGE_KEYS.X25519_SECRET),
  ]);

  if (pubB64 && secB64) {
    return {
      publicKey: naclUtil.decodeBase64(pubB64),
      secretKey: naclUtil.decodeBase64(secB64),
      publicKeyBase64: pubB64,
    };
  }

  const kp = nacl.box.keyPair();
  const pubBase64 = naclUtil.encodeBase64(kp.publicKey);
  const secBase64 = naclUtil.encodeBase64(kp.secretKey);

  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.X25519_PUB, pubBase64),
    AsyncStorage.setItem(STORAGE_KEYS.X25519_SECRET, secBase64),
  ]);

  return {
    publicKey: kp.publicKey,
    secretKey: kp.secretKey,
    publicKeyBase64: pubBase64,
  };
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
 *   and if user_code present will sign and call /device/approve/{user_code}.
 */
export function useQrPairing() {
  const scanMutation = useMutation({
    mutationFn: async (input: ScanInput) => {
      const { qrString, authToken } = input;

      // 1) parse QR payload (JSON with session_id/public_key OR just a session_id string)
      let parsed: QrCreate;
      try {
        parsed = JSON.parse(qrString);
        if (!parsed?.session_id) throw new Error("QR JSON missing session_id");
      } catch {
        parsed = { session_id: qrString };
      }
      const sessionId = parsed.session_id;
      const serverPubFromQr = parsed.public_key;

      // 2) ensure X25519 (nacl.box) keypair
      const { secretKey, publicKeyBase64 } = await ensureX25519Keys();

      // 3) POST /device/qr/scan
      const scanResp = await postJson(
        `${BASE_URL}/api/v1/device/qr/scan`,
        { session_id: sessionId, mobile_public_key: publicKeyBase64 },
        authToken
      );

      // 4) normalize encrypted payload fields (try common variants)
      const ciphertextB64 = pick(scanResp, "cipher");
      const nonceB64 = pick(scanResp, "nonce", "iv", "nonce_b64", "n");
      const serverPubB64 = pick(scanResp, "public_key") ?? serverPubFromQr;

      // If server sent final/unencrypted payload
      if (!ciphertextB64 || !nonceB64 || !serverPubB64) {
        const final = pick(
          scanResp,
          "final_response",
          "pairing",
          "data",
          "payload"
        );
        if (final) return { pairing: final, raw: scanResp };
        throw new Error(
          "Scan response missing encrypted payload or server public key"
        );
      }

      // 5) decrypt using nacl.box.open
      const ct = naclUtil.decodeBase64(String(ciphertextB64));
      const nonce = naclUtil.decodeBase64(String(nonceB64));
      const serverPub = naclUtil.decodeBase64(String(serverPubB64));

      const plain = nacl.box.open(ct, nonce, serverPub, secretKey);
      if (!plain) throw new Error("Failed to decrypt pairing response");
      const decryptedText = naclUtil.encodeUTF8(plain);

      // 6) parse decrypted payload
      let pairingObj: any;
      try {
        pairingObj = JSON.parse(decryptedText);
      } catch {
        pairingObj = { text: decryptedText };
      }

      // 7) check if approval required (user_code present)
      const userCode = pick(scanResp, "user_code") ?? pairingObj.user_code;
      const challenge = pick(scanResp, "challenge") ?? pairingObj.challenge;

      if (userCode) {
        // load Ed25519 keypair (must be persisted earlier by your auth flow)
        const edKey = await loadEdKeyPair();
        const whatToSign = String(challenge ?? userCode);
        // signEdMessage may be sync — wrap with Promise.resolve to support either
        const signatureBase64 = await Promise.resolve(
          signEdMessage(whatToSign, edKey.privateKey)
        );

        // send approve
        const approveResp = await postJson(
          `${BASE_URL}/api/v1/device/approve/${encodeURIComponent(userCode)}`,
          { mobile_signature: signatureBase64 },
          authToken
        );
        return { pairing: pairingObj, approve: approveResp, raw: scanResp };
      }

      return { pairing: pairingObj, raw: scanResp };
    },
  });

  return {
    scan: scanMutation.mutateAsync,
    isScanning: scanMutation.isPending,
    scanData: scanMutation.data,
    scanError: scanMutation.error,
  };
}
