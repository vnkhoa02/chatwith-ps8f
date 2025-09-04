import { Link } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function Success() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eepis Assistant</Text>
      <Text style={styles.subtitle}>Successfully verified!</Text>
      <Link href="/(tabs)" style={styles.button}>
        <Text style={styles.buttonText}>Go to App</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0000FF",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "#FFF",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#FFF",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#000",
    textAlign: "center",
  },
});
