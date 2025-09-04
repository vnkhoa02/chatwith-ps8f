import { Link } from "expo-router";
import { StyleSheet, Text, TextInput, View } from "react-native";

export default function VerifyEmail() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        {`We've sent a 6-digit code to your email`}
      </Text>
      <View style={styles.codeContainer}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <TextInput
            key={i}
            style={styles.codeInput}
            maxLength={1}
            keyboardType="numeric"
            placeholderTextColor="#BBB"
          />
        ))}
      </View>
      <Link href="/success" style={styles.button}>
        <Text style={styles.buttonText}>Continue</Text>
      </Link>
      <Link href="/device-authentication" style={styles.changeLink}>
        <Text style={styles.changeText}>Change Email</Text>
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
  codeContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  codeInput: {
    width: 40,
    height: 40,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 5,
    marginHorizontal: 5,
    textAlign: "center",
    color: "#FFF",
    backgroundColor: "#222",
  },
  button: {
    backgroundColor: "#1E90FF",
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#FFF",
    textAlign: "center",
  },
  changeLink: {
    marginTop: 10,
  },
  changeText: {
    color: "#1E90FF",
  },
});
