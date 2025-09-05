import { AUTH_CONFIG } from "@/config/auth";
import {
  generatePresignedUrl,
  parseJwt,
  uploadToS3,
} from "@/utils/s3UploadUtils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";
import * as mime from "react-native-mime-types";

const useChat = () => {
  const [message, setMessage] = useState("");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [viewUrl, setViewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // pick image
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setMediaUri(asset.uri);
        setFileName(asset.fileName || asset.uri.split("/").pop() || null);

        const info = await FileSystem.getInfoAsync(asset.uri);
        setFileSize(info.exists ? info.size : null);

        // upload right after picking
        await uploadImage(asset.uri, asset.fileName || "upload.jpg");
      }
    } catch (err) {
      console.warn("pickImage error", err);
      Alert.alert("Error", "Could not pick the image.");
    }
  };

  // upload to S3 with AWS V4
  const uploadImage = async (uri: string, name: string) => {
    try {
      setIsUploading(true);

      const token = await AsyncStorage.getItem(
        AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN
      );
      if (!token) throw new Error("No access token");

      const mimeType = mime.lookup(uri) || "application/octet-stream";

      // 🔹 upload
      const result = await uploadToS3(uri, name, mimeType, token);

      setUploadUrl(result.url);

      // 🔹 presigned view URL
      const { tenant_id } = parseJwt(token);
      const presigned = generatePresignedUrl({
        bucket: tenant_id,
        key: result.key,
        expiresIn: 600, // 10 min
      });

      setViewUrl(presigned);

      console.log("✅ Upload finished:", result.url);
      console.log("🔗 Presigned view URL:", presigned);
    } catch (err: any) {
      console.error("uploadImage error", err);
      Alert.alert("Upload error", err?.message ?? String(err));
    } finally {
      setIsUploading(false);
    }
  };

  const resetInput = () => {
    setMessage("");
    setMediaUri(null);
    setFileName(null);
    setFileSize(null);
    setUploadUrl(null);
    setViewUrl(null);
  };

  return {
    message,
    setMessage,
    mediaUri,
    fileName,
    fileSize,
    uploadUrl,
    viewUrl,
    isUploading,
    pickImage,
    resetInput,
  };
};

export default useChat;
