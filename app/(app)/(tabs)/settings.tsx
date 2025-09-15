import SharedHeader from "@/components/SharedHeader";
import useAuth from "@/hooks/useAuth";
import { AntDesign, Feather, FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Alert,
  GestureResponderEvent,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type SectionProps = {
  title?: string;
  children: React.ReactNode;
};

const Section: React.FC<SectionProps> = ({ title, children }) => (
  <View style={styles.section}>
    {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
    <View style={styles.sectionContent}>{children}</View>
  </View>
);

type ItemProps = {
  label: string;
  rightText?: string;
  icon?: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
};

const Item: React.FC<ItemProps> = ({ label, rightText, icon, onPress }) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.item,
        pressed ? { opacity: 0.7 } : undefined,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.itemLeft}>
        {/* placeholder icon */}
        <View style={styles.iconPlaceholder}>
          <View style={styles.iconInner}>
            {icon ? (
              icon
            ) : (
              <AntDesign name="question" size={22} color="white" />
            )}
          </View>
        </View>

        <Text style={styles.itemLabel}>{label}</Text>
      </View>

      <View style={styles.itemRight}>
        {rightText && <Text style={styles.itemRightText}>{rightText}</Text>}

        <AntDesign name="right" size={18} color="white" />
      </View>
    </Pressable>
  );
};

const SettingsScreen: React.FC = () => {
  const router = useRouter();
  const { signOut } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <SharedHeader title="Settings" customTitleStyle={{ color: "#FFFFFF" }} />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrap}>
            <Image
              source={require("../../../assets/images/icon.png")}
              style={styles.avatar}
            />
            <View style={styles.avatarBadge}>
              <View style={styles.cameraInner} />
            </View>
          </View>

          <View style={styles.profileText}>
            <Text style={styles.profileName}>Sarah Johnson</Text>
            <Text style={styles.profileEmail}>sarah.johnson@email.com</Text>
            <Pressable style={styles.editProfile} onPress={() => {}}>
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </Pressable>
          </View>
        </View>

        <Section title="General">
          <Item
            label="Chat History"
            icon={<AntDesign name="message1" size={22} color="white" />}
            onPress={() => {}}
          />
          <Item
            label="Memos"
            icon={<FontAwesome5 name="microphone" size={22} color="white" />}
            onPress={() => {}}
          />
          <Item
            label="Moments"
            icon={<AntDesign name="clockcircle" size={22} color="white" />}
            onPress={() => {}}
          />
          <Item
            label="Linked Devices"
            icon={<AntDesign name="qrcode" size={22} color="white" />}
            onPress={() => router.push("/qr_scan")}
          />
        </Section>

        <Section title="Preferences">
          <Item
            label="Notifications"
            icon={<AntDesign name="bells" size={22} color="white" />}
            onPress={() => {}}
          />
          <Item
            label="Theme"
            rightText="Dark"
            icon={<AntDesign name="skin" size={22} color="white" />}
            onPress={() => {}}
          />
          <Item
            label="Language"
            rightText="English"
            icon={<Feather name="globe" size={22} color="white" />}
            onPress={() => {}}
          />
        </Section>

        <Section title="Privacy & Security">
          <Item
            label="Privacy"
            icon={<AntDesign name="lock1" size={18} color="white" />}
            onPress={() => {}}
          />
          <Item
            label="Data Export"
            icon={<AntDesign name="export" size={18} color="white" />}
            onPress={() => {}}
          />
        </Section>

        <Section title="Support">
          <Item
            label="Help & FAQ"
            icon={<AntDesign name="questioncircleo" size={18} color="white" />}
            onPress={() => {}}
          />
          <Item
            label="Contact Support"
            icon={<AntDesign name="customerservice" size={18} color="white" />}
            onPress={() => {}}
          />
          <Item
            label="Rate App"
            icon={<AntDesign name="staro" size={18} color="white" />}
            onPress={() => {}}
          />
        </Section>

        <View style={styles.signOutWrap}>
          <Pressable
            style={styles.signOutButton}
            onPress={() => {
              Alert.alert(
                "Sign Out",
                "Are you sure you want to sign out?",
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Sign Out",
                    style: "destructive",
                    onPress: () =>
                      signOut().then(() =>
                        router.replace("/(auth)/device-authentication")
                      ),
                  },
                ],
                { cancelable: true }
              );
            }}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#202123",
  },
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 64,
    backgroundColor: "#202123",
  },

  /* Profile */
  profileContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingVertical: 8,
    borderBottomColor: "#374151",
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    marginRight: 12,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 999,
    backgroundColor: "#111",
  },
  avatarBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: "#10A37F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#202123",
  },
  cameraInner: {
    width: 12,
    height: 12,
    backgroundColor: "#ffffff",
    borderRadius: 2,
  },
  profileText: {
    flex: 1,
    justifyContent: "center",
  },
  profileName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  profileEmail: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  editProfile: {
    marginTop: 8,
    width: 96,
  },
  editProfileText: {
    color: "#10A37F",
    fontSize: 14,
    fontWeight: "500",
  },

  /* Sections */
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9CA3AF",
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: "transparent",
  },

  /* Item */
  item: {
    height: 48,
    backgroundColor: "transparent",
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "rgba(16,163,127,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  iconInner: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: "#10A37F",
  },
  itemLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "400",
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 8,
  },
  itemRightText: {
    color: "#9CA3AF",
    fontSize: 14,
    marginRight: 8,
  },
  /* Sign out */
  signOutWrap: {
    paddingVertical: 14,
    alignItems: "center",
  },
  signOutButton: {
    width: "100%",
    height: 56,
    borderRadius: 12,
    backgroundColor: "#DC2626",
    alignItems: "center",
    justifyContent: "center",
  },
  signOutText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },

  /* Bottom nav */
  bottomNav: {
    height: 80,
    backgroundColor: "#171717",
    borderTopColor: "#374151",
    borderTopWidth: 1,
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  navItemActive: {
    backgroundColor: "rgba(16,185,129,0.1)",
    marginRight: 8,
    borderRadius: 8,
  },
  navIcon: {
    width: 22,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#4B5563",
    marginBottom: 6,
  },
  navIconActive: {
    width: 22,
    height: 18,
    borderRadius: 4,
    backgroundColor: "#10B981",
    marginBottom: 6,
  },
  navLabel: {
    fontSize: 12,
    color: "#E5E7EB",
  },
  navLabelActive: {
    fontSize: 12,
    color: "#FFFFFF",
  },
});
