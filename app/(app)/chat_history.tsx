import SharedHeader from "@/components/SharedHeader";
import { chatHistory } from "@/mock/chatHistoryData";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useRef, useState } from "react";
import {
    Animated,
    FlatList,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type ChatItem = (typeof chatHistory)[number];

const ChatCard: React.FC<{ item: ChatItem }> = ({ item }) => {
  return (
    <TouchableOpacity style={styles.card} accessibilityLabel="Open chat">
      <View style={styles.rowTop}>
        <View style={styles.leftTop}>
          <View
            style={[
              styles.iconWrap,
              { backgroundColor: `${item.iconColor}22` },
            ]}
          >
            <Ionicons
              name={item.iconName as any}
              size={18}
              color={item.iconColor}
            />
          </View>

          <View>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {item.title}
            </Text>
            <Text style={styles.preview} numberOfLines={1} ellipsizeMode="tail">
              {item.preview}
            </Text>
          </View>
        </View>

        <View style={styles.rightTop}>
          <Text style={styles.time}>{item.time}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.count}>{item.messageCount} messages</Text>
            {item.unread && <View style={styles.unreadDot} />}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ChatHistoryScreen: React.FC = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const openSearch = () => {
    setSearchOpen(true);
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  };

  const closeSearch = () => {
    Animated.timing(anim, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start(() => setSearchOpen(false));
    setQuery("");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return chatHistory;
    return chatHistory.filter((c) => {
      return (
        String(c.title).toLowerCase().includes(q) ||
        String(c.preview).toLowerCase().includes(q)
      );
    });
  }, [query]);

  const searchTranslateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-20, 0],
  });
  const searchOpacity = anim;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />

      <SharedHeader
        title="Chat History"
        subtitle="Your recent conversations"
        customStyle={{ backgroundColor: "#FFFFFF" }}
        rightAction={
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <TouchableOpacity
              style={styles.iconButton}
              accessibilityLabel="Search"
              onPress={openSearch}
            >
              <Ionicons name="search" size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              accessibilityLabel="New chat"
            >
              <Ionicons name="add-outline" size={20} />
            </TouchableOpacity>
          </View>
        }
      />

      {searchOpen && (
        <>
          <Pressable style={styles.backdrop} onPress={closeSearch} />

          <Animated.View
            style={[
              styles.floatingSearch,
              {
                opacity: searchOpacity,
                transform: [{ translateY: searchTranslateY }],
              },
            ]}
          >
            <TextInput
              placeholder="Search conversations"
              value={query}
              onChangeText={setQuery}
              style={styles.searchInput}
              autoFocus
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            <TouchableOpacity
              onPress={closeSearch}
              style={styles.closeSearchButton}
              accessibilityLabel="Close search"
            >
              <Ionicons name="close" size={20} color="#374151" />
            </TouchableOpacity>
          </Animated.View>
        </>
      )}

      <FlatList
        contentContainerStyle={styles.listContent}
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <ChatCard item={item} />}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={styles.floatingBack}
        onPress={() => router.back()}
        accessibilityLabel="Back to chat"
      >
        <Ionicons name="arrow-back" size={20} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ChatHistoryScreen;

const styles = StyleSheet.create({
  safe: { flex: 1 },
  listContent: { padding: 16, paddingBottom: 120 },
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
  },
  leftTop: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  title: { fontSize: 16, color: "#0F172A", fontWeight: "700", width: 200 },
  preview: { marginTop: 4, color: "#475569", fontSize: 14, width: 200 },
  rightTop: { alignItems: "flex-end" },
  time: { color: "#9CA3AF", fontSize: 12 },
  metaRow: { marginTop: 8, flexDirection: "row", alignItems: "center" },
  count: { color: "#9CA3AF", fontSize: 12, marginRight: 8 },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#10B981",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "#F8FAFC",
  },
  floatingSearch: {
    position: "absolute",
    left: 16,
    right: 16,
    top: 90,
    zIndex: 100,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 8,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  backdrop: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.25)",
    zIndex: 50,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
    color: "#0F172A",
  },
  closeSearchButton: {
    marginLeft: 8,
    padding: 8,
    borderRadius: 8,
  },
  floatingBack: {
    position: "absolute",
    alignSelf: "center",
    bottom: 28,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10B981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
