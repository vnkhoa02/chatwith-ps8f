import React from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";

const MomentsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#171717" />
      <View style={styles.container}>
        <Text style={styles.title}>Moments</Text>
        <Text style={styles.subtitle}>
          Placeholder screen for the Moments tab.
        </Text>
      </View>
    </SafeAreaView>
  );
};

export default MomentsScreen;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#202123" },
  container: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 20, fontWeight: "600", color: "#FFFFFF" },
  subtitle: { marginTop: 8, color: "#9CA3AF" },
});
