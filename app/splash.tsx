import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Animated, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResponsive } from "@/hooks/useResponsive";

export default function SplashScreen() {
  const router = useRouter();
  const { fontSize, spacing, iconSize, isSmallDevice } = useResponsive();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.5);

  useEffect(() => {
    // Fade in and scale animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to main screen after 2.5 seconds
    const timer = setTimeout(() => {
      router.replace("/");
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-agri-primary">
      <SafeAreaView className="flex-1">
        <StatusBar style="light" />

        <View className="flex-1 items-center justify-center" style={{ paddingHorizontal: spacing.xl }}>
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
              alignItems: "center",
            }}
          >
            {/* Logo Container */}
            <View
              className="rounded-full bg-white items-center justify-center"
              style={{
                height: isSmallDevice ? 100 : 128,
                width: isSmallDevice ? 100 : 128,
                marginBottom: spacing.lg,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <Text style={{ fontSize: isSmallDevice ? 50 : 64 }}>🌾</Text>
            </View>

            {/* App Name */}
            <Text 
              className="text-white font-bold text-center"
              style={{ 
                fontSize: fontSize['4xl'],
                marginBottom: spacing.sm
              }}
            >
              MandiConnect
            </Text>

            {/* Tagline */}
            <Text 
              className="text-white/90 text-center"
              style={{ 
                fontSize: fontSize.lg,
                marginBottom: spacing.xl
              }}
            >
              Empowering Farmers & Buyers
            </Text>

            {/* Loading Indicator */}
            <View className="flex-row items-center" style={{ gap: spacing.xs }}>
              <MaterialCommunityIcons name="loading" size={iconSize.md} color="white" />
              <Text 
                className="text-white/80"
                style={{ fontSize: fontSize.sm }}
              >
                Loading...
              </Text>
            </View>
          </Animated.View>

          {/* Bottom Text */}
          <View className="absolute items-center" style={{ bottom: spacing['2xl'] }}>
            <Text 
              className="text-white/70"
              style={{ 
                fontSize: fontSize.sm,
                marginBottom: spacing.xs
              }}
            >
              Your trusted marketplace
            </Text>
            <Text 
              className="text-white/50"
              style={{ fontSize: fontSize.xs }}
            >
              Version 1.0.0
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
