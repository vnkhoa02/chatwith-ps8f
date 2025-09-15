import type { Moment } from "@/hooks/useMoments";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as ImagePicker from "expo-image-picker";
import React, { useEffect, useRef, useState } from "react";
import {
    Alert,
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  moment: Moment | null;
  onSave: (id: string | number, updates: Partial<Moment>) => void;
};

export default function EditMomentModal({
  visible,
  onClose,
  moment,
  onSave,
}: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsText, setTagsText] = useState("");
  const [label, setLabel] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingObj, setRecordingObj] = useState<Audio.Recording | null>(
    null
  );
  const [recordedUri, setRecordedUri] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    if (moment) {
      setTitle(moment.title ?? "");
      setDescription(moment.description ?? "");
      setTagsText((moment.tags || []).join(", "));
      setLabel(moment.label ?? "");
      setRecordedUri(moment.audioUrl ?? null);
      setSelectedImages(moment.images ?? []);
    }
  }, [moment]);

  // cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (recordingObj) recordingObj.stopAndUnloadAsync().catch(() => {});
    };
  }, [recordingObj]);

  function handleSave() {
    if (!moment) return;
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    onSave(moment.id, {
      title: title.trim(),
      description: description.trim(),
      tags,
      label,
      audioUrl: recordedUri ?? undefined,
      images: selectedImages.length ? selectedImages : undefined,
    });
    onClose();
  }

  const pickImages = async () => {
    try {
      const results = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.5,
        allowsMultipleSelection: true,
      });
      const uris = results.assets?.map((asset) => asset.uri) || [];
      setSelectedImages((prev) => [...prev, ...uris]);
    } catch (err) {
      console.warn("pickImage error", err);
      Alert.alert("Error", "Could not pick the image.");
    }
  };

  const startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      setIsRecording(true);
      const { recording } = await Audio.Recording.createAsync();
      setRecordedUri(recording._uri ?? null);
      setRecordingObj(recording);
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  };

  async function stopRecording() {
    try {
      if (!recordingObj) return;
      await recordingObj.stopAndUnloadAsync();
      const uri = recordingObj.getURI();
      setRecordedUri(uri ?? null);
      setRecordingObj(null);
      setIsRecording(false);
    } catch (err) {
      console.warn("stopRecording error", err);
    }
  }

  if (!moment) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>Edit Moment</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel="Close">
              <Ionicons name="close" size={22} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              style={styles.input}
              placeholder="Moment title"
            />

            <Text style={styles.label}>Description</Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              style={[styles.input, { height: 100 }]}
              placeholder="Describe this moment"
              multiline
            />

            <Text style={styles.label}>Tags (comma separated)</Text>
            <TextInput
              value={tagsText}
              onChangeText={setTagsText}
              style={styles.input}
              placeholder="e.g. ideas, product"
            />

            <Text style={styles.label}>Label (optional)</Text>
            <TextInput
              value={label}
              onChangeText={setLabel}
              style={styles.input}
              placeholder="e.g. Voice Memo"
            />

            <View style={styles.mediaControlsRow}>
              <TouchableOpacity
                onPress={() =>
                  isRecording ? stopRecording() : startRecording()
                }
                style={[
                  styles.actionBtn,
                  isRecording ? styles.cancelBtn : styles.addBtn,
                ]}
              >
                <Text style={isRecording ? styles.cancelText : styles.addText}>
                  {isRecording ? "Stop" : "Record"}
                </Text>
              </TouchableOpacity>
              <Text style={{ alignSelf: "center", marginLeft: 8 }}>
                {recordedUri ? "Recorded audio ready" : "No recording"}
              </Text>
            </View>

            <View style={styles.mediaControlsRow}>
              <TouchableOpacity
                onPress={pickImages}
                style={[styles.actionBtn, styles.addBtn]}
              >
                <Text style={styles.addText}>Pick Images</Text>
              </TouchableOpacity>
              <Text style={{ alignSelf: "center", marginLeft: 8 }}>
                {selectedImages.length
                  ? `${selectedImages.length} selected`
                  : "No images"}
              </Text>
            </View>

            {selectedImages.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.previewRow}
              >
                {selectedImages.map((uri) => (
                  <Image
                    key={uri}
                    source={{ uri }}
                    style={styles.previewThumb}
                  />
                ))}
              </ScrollView>
            ) : null}
          </ScrollView>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={onClose}
              style={[styles.actionBtn, styles.cancelBtn]}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[styles.actionBtn, styles.addBtn]}
              accessibilityLabel="Save Moment"
            >
              <Text style={styles.addText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    height: "80%",
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  header: { fontSize: 18, fontWeight: "700", color: "#0F172A" },
  label: { marginTop: 8, color: "#475569", fontWeight: "600" },
  input: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#E6E9EE",
    borderRadius: 8,
    padding: 10,
    color: "#0F172A",
  },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 12,
  },
  actionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginLeft: 8,
  },
  cancelBtn: { backgroundColor: "#F3F4F6" },
  addBtn: { backgroundColor: "#EF4444" },
  cancelText: { color: "#374151", fontWeight: "700" },
  addText: { color: "#fff", fontWeight: "700" },
  mediaControlsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  previewRow: { marginTop: 8 },
  previewThumb: { width: 80, height: 80, borderRadius: 8, marginRight: 8 },
});
