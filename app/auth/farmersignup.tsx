import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authAPI } from "../../services/api";
import {
  AuthBackground,
  AuthCard,
  AuthHeader,
  AuthSegmentedTabs,
  AuthTextField,
  EyeToggle,
  SectionHeader,
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

  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    const { name, email, mobile, password, city, state, country, farmSize, cropsGrown, irrigationType, soilType } = form;

    // Validation
    if (!name || !email || !mobile || !password || !city || !state) {
      alert("Please fill all required fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      alert("Enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name,
        mobile: mobile,
        email: email.toLowerCase().trim(),
        password: password,
        farmerAddress: {
          city: city,
          state: state,
          country: country,
        },
        farmDetails: {
          farmSize: farmSize || "Not specified",
          cropIds: [],
          preferredMarketIds: [],
          irrigationType: irrigationType || "Not specified",
          soilType: soilType || "Not specified",
        },
      };

      const res = await authAPI.farmerSignup(payload);

      // DEV MODE: Skip email verification - allow immediate login
      alert(res.data?.message || "Farmer registered successfully! You can now login to your account.");
      router.replace("/auth/farmerlogin");
    } catch (err: any) {
      alert(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView className="flex-1">
        <StatusBar style="dark" />

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-5 py-10"
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md mx-auto">
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
              <AuthHeader 
                title="Farmer Sign Up" 
                subtitle="Create your account" 
                icon="account-plus-outline"
              />

              <View className="gap-4 mt-6">
                {/* Personal Information Section */}
                <SectionHeader title="Personal Information" />
                
                <AuthTextField
                  label="Full Name"
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

                {/* Address Details Section */}
                <View className="mt-4">
                  <SectionHeader title="Address Details" />
                </View>

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

                {/* Farm Details Section */}
                <View className="mt-4">
                  <SectionHeader title="Farm Details" />
                </View>

                <AuthTextField
                  label="Farm Size"
                  icon="ruler-square"
                  value={form.farmSize}
                  onChangeText={(t) => update("farmSize", t)}
                  placeholder="e.g. 5 acres"
                />

                <AuthTextField
                  label="Crops Grown"
                  icon="sprout"
                  value={form.cropsGrown}
                  onChangeText={(t) => update("cropsGrown", t)}
                  placeholder="e.g. Wheat, Rice"
                />

                <AuthTextField
                  label="Irrigation Type"
                  icon="water-outline"
                  value={form.irrigationType}
                  onChangeText={(t) => update("irrigationType", t)}
                  placeholder="e.g. Drip"
                />

                <AuthTextField
                  label="Soil Type"
                  icon="earth"
                  value={form.soilType}
                  onChangeText={(t) => update("soilType", t)}
                  placeholder="e.g. Loamy"
                />

                <TouchableOpacity
                  onPress={handleSignUp}
                  disabled={loading}
                  className="bg-agri-primary rounded-2xl py-4 mt-4"
                  activeOpacity={0.9}
                >
                  <Text className="text-white text-center font-bold text-base">
                    {loading ? "Creating Account..." : "Create Account"}
                  </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center pt-2">
                  <Text className="text-gray-600 text-sm">Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.push("/auth/farmerlogin")}>
                    <Text className="text-agri-primary text-sm font-semibold">Sign In</Text>
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
