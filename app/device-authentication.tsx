import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function DeviceAuthentication() {
  return (
    <View style={styles.container}>
      <Ionicons
        name="shield-checkmark-outline"
        size={50}
        color="#1E90FF"
        style={styles.icon}
      />
      <Text style={styles.title}>Device Authentication</Text>
      <Text style={styles.subtitle}>
        Enter your email address to register this device
      </Text>
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#BBB"
      />
      <Link href="/verify-email" style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    color: "#FFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#BBB",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    width: "80%",
    height: 40,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 5,
    marginBottom: 10,
    paddingHorizontal: 10,
    color: "#FFF",
    backgroundColor: "#222",
  },
  button: {
    backgroundColor: "#555",
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
  },
});
