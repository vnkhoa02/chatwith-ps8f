import { Message } from "@/hooks/useAi";
import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Props {
  messages: Message[];
}

export default function ChatMessages({ messages }: Props) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const isBase64Audio = (str: string) =>
    /^[A-Za-z0-9+/=]+$/.test(str) && str.length > 100;

  const playAudio = async (base64: string, index: number) => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);

        if (playingIndex === index) {
          setPlayingIndex(null);
          return;
        }
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });

      const FileSystem = await import("expo-file-system");
      const path = `${FileSystem.cacheDirectory}temp-audio-${index}.m4a`;

      await FileSystem.writeAsStringAsync(path, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: path },
        { shouldPlay: true, volume: 1.0 }
      );

      setSound(newSound);
      setPlayingIndex(index);

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          newSound.unloadAsync();
          setSound(null);
          setPlayingIndex(null);
        }
      });
    } catch (err) {
      console.error("Failed to play audio", err);
    }
  };

  return (
    <FlatList
      data={messages.filter((m) => m.role !== "system")}
      keyExtractor={(item, index) => String((item as any).id ?? index)}
      nestedScrollEnabled={true}
      contentContainerStyle={styles.list}
      maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
      keyboardShouldPersistTaps="handled"
      contentInsetAdjustmentBehavior="automatic"
      style={{ flex: 1 }}
      renderItem={({ item, index }) => {
        const isAudio = isBase64Audio(item.content);
        const isThisPlaying = playingIndex === index;

        return (
          <View
            style={[
              styles.messageContainer,
              item.role === "user"
                ? styles.userMessage
                : styles.assistantMessage,
            ]}
          >
            {isAudio ? (
              <TouchableOpacity
                style={styles.audioBox}
                onPress={() => playAudio(item.content, index)}
              >
                <Ionicons
                  name={isThisPlaying ? "stop-circle" : "play-circle"}
                  size={28}
                  color="#fff"
                />
                <Text style={styles.audioText}>
                  {isThisPlaying ? "Playing..." : "Play Audio"}
                </Text>
              </TouchableOpacity>
            ) : (
              <Text
                style={[
                  styles.messageText,
                  item.role === "user"
                    ? styles.userMessageText
                    : styles.assistantMessageText,
                ]}
              >
                {item.content}
              </Text>
            )}

            {/* 🔹 Inline image preview (use ScrollView instead of FlatList) */}
            {item?.imageUrls && item.imageUrls.length > 0 && (
              <ScrollView
                horizontal
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                style={{ marginTop: 8, maxHeight: 250 }}
              >
                {item.imageUrls.map((imgUrl, i) => (
                  <Image
                    key={i}
                    source={{ uri: imgUrl }}
                    style={styles.messageImage}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
            )}
          </View>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  messageContainer: {
    maxHeight: 9999,
    marginVertical: 6,
    padding: 10,
    borderRadius: 12,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0A84FF",
    borderBottomRightRadius: 4,
  },
  assistantMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#2C2C2E",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    color: "#fff",
    flexShrink: 1, // ✅ prevent overflow on long text
  },
  userMessageText: {
    color: "#fff",
  },
  assistantMessageText: {
    color: "#fff",
  },
  audioBox: {
    flexDirection: "row",
    alignItems: "center",
    width: 250,
  },
  audioText: {
    color: "#fff",
    marginLeft: 8,
  },
  messageImage: {
    marginRight: 8,
    width: 250,
    borderRadius: 8,
  },
});
