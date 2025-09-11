import MomentCard from "@/components/MomentCard";
import { moments } from "@/mock/momentsData";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const MomentsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.heading}>Todays Moments</Text>
        <Text style={styles.subheading}>Your daily activity feed</Text>

        <TouchableOpacity
          style={styles.uploadButton}
          onPress={() => {
            // TODO: wire upload action
          }}
          accessibilityLabel="Upload"
        >
          <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        contentContainerStyle={styles.listContent}
        data={moments}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <MomentCard
            iconName={item.iconName}
            iconColor={item.iconColor}
            label={item.label}
            title={item.title}
            description={item.description}
            time={item.time}
            tags={item.tags}
          />
        )}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default MomentsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
  },
  heading: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  subheading: { marginTop: 6, color: "#64748B" },
  listContent: { padding: 16, paddingBottom: 120 },
  uploadButton: {
    position: "absolute",
    right: 16,
    top: 18,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
