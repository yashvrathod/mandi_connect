import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { ModernCard, SegmentedTabs } from "../../ui/components";

const BASE_URL = "https://mandiconnect.onrender.com";

type FarmerProfileType = {
  id: string;
  name: string;
  email: string;
  mobile: string;
  verified?: boolean;
  farmerAddress?: {
    city?: string;
    state?: string;
  };
};

export default function FarmerProfile() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [farmer, setFarmer] = useState<FarmerProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"profile" | "activity">("profile");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please login again.");
        return;
      }

      // API doesn’t require auth here in the existing codebase
      const res = await axios.get(`${BASE_URL}/farmer/getFarmers`);
      const email = JSON.parse(atob(token.split(".")[1]))?.sub?.toLowerCase();

      const match = (Array.isArray(res.data) ? res.data : []).find(
        (f: any) => f.email?.toLowerCase() === email,
      );

      if (!match) {
        setError("Farmer profile not found.");
        return;
      }

      setFarmer({
        id: String(match.id || match._id),
        name: match.name,
        email: match.email,
        mobile: match.mobile,
        verified: match.verified,
        farmerAddress: {
          city: match.farmerAddress?.city,
          state: match.farmerAddress?.state,
        },
      });
    } catch (e: any) {
      setError("Unable to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await AsyncStorage.multiRemove(["token", "role"]);
    router.replace("/auth/farmerlogin");
  };

  /* ---------- LOADING ---------- */
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 items-center justify-center">
        <StatusBar style="dark" />
        <ActivityIndicator size="large" color="#EA580C" />
        <Text className="text-zinc-500 mt-4">Loading profile…</Text>
      </SafeAreaView>
    );
  }

  /* ---------- ERROR ---------- */
  if (error) {
    return (
      <SafeAreaView className="flex-1 bg-zinc-50 items-center justify-center px-6">
        <StatusBar style="dark" />
        <View className="h-16 w-16 rounded-full bg-red-100 items-center justify-center mb-4">
          <MaterialCommunityIcons name="alert-circle" size={32} color="#DC2626" />
        </View>
        <Text className="text-zinc-900 font-bold text-lg text-center mb-2">{error}</Text>
        <Text className="text-zinc-500 text-center mb-6">
          Please login again or contact support.
        </Text>
        <TouchableOpacity
          className="bg-farmer-600 rounded-2xl py-3 px-6"
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
        <View className="h-24 w-24 rounded-full bg-farmer-100 items-center justify-center mb-3 shadow-sm">
          <MaterialCommunityIcons name="tractor" size={48} color="#059669" />
        </View>

        <Text className="text-zinc-900 text-2xl font-extrabold">{farmer?.name}</Text>

        <View className="flex-row items-center gap-1 mt-1">
          <MaterialCommunityIcons name="map-marker" size={14} color="#71717A" />
          <Text className="text-zinc-500 text-sm">
            Farmer · {farmer?.farmerAddress?.city || "-"}
          </Text>
        </View>

        {farmer?.verified ? (
          <View className="mt-2 bg-farmer-50 px-3 py-1 rounded-full">
            <Text className="text-farmer-800 text-xs font-bold">✓ Verified</Text>
          </View>
        ) : null}
      </View>

      {/* TABS */}
      <View className="px-5 py-4 bg-white">
        <SegmentedTabs
          accent="farmer"
          tabs={[
            { key: "profile", label: "Profile" },
            { key: "activity", label: "Activity" },
          ]}
          value={tab}
          onChange={(k) => setTab(k as any)}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* PROFILE */}
        {tab === "profile" ? (
          <View className="px-5 pt-4">
            <ModernCard className="p-5 mb-4">
              <SectionTitle icon="tractor" title="Personal Information" />

              <InfoRow icon="account-outline" label="Full Name" value={farmer?.name} />
              <InfoRow icon="phone" label="Mobile" value={farmer?.mobile} />
              <InfoRow icon="email-outline" label="Email" value={farmer?.email} />
              <InfoRow
                icon="map-marker"
                label="Location"
                value={`${farmer?.farmerAddress?.city || "-"}, ${
                  farmer?.farmerAddress?.state || "-"
                }`}
              />
            </ModernCard>

            <ModernCard className="p-5">
              <SectionTitle icon="cog" title="Settings" />

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
        ) : (
          <View className="px-5 pt-4">
            <ModernCard className="p-5 mb-4">
              <SectionTitle icon="chart-box" title="Activity" />

              <TouchableOpacity
                className="flex-row items-center justify-between bg-zinc-50 rounded-xl p-4"
                activeOpacity={0.8}
                onPress={() => {
                  // Keep existing route target if/when it exists
                  router.push("/farmer/my-entries" as any);
                }}
              >
                <View className="flex-row items-center gap-3">
                  <View className="h-10 w-10 rounded-xl bg-farmer-100 items-center justify-center">
                    <MaterialCommunityIcons
                      name="file-document-multiple"
                      size={22}
                      color="#059669"
                    />
                  </View>
                  <Text className="text-zinc-900 font-semibold">View My Crop Entries</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#71717A" />
              </TouchableOpacity>
            </ModernCard>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionTitle({
  icon,
  title,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  title: string;
}) {
  return (
    <View className="flex-row items-center gap-2 mb-4">
      <MaterialCommunityIcons name={icon as any} size={22} color="#059669" />
      <Text className="text-zinc-900 text-lg font-bold">{title}</Text>
    </View>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  value?: string;
}) {
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
