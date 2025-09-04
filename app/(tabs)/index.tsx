import useChat from "@/hooks/useChat";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Chat() {
  const {
    message,
    setMessage,
    mediaUri,
    fileName,
    fileSize,
    pickImage,
    sendMessage,
  } = useChat();

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

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
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
