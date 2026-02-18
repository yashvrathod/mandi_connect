import "../global.css";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AuthProvider, useAuth } from "../context/AuthContext";

function RootLayoutContent() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    if (isLoading || isFirstLaunch === null) return;

    const inAuthGroup = segments[0] === "auth";
    const segmentPath = segments.join("/");
    const isSplashScreen = segmentPath === "splash";
    const isLoginPage = segmentPath.includes("login") || segmentPath.includes("signup");

    // Don't redirect while on splash screen
    if (isSplashScreen) return;

    // Don't interfere with login/signup navigation
    if (isLoginPage) return;

    if (!isAuthenticated && inAuthGroup && segments.length > 1) {
      // User is not authenticated but trying to access protected routes
      // Allow access to login/signup pages but redirect from dashboards
      const protectedRoutes = ["farmer-dashboard", "buyerdashboard", "profile", "notifications"];
      if (protectedRoutes.some(route => segmentPath.includes(route))) {
        console.log("_layout - Redirecting unauthenticated user from:", segmentPath);
        router.replace("/");
      }
    }
  }, [isAuthenticated, isLoading, segments, isFirstLaunch, user]);

  const checkFirstLaunch = async () => {
    try {
      // Always show splash on every app launch for better UX
      setIsFirstLaunch(true);
      router.replace("/splash");
    } catch (error) {
      console.error("Error checking first launch:", error);
      setIsFirstLaunch(false);
    }
  };

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <RootLayoutContent />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
