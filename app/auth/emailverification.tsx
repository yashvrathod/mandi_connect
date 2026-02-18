import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authAPI } from "../../services/api";
import { AuthBackground, AuthCard } from "./_ui";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export default function EmailVerification() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const verificationToken = params.token as string;

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (verificationToken) {
      verifyEmail();
    } else {
      setVerifying(false);
      setError("Invalid verification link");
    }
  }, [verificationToken]);

  const verifyEmail = async () => {
    try {
      setVerifying(true);
      
      // Call verification API with token
      const response = await authAPI.farmerVerify(verificationToken);
      
      setVerified(true);
      setError("");
      
      showAlert(
        "Success",
        response.data?.message || "Email verified successfully!"
      );
    } catch (err: any) {
      setVerified(false);
      setError(
        err.response?.data?.message || "Verification failed. Link may be expired."
      );
    } finally {
      setVerifying(false);
    }
  };

  return (
    <AuthBackground>
      <SafeAreaView className="flex-1">
        <StatusBar style="dark" />

        <View className="flex-1 px-5 py-10 justify-center">
          <View className="w-full max-w-md mx-auto">
            <AuthCard>
              <View className="items-center py-6">
                {verifying ? (
                  <>
                    <ActivityIndicator size="large" color="#1E7D3A" />
                    <Text className="text-agri-text text-xl font-bold mt-6">
                      Verifying Email...
                    </Text>
                    <Text className="text-gray-600 text-center mt-2">
                      Please wait while we verify your email
                    </Text>
                  </>
                ) : verified ? (
                  <>
                    <View className="h-20 w-20 rounded-full bg-green-100 items-center justify-center mb-6">
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={48}
                        color="#059669"
                      />
                    </View>
                    <Text className="text-agri-text text-2xl font-bold mb-2">
                      Email Verified!
                    </Text>
                    <Text className="text-gray-600 text-center mb-8">
                      Your email has been successfully verified. You can now login.
                    </Text>
                    <TouchableOpacity
                      onPress={() => router.replace("/auth/farmerlogin")}
                      className="bg-agri-primary rounded-2xl py-4 w-full"
                      activeOpacity={0.9}
                    >
                      <Text className="text-white text-center font-bold text-base">
                        Go to Login
                      </Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View className="h-20 w-20 rounded-full bg-red-100 items-center justify-center mb-6">
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={48}
                        color="#DC2626"
                      />
                    </View>
                    <Text className="text-agri-text text-2xl font-bold mb-2">
                      Verification Failed
                    </Text>
                    <Text className="text-gray-600 text-center mb-8">
                      {error}
                    </Text>
                    <View className="gap-3 w-full">
                      <TouchableOpacity
                        onPress={verifyEmail}
                        className="bg-agri-primary rounded-2xl py-4"
                        activeOpacity={0.9}
                      >
                        <Text className="text-white text-center font-bold text-base">
                          Try Again
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => router.replace("/")}
                        className="bg-gray-200 rounded-2xl py-4"
                        activeOpacity={0.9}
                      >
                        <Text className="text-gray-700 text-center font-bold text-base">
                          Back to Home
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}
              </View>
            </AuthCard>
          </View>
        </View>
      </SafeAreaView>
    </AuthBackground>
  );
}
