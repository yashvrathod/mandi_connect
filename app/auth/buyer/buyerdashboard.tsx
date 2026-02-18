import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { commonAPI, statsAPI, priceAPI } from "../../../services/api";
import { AnimatedIn, ModernCard, PillBadge, StatBadge, LoadingState, EmptyState } from "../../ui/components";

/* ================= TYPES ================= */

type Market = {
  id: string;
  marketName: string;
};

type Crop = {
  id: string;
  name: string;
  displayUnit: string;
};

type Trend = {
  date: string;
  averagePrice: number;
};

type CropStats = {
  crop: Crop;
  mandi: Market;
  dailyStats: {
    averagePrice: number;
    minPrice: number;
    maxPrice: number;
    lastUpdated: string;
    isStale: boolean;
  };
  trend: Trend[];
};

/* ================= COMPONENT ================= */

export default function BuyerHome() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout } = useAuth();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [stats, setStats] = useState<CropStats[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marketId, setMarketId] = useState<string | null>(null);

  const loadCrops = async () => {
    try {
      const res = await commonAPI.getAllCrops();
      setCrops(res.data);
    } catch (error: any) {
      console.error("Error loading crops:", error);
      if (error.response?.status === 401) {
        await logout();
      }
    }
  };

  const loadMarket = async () => {
    try {
      const res = await commonAPI.getAllMarkets();
      setMarketId(res.data[0]?.id ?? null);
    } catch (error: any) {
      console.error("Error loading markets:", error);
      if (error.response?.status === 401) {
        await logout();
      }
    }
  };

  const loadPrices = async (mId: string) => {
    try {
      // Try to get price entries instead of stats
      const res = await priceAPI.getAllPriceEntries();
      const entries = Array.isArray(res.data) ? res.data : res.data.data || [];
      
      // Transform price entries into stats format
      const statsData = entries.map((entry: any) => ({
        crop: {
          id: entry.crop?.id || entry.crop?._id || "",
          name: entry.crop?.name || entry.cropName || "Unknown",
          displayUnit: entry.crop?.displayUnit || entry.quantity || "kg",
        },
        mandi: {
          id: entry.market?.id || entry.market?._id || "",
          marketName: entry.market?.marketName || entry.market?.name || entry.marketName || "Unknown Market",
        },
        dailyStats: {
          averagePrice: entry.price || entry.rate || 0,
          minPrice: entry.price || entry.rate || 0,
          maxPrice: entry.price || entry.rate || 0,
          lastUpdated: entry.createdAt || new Date().toISOString(),
          isStale: false,
        },
        trend: [],
      }));
      
      setStats(statsData);
    } catch (error: any) {
      console.error("Error loading prices:", error);
      if (error.response?.status === 401) {
        await logout();
      }
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([loadMarket(), loadCrops()]);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (marketId && crops.length) {
      loadPrices(marketId);
    }
  }, [marketId, crops]);

  const onRefresh = useCallback(async () => {
    if (!marketId) return;
    setRefreshing(true);
    await loadPrices(marketId);
    setRefreshing(false);
  }, [marketId, crops]);

  const filteredStats = stats.filter((item) =>
    item.crop.name.toLowerCase().includes(search.toLowerCase()),
  );

  /* ================= RENDER CARD ================= */

  const renderItem = ({ item, index }: { item: CropStats; index: number }) => {
    const d = item.dailyStats;
    const isOpen = expanded[item.crop.id];
    
    // Calculate price change from trend
    const priceChange = item.trend && item.trend.length > 1
      ? d.averagePrice - item.trend[0].averagePrice
      : 0;
    const isIncrease = priceChange > 0;

    return (
      <AnimatedIn delay={Math.min(index * 50, 250)} className="px-5 mb-4">
        <ModernCard className="p-5">
          {/* Header Row with Icon */}
          <View className="flex-row items-start justify-between mb-4">
            <View className="flex-1">
              <View className="flex-row items-center gap-3 mb-2">
                <View className="h-12 w-12 rounded-2xl bg-brand-100 items-center justify-center">
                  <MaterialCommunityIcons name="sprout" size={24} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-zinc-900 text-xl font-bold">{item.crop.name}</Text>
                  <Text className="text-zinc-500 text-sm mt-0.5">{item.mandi.marketName}</Text>
                </View>
              </View>
            </View>

            {/* Price Badge */}
            <View className="items-end">
              <Text className="text-brand-600 text-3xl font-extrabold">
                ₹{d.averagePrice}
              </Text>
              <Text className="text-zinc-500 text-sm font-semibold">/{item.crop.displayUnit}</Text>
            </View>
          </View>

          {/* Price Range */}
          <View className="flex-row items-center gap-4 mb-4 bg-gray-50 rounded-2xl p-4">
            <View className="flex-1">
              <Text className="text-zinc-500 text-sm mb-1.5">Min Price</Text>
              <Text className="text-zinc-900 font-bold text-lg">₹{d.minPrice}</Text>
            </View>
            <View className="h-10 w-px bg-zinc-200" />
            <View className="flex-1">
              <Text className="text-zinc-500 text-sm mb-1.5">Max Price</Text>
              <Text className="text-zinc-900 font-bold text-lg">₹{d.maxPrice}</Text>
            </View>
          </View>

          {/* Trend Badge */}
          {priceChange !== 0 && (
            <View className="mb-3">
              <PillBadge
                label={`${isIncrease ? "+" : ""}₹${Math.abs(priceChange).toFixed(0)} ${isIncrease ? "increase" : "decrease"}`}
                variant={isIncrease ? "success" : "danger"}
              />
            </View>
          )}

          {/* Stale Indicator */}
          {d.isStale && (
            <View className="mb-3">
              <PillBadge label="Price data may be outdated" variant="warning" />
            </View>
          )}

          {/* Timestamp */}
          <Text className="text-zinc-400 text-xs mb-3">
            Updated: {new Date(d.lastUpdated).toLocaleString()}
          </Text>

          {/* Trend Toggle */}
          {item.trend && item.trend.length > 0 && (
            <>
              <TouchableOpacity
                onPress={() =>
                  setExpanded((p) => ({
                    ...p,
                    [item.crop.id]: !isOpen,
                  }))
                }
                className="flex-row items-center justify-center py-2 bg-brand-50 rounded-xl"
              >
                <Text className="text-brand-600 font-bold text-sm mr-1">
                  {isOpen ? "Hide" : "View"} Price Trend
                </Text>
                <MaterialCommunityIcons
                  name={isOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color="#059669"
                />
              </TouchableOpacity>

              {/* Trend Section */}
              {isOpen && (
                <View className="mt-3 pt-3 border-t border-zinc-200">
                  {item.trend.map((t, i) => (
                    <View
                      key={i}
                      className="flex-row justify-between items-center py-2"
                    >
                      <Text className="text-zinc-600 text-sm">
                        {new Date(t.date).toLocaleDateString()}
                      </Text>
                      <Text className="text-zinc-900 font-bold">₹{t.averagePrice}</Text>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ModernCard>
      </AnimatedIn>
    );
  };

  /* ================= RETURN ================= */

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header with Stats */}
      <View className="px-5 pt-5 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-zinc-900 text-3xl font-extrabold flex-1">
            Market Dashboard
          </Text>
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => router.push("/auth/buyer/connections")}
              className="h-11 w-11 rounded-xl bg-brand-100 items-center justify-center"
            >
              <MaterialCommunityIcons name="account-group" size={22} color="#059669" />
            </TouchableOpacity>
          </View>
        </View>
        <Text className="text-zinc-500 mb-6">Live crop prices from mandis</Text>

        {/* Stat Circles Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16, paddingRight: 20 }}
        >
          <StatBadge icon="sprout" value={stats.length} label="Total Crops" color="brand" />
          <StatBadge
            icon="store"
            value={stats[0]?.mandi.marketName.split(" ")[0] || "—"}
            label="Market"
            color="blue"
          />
          <StatBadge
            icon="chart-line"
            value={`₹${stats[0]?.dailyStats.averagePrice || 0}`}
            label="Top Price"
            color="orange"
          />
        </ScrollView>
      </View>

      {/* Search */}
      <View className="px-5 py-4 bg-white">
        <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200">
          <MaterialCommunityIcons name="magnify" size={22} color="#71717A" />
          <TextInput
            placeholder="Search crops..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#A1A1AA"
            className="flex-1 ml-3 text-zinc-900 text-base"
          />
        </View>
      </View>

      {/* List */}
      {loading ? (
        <LoadingState label="Loading crop prices..." />
      ) : (
        <FlatList
          data={filteredStats}
          renderItem={renderItem}
          keyExtractor={(item) => item.crop.id}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
          ListEmptyComponent={
            <EmptyState
              title="No crop prices available"
              subtitle="Farmers haven't posted any prices yet. Check back later!"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
