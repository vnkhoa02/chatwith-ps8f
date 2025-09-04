import * as ed from "@noble/ed25519";

export type KeyPair = {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
  privateKeyBase64: string;
  publicKeyBase64: string;
};

/**
 * Generate a new Ed25519 key pair
 */
export async function generateKeyPair(): Promise<KeyPair> {
  const privateKey = ed.utils.randomPrivateKey();
  const publicKey = await ed.getPublicKey(privateKey);

  return {
    privateKey,
    publicKey,
    privateKeyBase64: Buffer.from(privateKey).toString("base64"),
    publicKeyBase64: Buffer.from(publicKey).toString("base64"),
  };
}

/**
 * Sign a message using Ed25519 private key
 */
export async function signMessage(
  message: string,
  privateKey: Uint8Array
): Promise<string> {
  const msg = new TextEncoder().encode(message);
  const signature = await ed.sign(msg, privateKey);
  return Buffer.from(signature).toString("base64");
}

/**
 * Verify a signature using Ed25519 public key
 */
export async function verifySignature(
  message: string,
  signatureBase64: string,
  publicKey: Uint8Array
): Promise<boolean> {
  const msg = new TextEncoder().encode(message);
  const signature = Buffer.from(signatureBase64, "base64");
  return await ed.verify(signature, msg, publicKey);
}
