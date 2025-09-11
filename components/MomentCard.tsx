import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type MomentCardProps = {
  id?: string | number;
  iconName?: string;
  iconColor?: string;
  label?: string;
  title: string;
  description: string;
  time?: string;
  tags?: string[];
};

export default function MomentCard({
  iconName = "chatbubble-ellipses-outline",
  iconColor = "#7C3AED",
  label,
  title,
  description,
  time,
  tags = [],
}: MomentCardProps) {
  return (
    <View style={styles.card}>
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

      <View style={styles.tagsRow}>
        {tags.map((t) => (
          <View key={t} style={[styles.tag, { backgroundColor: tagColor(t) }]}>
            <Text style={styles.tagText}>{`#${t}`}</Text>
          </View>
        ))}
      </View>
    </View>
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
});
