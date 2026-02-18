import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Platform, ScrollView, Text, TouchableOpacity, View } from "react-native";
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

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

type BuyerForm = {
  name: string;
  email: string;
  mobile: string;
  password: string;
  companyName: string;
  city: string;
  state: string;
  country: string;
  preferredCrops: string;
};

export default function BuyerSignUp() {
  const router = useRouter();

  const [form, setForm] = useState<BuyerForm>({
    name: "",
    email: "",
    mobile: "",
    password: "",
    companyName: "",
    city: "",
    state: "",
    country: "India",
    preferredCrops: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const update = (key: keyof BuyerForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSignUp = async () => {
    const { name, email, mobile, password, companyName, city, state, country } = form;

    if (!name || !email || !mobile || !password || !companyName || !city || !state || !country) {
      showAlert("Missing fields", "Please fill all required fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showAlert("Invalid email", "Please enter a valid email");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      showAlert("Invalid mobile", "Enter a valid 10-digit mobile number");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name,
        email: email.toLowerCase().trim(),
        mobile: mobile,
        password: password,
        companyName: companyName,
        companyAddress: {
          city: city,
          state: state,
          country: country,
        },
        preferredCrops: form.preferredCrops
          ? form.preferredCrops.split(",").map((c) => c.trim())
          : [],
      };

      const res = await authAPI.buyerSignup(payload);

      // DEV MODE: Skip email verification - allow immediate login
      showAlert("Success", res.data?.message || "Buyer registered successfully! You can now login to your account.");
      router.replace("/auth/buyerlogin");
    } catch (err: any) {
      showAlert("Registration failed", err.response?.data?.message || "Something went wrong");
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
                onLeftPress={() => router.push("/auth/buyerlogin")}
                onRightPress={() => {}}
              />
            </View>

            <AuthCard>
              <AuthHeader 
                title="Buyer Sign Up" 
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
                  placeholder="10-digit mobile number"
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

                {/* Company Details Section */}
                <View className="mt-4">
                  <SectionHeader title="Company Details" />
                </View>

                <AuthTextField
                  label="Company Name"
                  icon="office-building-outline"
                  value={form.companyName}
                  onChangeText={(t) => update("companyName", t)}
                  placeholder="Your company"
                />

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

                {/* Preferences Section */}
                <View className="mt-4">
                  <SectionHeader title="Preferences (Optional)" />
                </View>

                <AuthTextField
                  label="Preferred Crops"
                  icon="sprout"
                  value={form.preferredCrops}
                  onChangeText={(t) => update("preferredCrops", t)}
                  placeholder="e.g. Wheat, Rice, Corn"
                />

                <TouchableOpacity
                  onPress={handleSignUp}
                  disabled={loading}
                  className="bg-agri-primary rounded-2xl py-4 mt-4"
                  activeOpacity={0.9}
                >
                  <Text className="text-white text-center font-bold text-base">
                    {loading ? "Creating account…" : "Create Account"}
                  </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center pt-2">
                  <Text className="text-gray-600 text-sm">Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.push("/auth/buyerlogin")}>
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
