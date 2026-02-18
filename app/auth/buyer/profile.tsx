import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { authAPI } from "../../../services/api";
import { ModernCard, SegmentedTabs } from "../../ui/components";

const showAlert = (title: string, message: string, onConfirm?: () => void) => {
  if (Platform.OS === "web") {
    const result = window.confirm(`${title}\n\n${message}`);
    if (result && onConfirm) onConfirm();
  } else {
    if (onConfirm) {
      Alert.alert(title, message, [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: onConfirm },
      ]);
    } else {
      Alert.alert(title, message);
    }
  }
};

/* ---------- TYPES ---------- */
type BuyerProfileType = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  companyName: string;
  companyAddress?: {
    city?: string;
    state?: string;
    country?: string;
  };
  verified?: boolean;
};

export default function BuyerProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [buyer, setBuyer] = useState<BuyerProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "activity">("profile");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if user exists
      if (!user) {
        setError("No user session found. Please login again.");
        return;
      }

      // Use user from AuthContext
      setBuyer({
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.phone || "",
        // @ts-ignore
        companyName: user.companyName || user["Company Name"] || "N/A",
        // @ts-ignore
        companyAddress: user.companyAddress || user["Company Address"],
        verified: true,
      });

      console.log("Profile - Successfully loaded");
    } catch (e: any) {
      console.error("Profile - Error:", e.message || e);
      if (e.response?.status === 401) {
        await logout();
        router.replace("/auth/buyerlogin");
      }
      setError("Unable to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace("/");
  };

  const handleDeleteAccount = () => {
    showAlert(
      "Delete Account",
      "Are you sure you want to delete your account? This action cannot be undone. All your data including demands, connections, and business information will be permanently deleted.",
      async () => {
        try {
          if (!buyer?.id) {
            showAlert("Error", "Unable to delete account. User ID not found.");
            return;
          }

          await authAPI.buyerDelete(buyer.id);
          
          showAlert("Account Deleted", "Your account has been successfully deleted.");
          
          // Logout and redirect to home
          await logout();
          router.replace("/");
        } catch (error: any) {
          showAlert(
            "Delete Failed",
            error.response?.data?.message || "Unable to delete account. Please try again."
          );
        }
      }
    );
  };

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 items-center justify-center">
        <ActivityIndicator size="large" color="#059669" />
        <Text className="text-zinc-500 mt-4">Loading profile...</Text>
      </SafeAreaView>
    );
  }

  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 items-center justify-center px-6">
        <View className="h-16 w-16 rounded-full bg-red-100 items-center justify-center mb-4">
          <MaterialCommunityIcons name="alert-circle" size={32} color="#DC2626" />
        </View>
        <Text className="text-zinc-900 font-bold text-lg text-center mb-2">
          {error}
        </Text>
        <Text className="text-zinc-500 text-center mb-6">
          Please try logging in again or contact support.
        </Text>
        <TouchableOpacity
          className="bg-brand-600 rounded-2xl py-3 px-6"
          onPress={handleLogout}
          activeOpacity={0.9}
        >
          <Text className="text-white font-bold">Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* HEADER */}
      <View className="items-center pt-6 pb-5 px-5 bg-white border-b border-gray-100">
        <View className="h-24 w-24 rounded-full bg-brand-100 items-center justify-center mb-3 shadow-sm">
          <MaterialCommunityIcons
            name="account"
            size={48}
            color="#059669"
          />
        </View>
        <Text className="text-zinc-900 text-2xl font-extrabold">{buyer?.companyName}</Text>
        <View className="flex-row items-center gap-1 mt-1">
          <MaterialCommunityIcons name="briefcase" size={14} color="#71717A" />
          <Text className="text-zinc-500 text-sm">
            Buyer · {buyer?.companyAddress?.city || "-"}
          </Text>
        </View>
        {buyer?.verified && (
          <View className="mt-2 bg-brand-50 px-3 py-1 rounded-full">
            <Text className="text-brand-700 text-xs font-bold">✓ Verified</Text>
          </View>
        )}
      </View>

      {/* TABS */}
      <View className="px-5 py-4 bg-white">
        <SegmentedTabs
          tabs={[
            { key: "profile", label: "Profile" },
            { key: "activity", label: "Activity" },
          ]}
          value={activeTab}
          onChange={(k) => setActiveTab(k as any)}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* PROFILE TAB */}
        {activeTab === "profile" && (
          <View className="px-5 pt-4">
            <ModernCard className="p-5 mb-4">
              <View className="flex-row items-center gap-2 mb-4">
                <MaterialCommunityIcons name="office-building" size={22} color="#059669" />
                <Text className="text-zinc-900 text-lg font-bold">Business Details</Text>
              </View>

              <InfoRow icon="account-outline" label="Owner Name" value={buyer?.name} />
              <InfoRow icon="briefcase-outline" label="Business Name" value={buyer?.companyName} />
              <InfoRow
                icon="map-marker"
                label="Location"
                value={`${buyer?.companyAddress?.city || "-"}, ${buyer?.companyAddress?.state || "-"}`}
              />
              <InfoRow icon="phone" label="Mobile" value={buyer?.mobile} />
              <InfoRow icon="email-outline" label="Email" value={buyer?.email} />
            </ModernCard>
          </View>
        )}

        {/* ACTIVITY TAB */}
        {activeTab === "activity" && (
          <View className="px-5 pt-4">
            <ModernCard className="p-5 mb-4">
              <View className="flex-row items-center gap-2 mb-4">
                <MaterialCommunityIcons name="chart-box" size={22} color="#059669" />
                <Text className="text-zinc-900 text-lg font-bold">My Activity</Text>
              </View>

              <TouchableOpacity
                className="flex-row items-center justify-between bg-zinc-50 rounded-xl p-4"
                onPress={() => router.push("/buyer-demands")}
                activeOpacity={0.8}
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 rounded-xl bg-brand-100 items-center justify-center">
                    <MaterialCommunityIcons name="file-document-multiple" size={22} color="#059669" />
                  </View>
                  <Text className="text-zinc-900 font-semibold">Posted Demands</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#71717A" />
              </TouchableOpacity>
            </ModernCard>
          </View>
        )}

        {/* SETTINGS */}
        <View className="px-5 pt-4">
          <ModernCard className="p-5">
            <View className="flex-row items-center gap-2 mb-4">
              <MaterialCommunityIcons name="cog" size={22} color="#059669" />
              <Text className="text-zinc-900 text-lg font-bold">Settings</Text>
            </View>

            <TouchableOpacity
              className="flex-row items-center justify-between bg-red-50 border border-red-200 rounded-xl p-4 mb-3"
              onPress={handleLogout}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-3">
                <MaterialCommunityIcons name="logout" size={22} color="#DC2626" />
                <Text className="text-red-600 font-bold">Logout</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center justify-between bg-red-100 border-2 border-red-300 rounded-xl p-4"
              onPress={handleDeleteAccount}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-3">
                <MaterialCommunityIcons name="delete-forever" size={22} color="#DC2626" />
                <Text className="text-red-700 font-bold">Delete Account</Text>
              </View>
              <MaterialCommunityIcons name="alert-circle" size={20} color="#DC2626" />
            </TouchableOpacity>
          </ModernCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- SMALL COMPONENTS ---------- */
