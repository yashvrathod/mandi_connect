import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
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
import { AnimatedIn, ModernCard, PillBadge, StatBadge } from "../../ui/components";

const BASE_URL = "https://mandiconnect.onrender.com";

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
  const insets = useSafeAreaInsets();

  const [crops, setCrops] = useState<Crop[]>([]);
  const [stats, setStats] = useState<CropStats[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [marketId, setMarketId] = useState<string | null>(null);

  const getHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const loadCrops = async () => {
    const res = await axios.get(`${BASE_URL}/getAllCrop`, {
      headers: await getHeaders(),
    });
    setCrops(res.data);
  };

  const loadMarket = async () => {
    const res = await axios.get(`${BASE_URL}/getAllMarket`, {
      headers: await getHeaders(),
    });
    setMarketId(res.data[0]?.id ?? null);
  };

  const loadPrices = async (mId: string) => {
    const headers = await getHeaders();
    const requests = crops.map((crop) =>
      axios
        .get(`${BASE_URL}/stats/getByCropIdAndMarketid/${crop.id}/${mId}`, {
          headers,
        })
        .then((res) => res.data)
        .catch(() => null),
    );
    const results = await Promise.all(requests);
    setStats(results.filter(Boolean));
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
        <Text className="text-zinc-900 text-3xl font-extrabold mb-2">
          Market Dashboard
        </Text>
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
      <FlatList
        data={filteredStats}
        renderItem={renderItem}
        keyExtractor={(item) => item.crop.id}
        refreshing={refreshing}
        onRefresh={onRefresh}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
      />
    </SafeAreaView>
  );
}
