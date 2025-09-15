import { Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MomentCardProps = {
  id?: string | number;
  iconName?: string;
  iconColor?: string;
  label?: string;
  title: string;
  description: string;
  time?: string;
  tags?: string[];
  audioUrl?: string;
  images?: string[];
  onPress?: () => void;
};

export default function MomentCard({
  iconName = "chatbubble-ellipses-outline",
  iconColor = "#7C3AED",
  label,
  title,
  description,
  time,
  tags = [],
  audioUrl,
  images = [],
  onPress,
}: MomentCardProps) {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  async function togglePlayPause() {
    try {
      if (!sound && audioUrl) {
        const { sound: s } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );
        if (!isMounted.current) return;
        setSound(s);
        setIsPlaying(true);
        return;
      }

      if (sound) {
        const status = await sound.getStatusAsync();
        if ((status as any).isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
        }
      }
    } catch (err) {
      // ignore audio errors
      console.warn("Audio error", err);
    }
  }
  const Container: any = onPress ? TouchableOpacity : View;

  return (
    <Container onPress={onPress} style={styles.card}>
      {images.length > 0 ? (
        <Image
          source={{ uri: images[0] }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      ) : null}
      <View style={styles.rowTop}>
        <View style={styles.leftTop}>
          <View
            style={[styles.iconWrap, { backgroundColor: `${iconColor}22` }]}
          >
            <Ionicons name={iconName as any} size={18} color={iconColor} />
          </View>
          <Text style={styles.label}>{label}</Text>
        </View>

        {time ? <Text style={styles.time}>{time}</Text> : null}
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description} numberOfLines={3}>
        {description}
      </Text>

      {audioUrl && (
        <View style={styles.audioRow}>
          <TouchableOpacity
            onPress={togglePlayPause}
            style={styles.playBtn}
            accessibilityLabel="Play audio"
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={16}
              color="#fff"
            />
          </TouchableOpacity>
          <Text style={styles.audioLabel}>
            {isPlaying ? "Playing" : "Play audio"}
          </Text>
        </View>
      )}

      <View style={styles.tagsRow}>
        {tags.map((t) => (
          <View key={t} style={[styles.tag, { backgroundColor: tagColor(t) }]}>
            <Text style={styles.tagText}>{`#${t}`}</Text>
          </View>
        ))}
      </View>
    </Container>
  );
}

function tagColor(tag: string) {
  const map: Record<string, string> = {
    reflection: "#E0F2FE",
    goals: "#DCFCE7",
    ideas: "#F5F3FF",
    product: "#FFF7ED",
    work: "#DCFCE7",
    milestone: "#E0F2FE",
    learning: "#FEF3C7",
    technical: "#FEE2E2",
  };
  return map[tag] ?? "#EEF2FF";
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  rowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  leftTop: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    color: "#374151",
    fontWeight: "600",
  },
  time: {
    color: "#9CA3AF",
    fontSize: 12,
  },
  title: {
    marginTop: 4,
    fontSize: 18,
    color: "#0F172A",
    fontWeight: "700",
  },
  description: {
    marginTop: 8,
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
  tagsRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "600",
  },
  thumbnail: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  audioRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  audioLabel: { color: "#475569", fontWeight: "600" },
});
