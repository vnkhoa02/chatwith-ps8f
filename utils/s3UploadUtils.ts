import base64 from "base64-js";
import CryptoJS from "crypto-js";
import * as FileSystem from "expo-file-system";

const S3_ENDPOINT = "https://s3.percolationlabs.ai";
const S3_REGION = "us-east-1";
const S3_ACCESS_KEY = process.env.EXPO_S3_ACCESS_KEY ?? "P8FS0AC3180375CA16A2";
const S3_SECRET_KEY =
  process.env.EXPO_S3_SECRET_KEY ?? "Rx5oOULvHXBMQcCzT3ptsfEC1Kfr5juj";

/**
 * Decode JWT and extract tenant + email
 */
export function parseJwt(token: string): { tenant_id: string; email: string } {
  const base64Payload = token.split(".")[1];
  const padded = base64Payload.padEnd(
    base64Payload.length + ((4 - (base64Payload.length % 4)) % 4),
    "="
  );
  const decodedBytes = base64.toByteArray(padded);
  const json = new TextDecoder().decode(decodedBytes);
  const payload = JSON.parse(json);
  return { tenant_id: payload.tenant_id, email: payload.email };
}

function hmac(key: string | CryptoJS.lib.WordArray, msg: string) {
  return CryptoJS.HmacSHA256(msg, key);
}

/**
 * Create AWS Signature V4
 */
export function signAwsV4({
  method,
  bucket,
  key,
  mimeType,
  bodyHash,
  tenantEmail,
}: {
  method: string;
  bucket: string;
  key: string;
  mimeType: string;
  bodyHash: string;
  tenantEmail: string;
}) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, ""); // e.g. 20250105T120000Z
  const dateStamp = amzDate.slice(0, 8); // YYYYMMDD

  const canonicalHeaders =
    `content-type:${mimeType}\n` +
    `host:s3.percolationlabs.ai\n` +
    `x-amz-content-sha256:${bodyHash}\n` +
    `x-amz-date:${amzDate}\n` +
    `x-user-email:${tenantEmail}\n`;

  const signedHeaders =
    "content-type;host;x-amz-content-sha256;x-amz-date;x-user-email";

  const canonicalRequest = [
    method,
    `/${bucket}/${key}`,
    "",
    canonicalHeaders,
    signedHeaders,
    bodyHash,
  ].join("\n");

  const credentialScope = `${dateStamp}/${S3_REGION}/s3/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    CryptoJS.SHA256(canonicalRequest).toString(),
  ].join("\n");

  const kDate = hmac("AWS4" + S3_SECRET_KEY, dateStamp);
  const kRegion = hmac(kDate, S3_REGION);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = hmac(kSigning, stringToSign).toString();

  const authorization = `AWS4-HMAC-SHA256 Credential=${S3_ACCESS_KEY}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

  return { authorization, amzDate };
}

/**
 * Upload to S3 using AWS V4 signed PUT
 */
export async function uploadToS3(
  uri: string,
  fileName: string,
  mimeType: string,
  jwt: string
): Promise<{ url: string; key: string; size: number }> {
  const { tenant_id, email } = parseJwt(jwt);

  // 🔹 Generate S3 key
  const datePath = new Date().toISOString().split("T")[0].replace(/-/g, "/");
  const timestamp = Date.now();
  const key = `uploads/${datePath}/${fileName}_${timestamp}`;

  // 🔹 Read file (base64)
  const base64Data = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Decode base64 → Uint8Array
  const fileBytes = base64.toByteArray(base64Data);
  const wordArray = CryptoJS.lib.WordArray.create(fileBytes as any);
  const bodyHash = CryptoJS.SHA256(wordArray).toString();

  const { authorization, amzDate } = signAwsV4({
    method: "PUT",
    bucket: tenant_id,
    key,
    mimeType,
    bodyHash,
    tenantEmail: email,
  });

  const res = await fetch(`${S3_ENDPOINT}/${tenant_id}/${key}`, {
    method: "PUT",
    headers: {
      "Content-Type": mimeType,
      Authorization: authorization,
      "x-amz-date": amzDate,
      "x-amz-content-sha256": bodyHash,
      "x-user-email": email,
    },
    body: fileBytes as any, // binary
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Upload failed: ${res.status} ${err}`);
  }

  return {
    url: `${S3_ENDPOINT}/${tenant_id}/${key}`,
    key,
    size: fileBytes.length,
  };
}
export function generatePresignedUrl({
  bucket,
  key,
  expiresIn = 3600, // seconds
}: {
  bucket: string;
  key: string;
  expiresIn?: number;
}) {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  const credentialScope = `${dateStamp}/${S3_REGION}/s3/aws4_request`;

  // 🔹 Query params for presigned URL
  const queryParams = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${S3_ACCESS_KEY}/${credentialScope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expiresIn),
    "X-Amz-SignedHeaders": "host",
  });

  // 🔹 Canonical request
  const canonicalRequest = [
    "GET",
    `/${bucket}/${key}`,
    queryParams.toString(),
    `host:s3.percolationlabs.ai\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    CryptoJS.SHA256(canonicalRequest).toString(),
  ].join("\n");

  // 🔹 SigV4 signing key
  function hmac(key: string | CryptoJS.lib.WordArray, msg: string) {
    return CryptoJS.HmacSHA256(msg, key);
  }
  const kDate = hmac("AWS4" + S3_SECRET_KEY, dateStamp);
  const kRegion = hmac(kDate, S3_REGION);
  const kService = hmac(kRegion, "s3");
  const kSigning = hmac(kService, "aws4_request");
  const signature = hmac(kSigning, stringToSign).toString();

  // 🔹 Final presigned URL
  return `${S3_ENDPOINT}/${bucket}/${key}?${queryParams.toString()}&X-Amz-Signature=${signature}`;
}
