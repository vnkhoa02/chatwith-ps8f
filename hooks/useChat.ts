import { AUTH_CONFIG } from "@/config/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Alert } from "react-native";
import * as mime from "react-native-mime-types";
import * as tus from "tus-js-client";

const API_BASE = process.env.P8_FS_API || "https://p8fs.percolationlabs.ai";

const useChat = () => {
  const [message, setMessage] = useState("");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // pick image
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });
      console.log("ImagePicker result", result);
      if (!result.canceled && result.assets?.length > 0) {
        const asset = result.assets[0];
        setMediaUri(asset.uri);
        setFileName(asset.fileName || asset.uri.split("/").pop() || null);

        const info = await FileSystem.getInfoAsync(asset.uri);
        setFileSize(info.exists ? info.size : null);

        // upload right after picking
        await uploadImage(asset.uri);
      }
    } catch (err) {
      console.warn("pickImage error", err);
      Alert.alert("Error", "Could not pick the image.");
    }
  };

  // upload with tus
  const uploadImage = async (uri: string) => {
    try {
      setIsUploading(true);
      const token = await AsyncStorage.getItem(
        AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN
      );
      const mimeType = mime.lookup(uri) || "application/octet-stream";
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) throw new Error("File not found");

      const file = {
        size: fileInfo.size!,
        uri,
        type: mimeType,
        name: fileName || "upload.jpg",
      };

      const upload = new tus.Upload(file as any, {
        endpoint: `${API_BASE}/tus/`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        metadata: {
          filename: file.name,
          filetype: file.type,
        },
        uploadSize: file.size,
        onError: (error) => {
          console.error("Upload failed:", error);
          Alert.alert("Upload failed", error.message);
          setIsUploading(false);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          console.log(
            `Uploaded ${bytesUploaded} of ${bytesTotal} bytes (${(
              (bytesUploaded / bytesTotal) *
              100
            ).toFixed(2)}%)`
          );
        },
        onSuccess: () => {
          console.log("Upload finished:", upload.url);
          setUploadUrl(upload.url || null);
          setIsUploading(false);
        },
      });

      upload.start();
    } catch (err: any) {
      console.error("uploadImage error", err);
      Alert.alert("Upload error", err?.message ?? String(err));
      setIsUploading(false);
    }
  };

  const resetInput = () => {
    setMessage("");
    setMediaUri(null);
    setFileName(null);
    setFileSize(null);
    setUploadUrl(null);
  };

  return {
    message,
    setMessage,
    mediaUri,
    fileName,
    fileSize,
    uploadUrl,
    isUploading,
    pickImage,
    resetInput,
  };
};

export default useChat;
