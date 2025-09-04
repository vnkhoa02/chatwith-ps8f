import { Ionicons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [fileSize, setFileSize] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (cameraStatus !== "granted" || mediaStatus !== "granted") {
        Alert.alert(
          "Permissions required",
          "Please allow camera and media access."
        );
      }
    })();
  }, []);

  // Single image picker function — only images
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setMediaUri(uri);
        setFileName(uri.split("/").pop() || null);
        try {
          const info = await FileSystem.getInfoAsync(uri);
          setFileSize(info.exists ? info.size : null);
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.warn("pickImage error", err);
      Alert.alert("Error", "Could not pick the image.");
    }
  };

  const sendMessage = () => {
    if (message.trim() || mediaUri) {
      console.log("Sending:", {
        text: message,
        media: mediaUri,
        name: fileName,
        size: fileSize,
      });
      setMessage("");
      setMediaUri(null);
      setFileName(null);
      setFileSize(null);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {/* both buttons open image picker — only images */}
        <TouchableOpacity onPress={pickImage} style={styles.iconButton}>
          <Ionicons name="image-outline" size={22} color="#BBB" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Message..."
          placeholderTextColor="#BBB"
        />

        <TouchableOpacity style={styles.iconButton}>
          <Ionicons name={"mic-outline"} size={22} color="#BBB" />
        </TouchableOpacity>

        <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
          <Ionicons name="send-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>

      {mediaUri && (
        <Text
          style={styles.mediaPreview}
          numberOfLines={1}
          ellipsizeMode="middle"
        >
          Selected: {fileName ?? mediaUri.split("/").pop()}
          {fileSize ? ` — ${(fileSize / 1024).toFixed(1)} KB` : ""}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "#FFF",
    marginBottom: 10,
    position: "absolute",
    top: 20,
    left: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#222",
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  iconButton: {
    padding: 8,
    marginRight: 6,
    backgroundColor: "#333",
    borderRadius: 6,
  },
  input: {
    flex: 1,
    height: 40,
    color: "#FFF",
    paddingHorizontal: 10,
  },
  sendButton: {
    padding: 8,
    marginLeft: 6,
    backgroundColor: "#0A84FF",
    borderRadius: 6,
  },
  mediaPreview: {
    color: "#BBB",
    marginTop: 10,
    width: "100%",
  },
});
