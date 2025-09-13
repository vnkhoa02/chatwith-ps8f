import MemoCard from "@/components/MemoCard";
import SharedHeader from "@/components/SharedHeader";
import { useMemos } from "@/hooks/useMemos";
import { memos as mockMemos } from "@/mock/memosData";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MemosScreen: React.FC = () => {
  const [memosList, setMemosList] = useState(mockMemos);
  const {
    isRecording,
    elapsedSeconds,
    startRecording,
    stopRecording,
    uploadFile,
    isSending,
  } = useMemos();

  function handleDelete(id: string) {
    Alert.alert("Delete memo?", "Are you sure you want to delete this memo?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => setMemosList((prev) => prev.filter((m) => m.id !== id)),
      },
    ]);
  }

  async function handleRecording() {
    if (isRecording) {
      const result = await stopRecording();
      const latestMessage = (result?.messages as any[] | undefined)
        ?.filter((m) => m.role === "assistant")
        .pop();
      if (result) {
        const newMemo = {
          id: String(Date.now()),
          iconColor: "#EF4444",
          title: "New Memo",
          excerpt: latestMessage?.content ?? "unknown",
          timeAgo: "just now",
          duration: result.duration,
          tags: [],
        };
        setMemosList((prev) => [newMemo, ...prev]);
      }
    } else {
      await startRecording();
    }
  }

  async function handleUpload() {
    try {
      const pickedAudioFile = await DocumentPicker.getDocumentAsync({
        type: "audio/*",
        copyToCacheDirectory: true,
      });
      const uri = pickedAudioFile.assets?.pop()?.uri;
      if (uri) {
        const response = await uploadFile(uri);
        const latestMessage = response?.messages
          ?.filter((m) => m.role === "assistant")
          .pop();

        if (response) {
          const newMemo = {
            id: String(Date.now()),
            iconColor: "#EF4444",
            title: "Imported Memo",
            excerpt: latestMessage?.content ?? "(Uploaded)",
            timeAgo: "just now",
            duration: "-",
            tags: [],
          };
          setMemosList((prev) => [newMemo, ...prev]);
        }
      }
    } catch (err) {
      console.error("Error picking document:", err);
      Alert.alert("Error", "Failed to pick document. Please try again.");
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <SharedHeader
        title="Memos"
        customStyle={{ backgroundColor: "#FFFFFF" }}
        rightAction={
          <View style={{ flexDirection: "row" }}>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="search-outline" size={20} color="#111827" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn}>
              <Ionicons name="filter-outline" size={20} color="#111827" />
            </TouchableOpacity>
          </View>
        }
      />

      <View style={styles.content}>
        <View style={styles.recordCard}>
          <View style={styles.recordInner}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  isRecording && { backgroundColor: "#DC2626" },
                ]}
                onPress={handleRecording}
                accessibilityLabel="Record memo"
              >
                <Ionicons
                  name={isRecording ? "ear" : "mic-outline"}
                  size={28}
                  color="#fff"
                />
              </TouchableOpacity>

              {/* small timer */}
              <View style={{ marginLeft: 12 }}>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#0F172A" }}
                >
                  {isRecording
                    ? `${Math.floor(elapsedSeconds / 60)}:${(
                        elapsedSeconds % 60
                      )
                        .toString()
                        .padStart(2, "0")}`
                    : ""}
                </Text>
              </View>
            </View>
            <View style={{ alignItems: "center" }}>
              <Text style={styles.recordTitle}>Record New Memo</Text>
              <Text style={styles.recordSub}>
                Tap to start recording your thoughts
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="folder-open-outline" size={20} color="#2563EB" />
            <Text style={styles.actionText}>Import</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="pricetag-outline" size={20} color="#10B981" />
            <Text style={styles.actionText}>Tag All</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleUpload}
            disabled={isSending}
          >
            <View style={{ alignItems: "center" }}>
              <Ionicons name="cloud-upload-outline" size={20} color="#7C3AED" />
              <Text style={styles.actionText}>Upload</Text>
            </View>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent Memos</Text>

        {isSending && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <ActivityIndicator
              size="small"
              color="#6B7280"
              style={{ marginRight: 8 }}
            />
            <Text style={{ color: "#6B7280" }}>
              {isSending ? "Uploading..." : "Processing"}
              {isSending ? "" : ""}
            </Text>
          </View>
        )}
        <FlatList
          style={{ flex: 1 }}
          data={memosList}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <MemoCard
              iconColor={item.iconColor}
              title={item.title}
              excerpt={item.excerpt}
              timeAgo={item.timeAgo}
              duration={item.duration}
              tags={item.tags}
              onDelete={() => handleDelete(item.id)}
            />
          )}
          contentContainerStyle={{ paddingBottom: 120, flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default MemosScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconBtn: { paddingHorizontal: 8, paddingVertical: 6, marginLeft: 8 },
  content: { flex: 1, padding: 16 },
  recordCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  recordInner: { alignItems: "center", justifyContent: "center" },
  recordButton: {
    width: 70,
    height: 70,
    borderRadius: 999,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    alignSelf: "center",
  },
  recordTitle: { fontSize: 20, fontWeight: "700", color: "#0F172A" },
  recordSub: { marginTop: 6, color: "#64748B" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginRight: 8,
  },
  actionText: { marginTop: 6, color: "#111827" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
});
