import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export default function Index() {
  const router = useRouter();

  const goAsBuyer = async () => {
    console.log("Buyer button pressed");
    try {
      const token = await AsyncStorage.getItem("token");
      const role = await AsyncStorage.getItem("role");

      if (token && role === "buyer") {
        router.push("/auth/buyer/buyerdashboard");
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
      const role = await AsyncStorage.getItem("role");

      if (token && role === "farmer") {
        router.push("/auth/farmer/farmer-dashboard");
      } else {
        router.push("/auth/farmerlogin");
      }
    } catch (error) {
      console.error("Error in goAsFarmer:", error);
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Gradient Background */}
      <LinearGradient
        colors={["#F0FDF4", "#FFFFFF", "#F9FAFB"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
        pointerEvents="none"
      />

      <SafeAreaView className="flex-1">
        <StatusBar style="dark" />

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ 
            paddingHorizontal: SCREEN_WIDTH * 0.05,
            paddingVertical: SCREEN_HEIGHT * 0.04,
            minHeight: SCREEN_HEIGHT * 0.9,
            justifyContent: 'center'
          }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center' }}>
            {/* Header Section */}
            <View className="items-center" style={{ marginBottom: SCREEN_HEIGHT * 0.04 }}>
              <View style={{ marginBottom: SCREEN_HEIGHT * 0.02 }}>
                <View 
                  className="rounded-full bg-green-500 items-center justify-center"
                  style={{ 
                    height: SCREEN_WIDTH * 0.18, 
                    width: SCREEN_WIDTH * 0.18,
                    maxHeight: 96,
                    maxWidth: 96
                  }}
                >
                  <Text style={{ fontSize: Math.min(SCREEN_WIDTH * 0.12, 56) }}>🌾</Text>
                </View>
              </View>
              <Text 
                className="text-gray-900 font-bold text-center"
                style={{ fontSize: Math.min(SCREEN_WIDTH * 0.09, 36) }}
              >
                Mandi Connect
              </Text>
              <Text 
                className="text-gray-600 text-center px-4"
                style={{ 
                  fontSize: Math.min(SCREEN_WIDTH * 0.04, 16),
                  marginTop: SCREEN_HEIGHT * 0.01
                }}
              >
                Connecting Farmers and Buyers seamlessly
              </Text>
            </View>

            {/* Tagline */}
            <View 
              className="bg-green-50 rounded-2xl border border-green-100"
              style={{ 
                padding: SCREEN_HEIGHT * 0.02,
                marginBottom: SCREEN_HEIGHT * 0.03
              }}
            >
              <Text 
                className="text-green-800 text-center font-medium"
                style={{ fontSize: Math.min(SCREEN_WIDTH * 0.038, 15) }}
              >
                Choose your role to get started
              </Text>
            </View>

            {/* Role Selection Cards */}
            <View style={{ gap: SCREEN_HEIGHT * 0.02 }}>
              {/* Farmer Card */}
              <TouchableOpacity
                onPress={goAsFarmer}
                activeOpacity={0.7}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <LinearGradient
                  colors={["#10B981", "#059669"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: SCREEN_WIDTH * 0.05 }}
                >
                  <View className="flex-row items-center">
                    <View style={{ flex: 1 }}>
                      <View className="flex-row items-center" style={{ marginBottom: 8 }}>
                        <MaterialCommunityIcons
                          name="sprout"
                          size={Math.min(SCREEN_WIDTH * 0.07, 28)}
                          color="white"
                        />
                        <Text 
                          className="text-white font-bold"
                          style={{ 
                            fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
                            marginLeft: 12
                          }}
                        >
                          I'm a Farmer
                        </Text>
                      </View>
                      <Text 
                        className="text-green-50"
                        style={{ 
                          fontSize: Math.min(SCREEN_WIDTH * 0.035, 14),
                          marginBottom: SCREEN_HEIGHT * 0.02
                        }}
                      >
                        List your crops and connect with buyers
                      </Text>
                      <View className="flex-row items-center">
                        <Text 
                          className="text-white font-semibold"
                          style={{ fontSize: Math.min(SCREEN_WIDTH * 0.04, 16) }}
                        >
                          Get Started
                        </Text>
                        <MaterialCommunityIcons
                          name="arrow-right"
                          size={Math.min(SCREEN_WIDTH * 0.05, 20)}
                          color="white"
                          style={{ marginLeft: 8 }}
                        />
                      </View>
                    </View>
                    <View style={{ marginLeft: 16 }}>
                      <Image
                        source={require("../assets/images/farmer.png")}
                        style={{ 
                          width: Math.min(SCREEN_WIDTH * 0.2, 96),
                          height: Math.min(SCREEN_WIDTH * 0.2, 96)
                        }}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Buyer Card */}
              <TouchableOpacity
                onPress={goAsBuyer}
                activeOpacity={0.7}
                className="bg-white rounded-3xl overflow-hidden border border-gray-200"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 8,
                  elevation: 3,
                }}
              >
                <LinearGradient
                  colors={["#3B82F6", "#2563EB"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ padding: SCREEN_WIDTH * 0.05 }}
                >
                  <View className="flex-row items-center">
                    <View style={{ flex: 1 }}>
                      <View className="flex-row items-center" style={{ marginBottom: 8 }}>
                        <MaterialCommunityIcons
                          name="cart"
                          size={Math.min(SCREEN_WIDTH * 0.07, 28)}
                          color="white"
                        />
                        <Text 
                          className="text-white font-bold"
                          style={{ 
                            fontSize: Math.min(SCREEN_WIDTH * 0.055, 24),
                            marginLeft: 12
                          }}
                        >
                          I'm a Buyer
                        </Text>
                      </View>
                      <Text 
                        className="text-blue-50"
                        style={{ 
                          fontSize: Math.min(SCREEN_WIDTH * 0.035, 14),
                          marginBottom: SCREEN_HEIGHT * 0.02
                        }}
                      >
                        Browse and purchase quality crops
                      </Text>
                      <View className="flex-row items-center">
                        <Text 
                          className="text-white font-semibold"
                          style={{ fontSize: Math.min(SCREEN_WIDTH * 0.04, 16) }}
                        >
                          Get Started
                        </Text>
                        <MaterialCommunityIcons
                          name="arrow-right"
                          size={Math.min(SCREEN_WIDTH * 0.05, 20)}
                          color="white"
                          style={{ marginLeft: 8 }}
                        />
                      </View>
                    </View>
                    <View style={{ marginLeft: 16 }}>
                      <Image
                        source={require("../assets/images/Buyer.png")}
                        style={{ 
                          width: Math.min(SCREEN_WIDTH * 0.2, 96),
                          height: Math.min(SCREEN_WIDTH * 0.2, 96)
                        }}
                        resizeMode="contain"
                      />
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Feature Pills */}
            <View 
              className="flex-row flex-wrap justify-center"
              style={{ 
                gap: SCREEN_WIDTH * 0.02,
                marginTop: SCREEN_HEIGHT * 0.03
              }}
            >
              <View 
                className="bg-white rounded-full border border-gray-200"
                style={{ 
                  paddingHorizontal: SCREEN_WIDTH * 0.04,
                  paddingVertical: SCREEN_HEIGHT * 0.01
                }}
              >
                <Text 
                  className="text-gray-700 font-medium"
                  style={{ fontSize: Math.min(SCREEN_WIDTH * 0.03, 12) }}
                >
                  ✓ Secure Transactions
                </Text>
              </View>
              <View 
                className="bg-white rounded-full border border-gray-200"
                style={{ 
                  paddingHorizontal: SCREEN_WIDTH * 0.04,
                  paddingVertical: SCREEN_HEIGHT * 0.01
                }}
              >
                <Text 
                  className="text-gray-700 font-medium"
                  style={{ fontSize: Math.min(SCREEN_WIDTH * 0.03, 12) }}
                >
                  ✓ Real-time Updates
                </Text>
              </View>
              <View 
                className="bg-white rounded-full border border-gray-200"
                style={{ 
                  paddingHorizontal: SCREEN_WIDTH * 0.04,
                  paddingVertical: SCREEN_HEIGHT * 0.01
                }}
              >
                <Text 
                  className="text-gray-700 font-medium"
                  style={{ fontSize: Math.min(SCREEN_WIDTH * 0.03, 12) }}
                >
                  ✓ Direct Connect
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
