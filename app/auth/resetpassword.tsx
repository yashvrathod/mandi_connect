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
  EyeToggle,
} from "./_ui";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function ResetPassword() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Token from email link
  const resetToken = params.token as string;
  const role = (params.role as string) || "farmer"; // Default to farmer if not specified

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      showAlert("Missing Fields", "Please enter both password fields");
      return;
    }

    if (newPassword.length < 6) {
      showAlert("Weak Password", "Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      showAlert("Password Mismatch", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Use role-specific API call
      const response = role === "farmer"
        ? await authAPI.farmerResetPassword(resetToken, { newPassword })
        : await authAPI.buyerResetPassword(resetToken, { newPassword });

      showAlert(
        "Success",
        response.data?.message || "Password reset successful!"
      );

      // Navigate to appropriate login page
      if (role === "farmer") {
        router.replace("/auth/farmerlogin");
      } else {
        router.replace("/auth/buyerlogin");
      }
    } catch (error: any) {
      showAlert(
        "Error",
        error.response?.data?.message || "Failed to reset password. Link may be expired."
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
                title="Reset Password"
                subtitle="Create a new password"
                icon="lock-reset"
              />

              <View className="gap-4 mt-6">
                <AuthTextField
                  label="New Password"
                  icon="lock-outline"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="Enter new password"
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  right={
                    <EyeToggle
                      shown={showNewPassword}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    />
                  }
                />

                <AuthTextField
                  label="Confirm Password"
                  icon="lock-check-outline"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm new password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  right={
                    <EyeToggle
                      shown={showConfirmPassword}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                />

                <TouchableOpacity
                  onPress={handleResetPassword}
                  disabled={loading}
                  className="bg-agri-primary rounded-2xl py-4 mt-2"
                  activeOpacity={0.9}
                >
                  <Text className="text-white text-center font-bold text-base">
                    {loading ? "Resetting..." : "Reset Password"}
                  </Text>
                </TouchableOpacity>

                <Text className="text-gray-500 text-xs text-center mt-2">
                  🔒 Your password will be securely updated
                </Text>
              </View>
            </AuthCard>
          </View>
        </View>
      </SafeAreaView>
    </AuthBackground>
  );
}
