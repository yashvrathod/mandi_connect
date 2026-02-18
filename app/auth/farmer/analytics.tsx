import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { commonAPI, statsAPI } from "../../../services/api";
import { LoadingState, ModernCard, SegmentedTabs } from "../../ui/components";
import { useResponsive } from "@/hooks/useResponsive";

type Crop = { id: string; name: string };
type Market = { id: string; marketName: string };

type PriceStats = {
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  totalEntries: number;
  trend: Array<{ date: string; price: number }>;
};

export default function FarmerAnalytics() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { screenWidth, spacing, fontSize } = useResponsive();

  const [viewType, setViewType] = useState<"crop" | "market">("crop");
  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedCropId, setSelectedCropId] = useState("");
  const [selectedMarketId, setSelectedMarketId] = useState("");
  const [stats, setStats] = useState<PriceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDropdowns();
  }, []);

  useEffect(() => {
    if (viewType === "crop" && selectedCropId) {
      loadStatsByCrop(selectedCropId);
    } else if (viewType === "market" && selectedMarketId) {
      loadStatsByMarket(selectedMarketId);
    }
  }, [viewType, selectedCropId, selectedMarketId]);

  const loadDropdowns = async () => {
    try {
      const [cropsRes, marketsRes] = await Promise.all([
        commonAPI.getAllCrops(),
        commonAPI.getAllMarkets(),
      ]);

      const cropList = (cropsRes.data || []).map((c: any) => ({
        id: c._id || c.id,
        name: c.name,
      }));

      const marketList = (marketsRes.data || []).map((m: any) => ({
        id: m._id || m.id,
        marketName: m.marketName,
      }));

      setCrops(cropList);
      setMarkets(marketList);

      if (cropList.length > 0) setSelectedCropId(cropList[0].id);
      if (marketList.length > 0) setSelectedMarketId(marketList[0].id);
    } catch (error: any) {
      if (error.response?.status === 401) await logout();
    } finally {
      setLoading(false);
    }
  };

  const loadStatsByCrop = async (cropId: string) => {
    try {
      setLoading(true);
      const res = await statsAPI.getStatsByCrop(cropId);
      setStats(mapStats(res.data));
    } catch (error: any) {
      console.error("Error loading crop stats:", error);
      if (error.response?.status === 401) await logout();
    } finally {
      setLoading(false);
    }
  };

  const loadStatsByMarket = async (marketId: string) => {
    try {
      setLoading(true);
      const res = await statsAPI.getStatsByMarket(marketId);
      setStats(mapStats(res.data));
    } catch (error: any) {
      console.error("Error loading market stats:", error);
      if (error.response?.status === 401) await logout();
    } finally {
      setLoading(false);
    }
  };

  const mapStats = (data: any): PriceStats => {
    return {
      averagePrice: data?.averagePrice || data?.avgPrice || 0,
      minPrice: data?.minPrice || 0,
      maxPrice: data?.maxPrice || 0,
      totalEntries: data?.totalEntries || data?.count || 0,
      trend: (data?.trend || data?.priceHistory || []).map((item: any) => ({
        date: item.date || item._id,
        price: item.price || item.avgPrice || 0,
      })),
    };
  };

  const chartConfig = {
    backgroundColor: "#1E7D3A",
    backgroundGradientFrom: "#1E7D3A",
    backgroundGradientTo: "#2E9B4A",
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: "#fff",
    },
  };

  const chartData = {
    labels: (stats?.trend || []).slice(0, 7).map((item) => {
      const date = new Date(item.date);
      return `${date.getDate()}/${date.getMonth() + 1}`;
    }),
    datasets: [
      {
        data: (stats?.trend || []).slice(0, 7).map((item) => item.price),
        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  // Ensure we have at least 2 data points for the chart
  if (chartData.datasets[0].data.length < 2) {
    chartData.labels = ["Day 1", "Day 2"];
    chartData.datasets[0].data = [0, 0];
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-agri-bg">
        <StatusBar style="dark" />
        <View className="flex-row items-center justify-between px-5 pt-5 pb-4 bg-white border-b border-agri-border">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#1E7D3A" />
          </TouchableOpacity>
          <Text className="text-agri-text text-xl font-extrabold">Analytics</Text>
          <View style={{ width: 26 }} />
        </View>
        <LoadingState label="Loading analytics..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-agri-bg">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="flex-row items-center justify-between px-5 pt-5 pb-4 bg-white border-b border-agri-border">
        <TouchableOpacity onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={26} color="#1E7D3A" />
        </TouchableOpacity>
        <Text className="text-agri-text text-xl font-extrabold">Price Analytics</Text>
        <View style={{ width: 26 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* View Type Toggle */}
        <View className="px-5 pt-5">
          <SegmentedTabs
            tabs={[
              { key: "crop", label: "By Crop" },
              { key: "market", label: "By Market" },
            ]}
            value={viewType}
            onChange={(k) => setViewType(k as "crop" | "market")}
            accent="farmer"
          />
        </View>

        {/* Dropdown Selection */}
        <View className="px-5 pt-4">
          <ModernCard className="p-4">
            <Text className="text-sm font-semibold text-gray-700 mb-2">
              Select {viewType === "crop" ? "Crop" : "Market"}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
              {(viewType === "crop" ? crops : markets).map((item) => {
                const isSelected = viewType === "crop" 
                  ? item.id === selectedCropId 
                  : item.id === selectedMarketId;
                const label = viewType === "crop" ? (item as Crop).name : (item as Market).marketName;

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => {
                      if (viewType === "crop") setSelectedCropId(item.id);
                      else setSelectedMarketId(item.id);
                    }}
                    className={`px-4 py-2 rounded-xl ${
                      isSelected ? "bg-agri-primary" : "bg-gray-100"
                    }`}
                  >
                    <Text className={isSelected ? "text-white font-semibold" : "text-gray-700"}>
                      {label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </ModernCard>
        </View>

        {/* Stats Cards */}
        <View className="px-5 pt-4 flex-row gap-3">
          <ModernCard className="flex-1 p-4">
            <View className="flex-row items-center gap-2 mb-1">
              <MaterialCommunityIcons name="currency-inr" size={18} color="#1E7D3A" />
              <Text className="text-xs text-gray-600">Average</Text>
            </View>
            <Text className="text-2xl font-bold text-agri-text">₹{stats?.averagePrice || 0}</Text>
          </ModernCard>

          <ModernCard className="flex-1 p-4">
            <View className="flex-row items-center gap-2 mb-1">
              <MaterialCommunityIcons name="chart-line" size={18} color="#1E7D3A" />
              <Text className="text-xs text-gray-600">Entries</Text>
            </View>
            <Text className="text-2xl font-bold text-agri-text">{stats?.totalEntries || 0}</Text>
          </ModernCard>
        </View>

        <View className="px-5 pt-3 flex-row gap-3">
          <ModernCard className="flex-1 p-4">
            <View className="flex-row items-center gap-2 mb-1">
              <MaterialCommunityIcons name="arrow-down" size={18} color="#DC2626" />
              <Text className="text-xs text-gray-600">Min Price</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-700">₹{stats?.minPrice || 0}</Text>
          </ModernCard>

          <ModernCard className="flex-1 p-4">
            <View className="flex-row items-center gap-2 mb-1">
              <MaterialCommunityIcons name="arrow-up" size={18} color="#059669" />
              <Text className="text-xs text-gray-600">Max Price</Text>
            </View>
            <Text className="text-2xl font-bold text-gray-700">₹{stats?.maxPrice || 0}</Text>
          </ModernCard>
        </View>

        {/* Price Trend Chart */}
        <View className="px-5 pt-5 pb-8">
          <ModernCard style={{ padding: spacing.md }}>
            <Text 
              className="font-bold text-agri-text"
              style={{ fontSize: fontSize.base, marginBottom: spacing.md }}
            >
              Price Trend (Last 7 Days)
            </Text>
            <LineChart
              data={chartData}
              width={screenWidth - (spacing.lg * 3)}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={{
                borderRadius: 16,
              }}
            />
            <Text 
              className="text-gray-500 text-center"
              style={{ fontSize: fontSize.xs, marginTop: spacing.sm }}
            >
              Prices in ₹/kg over time
            </Text>
          </ModernCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
