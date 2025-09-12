import React from "react";
import { StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";

type SharedHeaderProps = {
  title: string;
  subtitle?: string | null;
  rightAction?: React.ReactNode;
  customStyle?: ViewStyle | ViewStyle[];
  customTitleStyle?: TextStyle | TextStyle[];
};

export default function SharedHeader({
  title,
  subtitle,
  rightAction,
  customStyle,
  customTitleStyle,
}: SharedHeaderProps) {
  return (
    <View style={[styles.container, customStyle]}>
      <View style={styles.left}>
        <Text style={[styles.title, customTitleStyle]}>{title}</Text>
        {subtitle && (
          <Text style={[styles.subtitle, customTitleStyle]}>{subtitle}</Text>
        )}
      </View>
      <View style={styles.right}>
        {rightAction && <View style={styles.actionWrap}>{rightAction}</View>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 24,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E6E9EE",
  },
  left: { flex: 1 },
  title: { fontSize: 22, fontWeight: "800", color: "#0F172A" },
  subtitle: { marginTop: 6, color: "#64748B" },
  right: { alignItems: "center", justifyContent: "center" },
  actionWrap: { marginBottom: 8, flexDirection: "row" },
  avatar: { width: 40, height: 40, borderRadius: 999, backgroundColor: "#eee" },
});
