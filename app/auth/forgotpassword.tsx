import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authAPI } from "../../services/api";
import {
  AuthBackground,
  AuthCard,
  AuthHeader,
  AuthTextField,
} from "./_ui";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function ForgotPassword() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const role = (params.role as string) || "farmer"; // Default to farmer if not specified
  
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    const emailValue = email.trim().toLowerCase();

    if (!emailValue) {
      showAlert("Missing Email", "Please enter your email address");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
      showAlert("Invalid Email", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      // Use role-specific API call
      const response = role === "farmer" 
        ? await authAPI.farmerForgotPassword({ email: emailValue })
        : await authAPI.buyerForgotPassword({ email: emailValue });
      
      showAlert(
        "Success",
        response.data?.message || "Password reset link sent to your email"
      );
      
      // Navigate back to login or to reset password screen
      router.back();
    } catch (error: any) {
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to send reset link. Please try again."
      );
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
            <AuthCard>
              <AuthHeader
                title="Forgot Password"
                subtitle="Enter your email to reset password"
                icon="lock-reset"
              />

              <View className="gap-4 mt-6">
                <AuthTextField
                  label="Email"
                  icon="email-outline"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TouchableOpacity
                  onPress={handleForgotPassword}
                  disabled={loading}
                  className="bg-agri-primary rounded-2xl py-4 mt-2"
                  activeOpacity={0.9}
                >
                  <Text className="text-white text-center font-bold text-base">
                    {loading ? "Sending..." : "Send Reset Link"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.back()}
                  className="py-2"
                >
                  <Text className="text-agri-primary text-center font-semibold">
                    Back to Login
                  </Text>
                </TouchableOpacity>

                <Text className="text-gray-500 text-xs text-center mt-2">
                  🔒 We'll send you a secure link to reset your password
                </Text>
              </View>
            </AuthCard>
          </View>
        </View>
      </SafeAreaView>
    </AuthBackground>
  );
}
