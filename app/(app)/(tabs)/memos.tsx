import { StatusBar } from "expo-status-bar";
import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

const MemosScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="auto" />
      <View style={styles.container}>
        <Text style={styles.title}>Memos</Text>
        <Text style={styles.subtitle}>
          Placeholder screen for the Memos tab.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default MemosScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#202123" },
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "600", color: "#FFFFFF" },
  subtitle: { marginTop: 8, color: "#9CA3AF" },
});
