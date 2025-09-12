import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Props = {
  id?: string | number;
  iconColor?: string;
  title: string;
  excerpt: string;
  timeAgo?: string;
  duration?: string;
  tags?: string[];
  onDelete?: () => void;
};

export default function MemoCard({
  iconColor = "#60A5FA",
  title,
  excerpt,
  timeAgo,
  duration,
  tags = [],
  onDelete,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={[styles.iconWrap, { backgroundColor: `${iconColor}22` }]}>
          <Ionicons name="mic-outline" size={18} color={iconColor} />
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.excerpt} numberOfLines={2}>
            {excerpt}
          </Text>
        </View>

        <View style={styles.meta}>
          {timeAgo ? <Text style={styles.time}>{timeAgo}</Text> : null}
          <TouchableOpacity
            accessibilityLabel="More actions"
            onPress={() => setMenuVisible((s) => !s)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={{ marginLeft: 8 }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        {/* Anchored dropdown inside the card (top-right) */}
        {menuVisible ? (
          <View style={styles.anchorMenu}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuVisible(false);
                onDelete && onDelete();
              }}
            >
              <Text style={[styles.menuText, { color: "#DC2626" }]}>
                Delete
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <View style={styles.bottomRow}>
        {duration ? <Text style={styles.duration}>▶ {duration}</Text> : null}
        <View style={styles.tagsRow}>
          {tags.map((t) => (
            <View key={t} style={styles.tag}>
              <Text style={styles.tagText}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
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
  topRow: { flexDirection: "row", alignItems: "flex-start" },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  content: { flex: 1 },
  meta: {
    flexDirection: "row",
  },
  title: { fontSize: 16, fontWeight: "700", color: "#0F172A" },
  excerpt: { marginTop: 6, color: "#64748B" },
  time: { color: "#9CA3AF", marginLeft: 8, fontSize: 12 },
  bottomRow: { flexDirection: "row", alignItems: "center", marginTop: 12 },
  duration: { color: "#2563EB", fontWeight: "600", marginRight: 12 },
  tagsRow: { flexDirection: "row", flexWrap: "wrap" },
  tag: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
  },
  tagText: { color: "#111827", fontWeight: "600" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuBox: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 8,
    overflow: "hidden",
    elevation: 6,
  },
  menuItem: { padding: 12 },
  menuText: { fontSize: 16, color: "#111827" },
  anchorMenu: {
    position: "absolute",
    right: 12,
    top: 36,
    backgroundColor: "#fff",
    borderRadius: 8,
    elevation: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    overflow: "hidden",
  },
});
