import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../context/AuthContext";
import { authAPI } from "../../services/api";
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

export default function BuyerLogin() {
  const router = useRouter();
  const { login } = useAuth();

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
      console.log("Buyer Login - Sending:", { email: emailValue });
      
      const response = await authAPI.buyerLogin({
        email: emailValue,
        password: passwordValue,
      });

      console.log("Buyer Login - Response:", response.data);

      if (response?.data?.token) {
        // Extract user ID from different possible fields
        const userId = response.data.userId || response.data.buyerId || response.data["User ID"] || response.data.data?._id || "";
        
        console.log("Buyer Login - User ID:", userId);

        // Save to AuthContext
        await login(response.data.token, {
          id: userId,
          email: emailValue,
          name: response.data.name || response.data.data?.name || response.data.data?.fullName || response.data.data?.companyName || emailValue,
          role: "buyer",
          ...response.data.data,
        });

        console.log("Buyer Login - Auth saved, navigating to dashboard");

        // Use push instead of replace for better compatibility
        router.push("/auth/buyer/buyerdashboard");
      } else {
        showAlert("Login Failed", "Login did not return a token.");
      }
    } catch (error: any) {
      console.error("Buyer Login - Error:", error.response?.data || error.message);
      
      const errorMessage = 
        error.response?.data?.message || 
        error.response?.data?.error ||
        error.message || 
        "Invalid email or password";

      showAlert("Login Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView className="flex-1">
        <StatusBar style="dark" />

        <View className="flex-1 px-5 py-10 justify-center">
          <View className="w-full max-w-md mx-auto">
            <View className="mb-4">
              <AuthSegmentedTabs
                leftLabel="Sign In"
                rightLabel="Sign Up"
                active="left"
                onLeftPress={() => {}}
                onRightPress={() => router.push("/auth/buyersignup")}
              />
            </View>

            <AuthCard>
              <AuthHeader 
                title="Buyer Login" 
                subtitle="Welcome back!" 
                icon="cart-outline"
              />

              <View className="gap-4 mt-4">
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
                  onPress={() => router.push("/auth/forgotpassword?role=buyer")}
                  className="self-end"
                >
                  <Text className="text-agri-primary text-sm font-semibold">
                    Forgot Password?
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  className="bg-agri-primary rounded-2xl py-4 mt-2"
                  activeOpacity={0.9}
                >
                  <Text className="text-white text-center font-bold text-base">
                    {loading ? "Signing in…" : "Login"}
                  </Text>
                </TouchableOpacity>

                <View className="flex-row justify-center items-center pt-2">
                  <Text className="text-gray-600 text-sm">Don&apos;t have an account? </Text>
                  <TouchableOpacity onPress={() => router.push("/auth/buyersignup")}>
                    <Text className="text-agri-primary text-sm font-semibold">Create Account</Text>
                  </TouchableOpacity>
                </View>

                <Text className="text-gray-500 text-xs text-center mt-2">
                  🔒 Secure login protected
                </Text>
              </View>
            </AuthCard>
          </View>
        </View>
      </SafeAreaView>
    </AuthBackground>
  );
}
