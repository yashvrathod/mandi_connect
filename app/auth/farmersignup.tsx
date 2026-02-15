import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AuthBackground,
  AuthCard,
  AuthHeader,
  AuthSegmentedTabs,
  AuthTextField,
  EyeToggle,
} from "./_ui";

type FormData = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  city: string;
  state: string;
  country: string;
  farmSize: string;
  cropsGrown: string;
  irrigationType: string;
  soilType: string;
};

export default function FarmerSignUp() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    city: "",
    state: "",
    country: "India",
    farmSize: "",
    cropsGrown: "",
    irrigationType: "",
    soilType: "",
  });

  const [showPassword, setShowPassword] = useState(false);

  const update = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignUp = () => {
    // No-op - API not implemented yet
  };

  return (
    <AuthBackground>
      <SafeAreaView className="flex-1">
        <StatusBar style="light" />

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 py-10"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md mx-auto">
            <AuthHeader title="Farmer Sign Up" subtitle="Create your farmer profile" />

            <View className="mb-4">
              <AuthSegmentedTabs
                leftLabel="Sign In"
                rightLabel="Sign Up"
                active="right"
                onLeftPress={() => router.push("/auth/farmerlogin")}
                onRightPress={() => {}}
              />
            </View>

            <AuthCard>
              <View className="gap-4">
                <AuthTextField
                  label="Name"
                  icon="account-outline"
                  value={form.name}
                  onChangeText={(t) => update("name", t)}
                  placeholder="Enter your name"
                />

                <AuthTextField
                  label="Email"
                  icon="email-outline"
                  value={form.email}
                  onChangeText={(t) => update("email", t)}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <AuthTextField
                  label="Mobile"
                  icon="cellphone"
                  value={form.mobile}
                  onChangeText={(t) => update("mobile", t)}
                  placeholder="Phone number"
                  keyboardType="phone-pad"
                />

                <AuthTextField
                  label="Password"
                  icon="lock-outline"
                  value={form.password}
                  onChangeText={(t) => update("password", t)}
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  right={<EyeToggle shown={showPassword} onPress={() => setShowPassword(!showPassword)} />}
                />

                <View className="h-px bg-white/10" />

                <AuthTextField
                  label="City"
                  icon="map-marker-outline"
                  value={form.city}
                  onChangeText={(t) => update("city", t)}
                  placeholder="City"
                />

                <AuthTextField
                  label="State"
                  icon="map-outline"
                  value={form.state}
                  onChangeText={(t) => update("state", t)}
                  placeholder="State"
                />

                <AuthTextField
                  label="Country"
                  icon="flag-outline"
                  value={form.country}
                  onChangeText={(t) => update("country", t)}
                  placeholder="Country"
                />

                <AuthTextField
                  label="Farm size"
                  icon="ruler-square"
                  value={form.farmSize}
                  onChangeText={(t) => update("farmSize", t)}
                  placeholder="e.g. 5 acres"
                />

                <AuthTextField
                  label="Crops grown"
                  icon="sprout"
                  value={form.cropsGrown}
                  onChangeText={(t) => update("cropsGrown", t)}
                  placeholder="e.g. Wheat, Rice"
                />

                <AuthTextField
                  label="Irrigation type"
                  icon="water-outline"
                  value={form.irrigationType}
                  onChangeText={(t) => update("irrigationType", t)}
                  placeholder="e.g. Drip"
                />

                <AuthTextField
                  label="Soil type"
                  icon="earth"
                  value={form.soilType}
                  onChangeText={(t) => update("soilType", t)}
                  placeholder="e.g. Loamy"
                />

                <TouchableOpacity
                  onPress={handleSignUp}
                  className="bg-farmer-600 rounded-2xl py-4 mt-2"
                  activeOpacity={0.9}
                >
                  <Text className="text-white text-center font-extrabold text-base">Sign Up</Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center pt-2">
                  <Text className="text-zinc-400 text-sm">Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.push("/auth/farmerlogin")}>
                    <Text className="text-farmer-400 text-sm font-semibold">Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </AuthCard>
          </View>
        </ScrollView>
      </SafeAreaView>
    </AuthBackground>
  );
}
