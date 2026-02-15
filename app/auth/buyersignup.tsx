import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const BASE_URL = "https://mandiconnect.onrender.com";

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
        Name: name,
        Email: email.toLowerCase().trim(),
        Mobile: mobile,
        Password: password,
        "Company Name": companyName,
        "Company Address": {
          City: city,
          State: state,
          Country: country,
        },
        PreferredCrops: form.preferredCrops
          ? form.preferredCrops.split(",").map((c) => c.trim())
          : [],
      };

      const res = await axios.post(`${BASE_URL}/buyer/signup`, payload, {
        headers: { "Content-Type": "application/json" },
      });

      showAlert("Success", res.data?.message || "Buyer registered successfully");
      router.replace("/auth/buyerlogin");
    } catch (err: any) {
      showAlert("Registration failed", err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={["#E0F2FE", "#F0FDF4", "#FFFFFF"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1">
        <StatusBar style="dark" />

        <ScrollView
          className="flex-1 px-6"
          contentContainerStyle={{ paddingTop: 40, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="w-full max-w-md mx-auto">
            {/* Title */}
            <View className="mb-6">
              <Text className="text-zinc-900 text-3xl font-bold text-center">
                Create Account
              </Text>
              <Text className="text-zinc-500 text-center mt-2">
                Fill in your details to get started
              </Text>
            </View>

              {/* Signup Card */}
              <View className="bg-white rounded-3xl shadow-lg border border-zinc-100 p-6">
                {/* Segmented Tab */}
                <View className="flex-row bg-zinc-100 rounded-2xl p-1 mb-6">
                  <TouchableOpacity
                    className="flex-1 py-3"
                    onPress={() => router.push("/auth/buyerlogin")}
                    activeOpacity={0.8}
                  >
                    <Text className="text-zinc-500 text-center font-semibold">Sign In</Text>
                  </TouchableOpacity>
                  <View className="flex-1 bg-white rounded-xl py-3 shadow-sm">
                    <Text className="text-zinc-900 text-center font-bold">Sign Up</Text>
                  </View>
                </View>

                {/* Form Fields */}
                <View className="gap-4">
                  {/* Name */}
                  <View>
                    <Text className="text-zinc-700 font-semibold mb-2 text-sm">Full Name</Text>
                    <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3">
                      <MaterialCommunityIcons name="account-outline" size={20} color="#71717A" />
                      <TextInput
                        value={form.name}
                        onChangeText={(t) => update("name", t)}
                        placeholder="Enter your name"
                        placeholderTextColor="#A1A1AA"
                        className="flex-1 ml-3 text-zinc-900"
                      />
                    </View>
                  </View>

                  {/* Email */}
                  <View>
                    <Text className="text-zinc-700 font-semibold mb-2 text-sm">Email</Text>
                    <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3">
                      <MaterialCommunityIcons name="email-outline" size={20} color="#71717A" />
                      <TextInput
                        value={form.email}
                        onChangeText={(t) => update("email", t)}
                        placeholder="Enter your email"
                        placeholderTextColor="#A1A1AA"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        className="flex-1 ml-3 text-zinc-900"
                      />
                    </View>
                  </View>

                  {/* Mobile */}
                  <View>
                    <Text className="text-zinc-700 font-semibold mb-2 text-sm">Mobile</Text>
                    <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3">
                      <MaterialCommunityIcons name="cellphone" size={20} color="#71717A" />
                      <TextInput
                        value={form.mobile}
                        onChangeText={(t) => update("mobile", t)}
                        placeholder="10-digit mobile number"
                        placeholderTextColor="#A1A1AA"
                        keyboardType="phone-pad"
                        className="flex-1 ml-3 text-zinc-900"
                      />
                    </View>
                  </View>

                  {/* Password */}
                  <View>
                    <Text className="text-zinc-700 font-semibold mb-2 text-sm">Password</Text>
                    <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3">
                      <MaterialCommunityIcons name="lock-outline" size={20} color="#71717A" />
                      <TextInput
                        value={form.password}
                        onChangeText={(t) => update("password", t)}
                        placeholder="Create a password"
                        placeholderTextColor="#A1A1AA"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        className="flex-1 ml-3 text-zinc-900"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <MaterialCommunityIcons
                          name={showPassword ? "eye-outline" : "eye-off-outline"}
                          size={20}
                          color="#71717A"
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Divider */}
                  <View className="h-px bg-zinc-200 my-2" />

                  {/* Company Name */}
                  <View>
                    <Text className="text-zinc-700 font-semibold mb-2 text-sm">Company Name</Text>
                    <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3">
                      <MaterialCommunityIcons name="office-building-outline" size={20} color="#71717A" />
                      <TextInput
                        value={form.companyName}
                        onChangeText={(t) => update("companyName", t)}
                        placeholder="Your company"
                        placeholderTextColor="#A1A1AA"
                        className="flex-1 ml-3 text-zinc-900"
                      />
                    </View>
                  </View>

                  {/* City */}
                  <View>
                    <Text className="text-zinc-700 font-semibold mb-2 text-sm">City</Text>
                    <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3">
                      <MaterialCommunityIcons name="map-marker-outline" size={20} color="#71717A" />
                      <TextInput
                        value={form.city}
                        onChangeText={(t) => update("city", t)}
                        placeholder="City"
                        placeholderTextColor="#A1A1AA"
                        className="flex-1 ml-3 text-zinc-900"
                      />
                    </View>
                  </View>

                  {/* State */}
                  <View>
                    <Text className="text-zinc-700 font-semibold mb-2 text-sm">State</Text>
                    <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3">
                      <MaterialCommunityIcons name="map-outline" size={20} color="#71717A" />
                      <TextInput
                        value={form.state}
                        onChangeText={(t) => update("state", t)}
                        placeholder="State"
                        placeholderTextColor="#A1A1AA"
                        className="flex-1 ml-3 text-zinc-900"
                      />
                    </View>
                  </View>

                  {/* Country */}
                  <View>
                    <Text className="text-zinc-700 font-semibold mb-2 text-sm">Country</Text>
                    <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3">
                      <MaterialCommunityIcons name="flag-outline" size={20} color="#71717A" />
                      <TextInput
                        value={form.country}
                        onChangeText={(t) => update("country", t)}
                        placeholder="Country"
                        placeholderTextColor="#A1A1AA"
                        className="flex-1 ml-3 text-zinc-900"
                      />
                    </View>
                  </View>

                  {/* Preferred Crops */}
                  <View>
                    <Text className="text-zinc-700 font-semibold mb-2 text-sm">
                      Preferred Crops (Optional)
                    </Text>
                    <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3">
                      <MaterialCommunityIcons name="sprout" size={20} color="#71717A" />
                      <TextInput
                        value={form.preferredCrops}
                        onChangeText={(t) => update("preferredCrops", t)}
                        placeholder="e.g. Wheat, Rice, Corn"
                        placeholderTextColor="#A1A1AA"
                        className="flex-1 ml-3 text-zinc-900"
                      />
                    </View>
                  </View>

                  {/* Sign Up Button */}
                  <TouchableOpacity
                    onPress={handleSignUp}
                    disabled={loading}
                    activeOpacity={0.9}
                    className="bg-brand-600 rounded-2xl py-4 mt-2 shadow-sm"
                  >
                    <Text className="text-white text-center font-extrabold text-base">
                      {loading ? "Creating account…" : "Sign Up"}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Footer */}
                <View className="flex-row justify-center items-center mt-4">
                  <Text className="text-zinc-500 text-sm">Already have an account? </Text>
                  <TouchableOpacity onPress={() => router.push("/auth/buyerlogin")}>
                    <Text className="text-brand-600 text-sm font-bold">Sign In</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