function InfoRow({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <View className="flex-row items-center gap-3 py-3 border-b border-zinc-100 last:border-b-0">
      <MaterialCommunityIcons name={icon as any} size={18} color="#71717A" />
      <View className="flex-1">
        <Text className="text-zinc-500 text-xs mb-0.5">{label}</Text>
        <Text className="text-zinc-900 font-semibold">{value || "—"}</Text>
      </View>
    </View>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value || "-"}</Text>
    </View>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tabBtn, active && styles.tabActive]}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

/* ---------- STYLES ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    alignItems: "center",
    backgroundColor: "#fff",
    paddingBottom: 20,
  },

  name: { fontSize: 20, fontWeight: "800", marginTop: 8 },
  subText: { color: "#6B7280" },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },

  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: "#2E7D32",
  },

  tabText: { color: "#6B7280", fontWeight: "600" },
  tabTextActive: { color: "#2E7D32" },

  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    padding: 16,
  },

  sectionTitle: { fontSize: 16, fontWeight: "700", marginBottom: 12 },

  infoRow: { marginBottom: 8 },
  label: { fontSize: 12, color: "#6B7280" },
  value: { fontSize: 14, fontWeight: "600" },

  rowItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
  },

  rowText: { fontSize: 15 },
  logoutRow: { marginTop: 8 },
  logoutText: { color: "#DC2626", fontWeight: "700" },

  error: { color: "#DC2626", marginBottom: 12 },
  link: { color: "#2563EB", fontWeight: "700" },
});
