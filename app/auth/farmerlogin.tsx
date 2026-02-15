import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AuthBackground,
  AuthCard,
  AuthHeader,
  AuthSegmentedTabs,
  AuthTextField,
  EyeToggle,
} from "./_ui";

/* ---------- ALERT ---------- */
const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function FarmerLogin() {
  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleLogin = async (): Promise<void> => {
    const emailValue = email.trim().toLowerCase();
    const passwordValue = password.trim();

    if (!emailValue || !passwordValue) {
      showAlert("Missing fields", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "https://mandiconnect.onrender.com/farmer/login",
        {
          email: emailValue,
          password: passwordValue,
        },
        { headers: { "Content-Type": "application/json" } },
      );

      if (response.data?.token) {
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("farmerId", response.data["User ID"]);
        await AsyncStorage.setItem("role", "farmer");

        showAlert("Success", "Login successful");
        router.replace("/auth/farmer/farmer-dashboard");
      }
    } catch (error: any) {
      showAlert(
        "Login Failed",
        error.response?.data || "Invalid email or password",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView className="flex-1">
        <StatusBar style="light" />

        <View className="flex-1 px-5 py-10 justify-center">
          <View className="w-full max-w-md mx-auto">
            <AuthHeader title="Farmer Sign In" subtitle="Login with your credentials" />

            <View className="mb-4">
              <AuthSegmentedTabs
                leftLabel="Sign In"
                rightLabel="Sign Up"
                active="left"
                onLeftPress={() => {}}
                onRightPress={() => router.push("/auth/farmersignup")}
              />
            </View>

            <AuthCard>
              <View className="gap-4">
                <AuthTextField
                  label="Email"
                  icon="email-outline"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <AuthTextField
                  label="Password"
                  icon="lock-outline"
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  right={<EyeToggle shown={showPassword} onPress={() => setShowPassword(!showPassword)} />}
                />

                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  className="bg-farmer-600 rounded-2xl py-4 mt-2"
                  activeOpacity={0.9}
                >
                  <Text className="text-white text-center font-extrabold text-base">
                    {loading ? "Signing in…" : "Sign In"}
                  </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center pt-2">
                  <Text className="text-zinc-400 text-sm">Don&apos;t have an account? </Text>
                  <TouchableOpacity onPress={() => router.push("/auth/farmersignup")}>
                    <Text className="text-farmer-400 text-sm font-semibold">Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </AuthCard>
          </View>
        </View>
      </SafeAreaView>
    </AuthBackground>
  );
}
