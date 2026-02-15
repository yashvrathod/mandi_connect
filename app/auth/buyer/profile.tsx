import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { ModernCard, SegmentedTabs } from "../../ui/components";

const BASE_URL = "https://mandiconnect.onrender.com";

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
      
      const token = await AsyncStorage.getItem("token");
      const loginEmail = await AsyncStorage.getItem("loginEmail");

      console.log("Profile - Token:", token ? "exists" : "missing");
      console.log("Profile - Login Email:", loginEmail);

      if (!token || !loginEmail) {
        setError("Session expired. Please login again.");
        return;
      }

      const res = await axios.get(`${BASE_URL}/buyer/getAll`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("Profile - API Response:", res.data ? `${res.data.length} buyers` : "empty");

      // Try multiple matching strategies
      const matchedBuyer = res.data.find((b: any) => {
        const buyerEmail = b.Email || b.email;
        return buyerEmail?.toLowerCase() === loginEmail.toLowerCase();
      });

      console.log("Profile - Matched Buyer:", matchedBuyer ? "found" : "not found");

      if (!matchedBuyer) {
        setError("Buyer profile not found. Please contact support.");
        console.error("Profile - No match found for email:", loginEmail);
        return;
      }

      setBuyer({
        id: String(matchedBuyer.id || matchedBuyer._id),
        name: matchedBuyer.Name || matchedBuyer.name,
        email: matchedBuyer.Email || matchedBuyer.email,
        mobile: matchedBuyer.Mobile || matchedBuyer.mobile,
        companyName: matchedBuyer["Company Name"] || matchedBuyer.companyName || "Unknown Company",
        companyAddress: {
          city: matchedBuyer["Company Address"]?.City || matchedBuyer.companyAddress?.city,
          state: matchedBuyer["Company Address"]?.State || matchedBuyer.companyAddress?.state,
          country: matchedBuyer["Company Address"]?.Country || matchedBuyer.companyAddress?.country,
        },
        verified: matchedBuyer.verified || false,
      });
      
      console.log("Profile - Successfully loaded");
    } catch (e: any) {
      console.error("Profile - Error:", e.message || e);
      setError("Unable to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "loginEmail", "role"]);
    router.replace("/auth/buyerlogin");
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
          onPress={logout}
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
              className="flex-row items-center justify-between bg-red-50 border border-red-200 rounded-xl p-4"
              onPress={logout}
              activeOpacity={0.8}
            >
              <View className="flex-row items-center gap-3">
                <MaterialCommunityIcons name="logout" size={22} color="#DC2626" />
                <Text className="text-red-600 font-bold">Logout</Text>
              </View>
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
