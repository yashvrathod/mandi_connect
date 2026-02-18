import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function BuyerLayout() {
  const insets = useSafeAreaInsets();
  const TAB_BAR_HEIGHT = Platform.OS === "ios" ? 56 + insets.bottom : 60;

  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkBuyerAuth = async () => {
      const token = await AsyncStorage.getItem("token");
      const userRole = await AsyncStorage.getItem("userRole");

      if (!token || userRole !== "buyer") {
        router.replace("/auth/buyerlogin");
        return;
      }

      setCheckingAuth(false);
    };

    checkBuyerAuth();
  }, []);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["bottom"]}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarHideOnKeyboard: true,
          tabBarActiveTintColor: "#1E7D3A",
          tabBarInactiveTintColor: "#9CA3AF",
          tabBarStyle: {
            backgroundColor: "#fff",
            height: TAB_BAR_HEIGHT,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 6,
            borderTopColor: "#C6E6D3",
            borderTopWidth: 1,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="buyerdashboard"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "home" : "home-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="marketplace"
          options={{
            title: "Marketplace",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "store" : "store-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="notifications"
          options={{
            title: "Notifications",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "bell" : "bell-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            tabBarIcon: ({ color, size, focused }) => (
              <MaterialCommunityIcons
                name={focused ? "account" : "account-outline"}
                size={size}
                color={color}
              />
            ),
          }}
        />

        {/* hidden route */}
        <Tabs.Screen name="addDemand" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  );
}
