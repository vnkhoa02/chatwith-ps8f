import ChatMessages from "@/components/ChatMessages";
import { useAi } from "@/hooks/useAi";
import useChat from "@/hooks/useChat";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Chat() {
  const { messages, sendMessage, sendAudioMessage } = useAi();
  const {
    message,
    resetInput,
    setMessage,
    mediaUri,
    fileName,
    fileSize,
    pickImage,
    isUploading,
  } = useChat();

  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    (async () => {
      const { status: micStatus } = await Audio.requestPermissionsAsync();
      const { status: cameraStatus } =
        await ImagePicker.requestCameraPermissionsAsync();
      const { status: mediaStatus } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (
        micStatus !== "granted" ||
        cameraStatus !== "granted" ||
        mediaStatus !== "granted"
      ) {
        Alert.alert(
          "Permissions required",
          "Please allow microphone, camera and media access."
        );
      }
    })();
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    resetInput();
    if (mediaUri) {
      await sendMessage(message, [mediaUri]);
    } else {
      await sendMessage(message, []);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync({
        ...Audio.RecordingOptionsPresets.HIGH_QUALITY,
        ios: {
          ...Audio.RecordingOptionsPresets.HIGH_QUALITY.ios,
          extension: ".m4a",
          // outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        },
      });
      setRecording(recording);
      setIsRecording(true);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    setIsRecording(false);

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      if (uri) {
        const base64Audio = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        await sendAudioMessage(base64Audio);
      }
    } catch (err) {
      console.error("Failed to stop recording", err);
    } finally {
      setRecording(null);
    }
  };

  return (
    <View style={styles.container}>
      {/* Chat messages */}
      <ChatMessages messages={messages} />

      {/* Image preview with upload indicator */}
      {mediaUri && (
        <View style={styles.previewContainer}>
          <Image source={{ uri: mediaUri }} style={styles.previewImage} />
          <View style={styles.previewTextContainer}>
            <Text style={styles.previewText} numberOfLines={1}>
              {fileName ?? mediaUri.split("/").pop()}
            </Text>
            {fileSize && (
              <Text style={styles.previewSubText}>
                {(fileSize / 1024).toFixed(1)} KB
              </Text>
            )}
          </View>
          {isUploading && <ActivityIndicator size="small" color="#0A84FF" />}
        </View>
      )}

      {/* Input bar */}
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

        <TouchableOpacity
          style={[styles.iconButton, isRecording && { backgroundColor: "red" }]}
          onPress={isRecording ? stopRecording : startRecording}
        >
          <Ionicons
            name={isRecording ? "mic" : "mic-outline"}
            size={22}
            color="#FFF"
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
          <Ionicons name="send-outline" size={22} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 0,
  },
  previewContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#111",
    borderRadius: 8,
    marginHorizontal: 8,
    marginBottom: 6,
  },
  previewImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 8,
  },
  previewTextContainer: {
    flex: 1,
  },
  previewText: {
    color: "#fff",
    fontSize: 14,
  },
  previewSubText: {
    color: "#888",
    fontSize: 12,
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
});
