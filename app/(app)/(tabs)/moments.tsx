import MomentCard from "@/components/MomentCard";
import SharedHeader from "@/components/SharedHeader";
import { moments } from "@/mock/momentsData";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  FlatList,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const MomentsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <SharedHeader
        title="Todays Moments"
        subtitle="Your daily activity feed"
        customStyle={{
          backgroundColor: "#FFFFFF",
        }}
        rightAction={
          <TouchableOpacity
            style={styles.uploadAction}
            onPress={() => {
              // TODO: wire upload action
            }}
            accessibilityLabel="Upload"
          >
            <Ionicons name="cloud-upload-outline" size={20} color="#fff" />
          </TouchableOpacity>
        }
      />

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
  uploadAction: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
});
