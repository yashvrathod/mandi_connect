import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useResponsive } from "@/hooks/useResponsive";

export default function Index() {
  const router = useRouter();
  const { fontSize, spacing, iconSize, hp, isSmallDevice, isMediumDevice } = useResponsive();

  const goAsBuyer = async () => {
    console.log("Buyer button pressed");
    try {
      const token = await AsyncStorage.getItem("token");
      const userRole = await AsyncStorage.getItem("userRole");

      if (token && userRole === "buyer") {
        router.replace("/auth/buyer/buyerdashboard");
      } else {
        router.push("/auth/buyerlogin");
      }
    } catch (error) {
      console.error("Error in goAsBuyer:", error);
    }
  };

  const goAsFarmer = async () => {
    console.log("Farmer button pressed");
    try {
      const token = await AsyncStorage.getItem("token");
      const userRole = await AsyncStorage.getItem("userRole");

      if (token && userRole === "farmer") {
        router.replace("/auth/farmer/farmer-dashboard");
      } else {
        router.push("/auth/farmerlogin");
      }
    } catch (error) {
      console.error("Error in goAsFarmer:", error);
    }
  };

  return (
    <View className="flex-1 bg-agri-bg">
      <SafeAreaView className="flex-1">
        <StatusBar style="dark" />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ 
            paddingHorizontal: spacing.lg,
            paddingVertical: hp(4),
            minHeight: hp(90),
            justifyContent: 'center'
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center' }}>
            {/* Header Section */}
            <View className="items-center" style={{ marginBottom: spacing.xl }}>
              {/* Logo in circular container */}
              <View style={{ marginBottom: spacing.md }}>
                <View 
                  className="rounded-full bg-agri-primary items-center justify-center"
                  style={{ 
                    height: isSmallDevice ? 80 : 100, 
                    width: isSmallDevice ? 80 : 100,
                    shadowColor: '#1E7D3A',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.2,
                    shadowRadius: 8,
                    elevation: 5,
                  }}
                >
                  <Text style={{ fontSize: isSmallDevice ? 40 : 50 }}>🌾</Text>
                </View>
              </View>
              <Text 
                className="text-agri-text font-bold text-center"
                style={{ fontSize: fontSize['3xl'], marginBottom: spacing.sm }}
              >
                MandiConnect
              </Text>
              <Text 
                className="text-gray-600 text-center"
                style={{ 
                  fontSize: fontSize.base,
                  paddingHorizontal: spacing.md
                }}
              >
                Your trusted farmer marketplace connecting growers with buyers
              </Text>
            </View>

            {/* Two large rounded buttons */}
            <View style={{ gap: spacing.md, marginBottom: spacing.lg }}>
              {/* Continue as Farmer - Solid Green */}
              <TouchableOpacity
                onPress={goAsFarmer}
                activeOpacity={0.8}
                className="bg-agri-primary rounded-3xl"
                style={{
                  paddingVertical: spacing.md,
                  shadowColor: '#1E7D3A',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                }}
              >
                <View className="flex-row items-center justify-center">
                  <MaterialCommunityIcons
                    name="tractor"
                    size={iconSize.lg}
                    color="white"
                  />
                  <Text 
                    className="text-white font-bold"
                    style={{ 
                      fontSize: fontSize.lg,
                      marginLeft: spacing.sm
                    }}
                  >
                    Continue as Farmer
                  </Text>
                </View>
              </TouchableOpacity>

              {/* Continue as Buyer - Outlined Green */}
              <TouchableOpacity
                onPress={goAsBuyer}
                activeOpacity={0.8}
                className="bg-white rounded-3xl border-2 border-agri-primary"
                style={{
                  paddingVertical: spacing.md,
                  shadowColor: '#1E7D3A',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 6,
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-center">
                  <MaterialCommunityIcons
                    name="cart-outline"
                    size={iconSize.lg}
                    color="#1E7D3A"
                  />
                  <Text 
                    className="text-agri-primary font-bold"
                    style={{ 
                      fontSize: fontSize.lg,
                      marginLeft: spacing.sm
                    }}
                  >
                    Continue as Buyer
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Benefits card section with icons */}
            <View 
              className="bg-white rounded-3xl"
              style={{
                padding: spacing.lg,
                marginBottom: spacing.md,
                shadowColor: '#1E7D3A',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 3,
              }}
            >
              <Text 
                className="text-agri-text font-bold text-center"
                style={{ 
                  fontSize: fontSize.lg,
                  marginBottom: spacing.md
                }}
              >
                Why Choose MandiConnect?
              </Text>
              <View style={{ gap: spacing.sm }}>
                <View className="flex-row items-center">
                  <View 
                    className="rounded-full bg-agri-light items-center justify-center"
                    style={{ height: iconSize.xl, width: iconSize.xl }}
                  >
                    <MaterialCommunityIcons name="shield-check" size={iconSize.md} color="#1E7D3A" />
                  </View>
                  <Text 
                    className="text-gray-700 flex-1"
                    style={{ 
                      fontSize: fontSize.sm,
                      marginLeft: spacing.sm
                    }}
                  >
                    Secure and verified transactions
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View 
                    className="rounded-full bg-agri-light items-center justify-center"
                    style={{ height: iconSize.xl, width: iconSize.xl }}
                  >
                    <MaterialCommunityIcons name="clock-fast" size={iconSize.md} color="#1E7D3A" />
                  </View>
                  <Text 
                    className="text-gray-700 flex-1"
                    style={{ 
                      fontSize: fontSize.sm,
                      marginLeft: spacing.sm
                    }}
                  >
                    Real-time market updates
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View 
                    className="rounded-full bg-agri-light items-center justify-center"
                    style={{ height: iconSize.xl, width: iconSize.xl }}
                  >
                    <MaterialCommunityIcons name="handshake" size={iconSize.md} color="#1E7D3A" />
                  </View>
                  <Text 
                    className="text-gray-700 flex-1"
                    style={{ 
                      fontSize: fontSize.sm,
                      marginLeft: spacing.sm
                    }}
                  >
                    Direct farmer-buyer connection
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View 
                    className="rounded-full bg-agri-light items-center justify-center"
                    style={{ height: iconSize.xl, width: iconSize.xl }}
                  >
                    <MaterialCommunityIcons name="chart-line" size={iconSize.md} color="#1E7D3A" />
                  </View>
                  <Text 
                    className="text-gray-700 flex-1"
                    style={{ 
                      fontSize: fontSize.sm,
                      marginLeft: spacing.sm
                    }}
                  >
                    Fair and transparent pricing
                  </Text>
                </View>
              </View>
            </View>

            {/* Security footer text */}
            <Text 
              className="text-gray-500 text-center"
              style={{ fontSize: fontSize.xs }}
            >
              🔒 Your data is protected with end-to-end encryption
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
