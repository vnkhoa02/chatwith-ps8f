import MemoCard from "@/components/MemoCard";
import SharedHeader from "@/components/SharedHeader";
import { memos as mockMemos } from "@/mock/memosData";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
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
            <View style={styles.recordButton}>
              <Ionicons name="mic" size={28} color="#fff" />
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

          <TouchableOpacity style={styles.actionBtn}>
            <Ionicons name="cloud-upload-outline" size={20} color="#7C3AED" />
            <Text style={styles.actionText}>Upload</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Recent Memos</Text>

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
