import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
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
  const { user, logout } = useAuth();

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

      // Use user from AuthContext first
      if (user) {
        setFarmer({
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.phone || "",
          verified: true,
          // @ts-ignore
          farmerAddress: user.farmerAddress,
        });
        setLoading(false);
        return;
      }

      // Fallback: fetch from API
      const res = await authAPI.getAllFarmers();
      // @ts-ignore - user might be null but we have fallback
      const userEmail = user?.email?.toLowerCase() || "";
      const farmers: any = res.data;
      let match: any = null;
      
      if (Array.isArray(farmers)) {
        match = farmers.find((f: any) => f?.email?.toLowerCase() === userEmail);
      }

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
      if (e.response?.status === 401) {
        await logout();
        router.replace("/auth/farmerlogin");
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
      "Are you sure you want to delete your account? This action cannot be undone. All your data including crop entries, listings, and connections will be permanently deleted.",
      async () => {
        try {
          if (!farmer?.id) {
            showAlert("Error", "Unable to delete account. User ID not found.");
            return;
          }

          await authAPI.farmerDelete(farmer.id);
          
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
