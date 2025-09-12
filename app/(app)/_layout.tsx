import { Stack } from "expo-router";

export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="success" />
      <Stack.Screen
        name="chat_history"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="qr_scan"
        options={{
          presentation: "modal",
        }}
      />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
