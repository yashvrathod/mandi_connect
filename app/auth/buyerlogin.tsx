import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

/* ---------- ALERT ---------- */
const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function BuyerLogin() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    const emailValue = email.trim().toLowerCase();
    const passwordValue = password.trim();

    if (!emailValue || !passwordValue) {
      showAlert("Missing fields", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const url = "https://mandiconnect.onrender.com/buyer/login";

      // Backend payload expectations are inconsistent across routes.
      // Try the documented Buyer payload first, then retry with the Farmer-style keys.
      let res;
      try {
        res = await axios.post(
          url,
          {
            Email: emailValue,
            Password: passwordValue,
          },
          { headers: { "Content-Type": "application/json" } },
        );
      } catch (e: any) {
        // Retry with lowercase keys.
        res = await axios.post(
          url,
          {
            email: emailValue,
            password: passwordValue,
          },
          { headers: { "Content-Type": "application/json" } },
        );
      }

      if (res?.data?.token) {
        await AsyncStorage.setItem("token", res.data.token);
        await AsyncStorage.setItem("loginEmail", emailValue);
        await AsyncStorage.setItem("role", "buyer");

        showAlert("Success", "Login successful");
        router.replace("/auth/buyer/buyerdashboard");
      } else {
        showAlert("Login Failed", "Login did not return a token.");
      }
    } catch (error: unknown) {
      const err = error as any;

      const raw = err?.response?.data;
      const message =
        typeof raw === "string"
          ? raw
          : typeof raw?.message === "string"
            ? raw.message
            : typeof err?.message === "string"
              ? err.message
              : "Invalid email or password";

      showAlert("Login Failed", message);
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

        <View className="flex-1 px-6 justify-center">
          <View className="w-full max-w-md mx-auto">
            {/* Welcome Text */}
            <View className="mb-6">
              <Text className="text-zinc-900 text-3xl font-bold text-center">
                Welcome Back
              </Text>
              <Text className="text-zinc-500 text-center mt-2">
                Sign in to continue as a Buyer
              </Text>
            </View>

            {/* Login Card */}
            <View className="bg-white rounded-3xl shadow-lg border border-zinc-100 p-6 mb-4">
              {/* Segmented Tab */}
              <View className="flex-row bg-zinc-100 rounded-2xl p-1 mb-6">
                <View className="flex-1 bg-white rounded-xl py-3 shadow-sm">
                  <Text className="text-zinc-900 text-center font-bold">Sign In</Text>
                </View>
                <TouchableOpacity
                  className="flex-1 py-3"
                  onPress={() => router.push("/auth/buyersignup")}
                  activeOpacity={0.8}
                >
                  <Text className="text-zinc-500 text-center font-semibold">Sign Up</Text>
                </TouchableOpacity>
              </View>

              {/* Email Input */}
              <View className="mb-4">
                <Text className="text-zinc-700 font-semibold mb-2">Email</Text>
                <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-4">
                  <MaterialCommunityIcons name="email-outline" size={20} color="#71717A" />
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Enter your email"
                    placeholderTextColor="#A1A1AA"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="flex-1 ml-3 text-zinc-900"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View className="mb-6">
                <Text className="text-zinc-700 font-semibold mb-2">Password</Text>
                <View className="flex-row items-center bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-4">
                  <MaterialCommunityIcons name="lock-outline" size={20} color="#71717A" />
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter your password"
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

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={loading}
                activeOpacity={0.9}
                className="bg-brand-600 rounded-2xl py-4 shadow-sm"
              >
                <Text className="text-white text-center font-extrabold text-base">
                  {loading ? "Signing in…" : "Sign In"}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Footer */}
            <View className="flex-row justify-center items-center mt-4">
              <Text className="text-zinc-500 text-sm">Don&apos;t have an account? </Text>
              <TouchableOpacity onPress={() => router.push("/auth/buyersignup")}>
                <Text className="text-brand-600 text-sm font-bold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
