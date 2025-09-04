import { StyleSheet, Text, TextInput, View } from "react-native";

export default function Chat() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <TextInput
        style={styles.input}
        placeholder="Message..."
        placeholderTextColor="#BBB"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: 20,
  },
  title: {
    fontSize: 24,
    color: "#FFF",
    marginBottom: 10,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#333",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    color: "#FFF",
    backgroundColor: "#222",
  },
});
