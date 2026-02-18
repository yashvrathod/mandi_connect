import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { priceAPI, farmerMarketplaceAPI } from "../../../services/api";
import {
  AnimatedIn,
  EmptyState,
  LoadingState,
  ModernCard,
  PillBadge,
  SegmentedTabs,
  StatBadge,
} from "../../ui/components";

type TabKey = "community" | "marketStats";

type Entry = {
  _id?: string;
  crop?: { name?: string; displayUnit?: string };
  cropName?: string;
  market?: { marketName?: string; name?: string };
  marketName?: string;
  price?: number;
  rate?: number;
  quantity?: string;
  status?: string;
  createdAt?: string;
};

type ReactionState = {
  type: "like" | "dislike" | null;
  likes: number;
  dislikes: number;
};

function formatEntry(e: Entry) {
  return {
    cropName: e.crop?.name || e.cropName || "Crop",
    marketName: e.market?.marketName || e.market?.name || e.marketName || "Market",
    price: e.price ?? e.rate ?? 0,
    quantity: e.quantity || e.crop?.displayUnit || "",
    status: e.status || "active",
    time: e.createdAt ? new Date(e.createdAt).toLocaleString() : "",
  };
}

export default function FarmerDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuth();

  const [activeTab, setActiveTab] = useState<TabKey>("community");
  const [communityEntries, setCommunityEntries] = useState<Entry[]>([]);
  const [marketStatsEntries, setMarketStatsEntries] = useState<Entry[]>([]);

  const [viewEntry, setViewEntry] = useState<Entry | null>(null);
  const [searchText, setSearchText] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [reactions, setReactions] = useState<Record<string, ReactionState>>({});

  const selectedEntry = useMemo(
    () => (viewEntry ? formatEntry(viewEntry) : null),
    [viewEntry],
  );

  const fetchCommunity = async () => {
    try {
      const res = await priceAPI.getAllPriceEntries();
      const entries = Array.isArray(res.data) ? res.data : res.data.data || [];
      setCommunityEntries(entries);

      // Fetch agree/disagree counts for each entry
      const reactionData: Record<string, ReactionState> = {};
      for (const entry of entries) {
        const entryId = entry._id;
        if (entryId) {
          try {
            const [agreeRes, disagreeRes] = await Promise.all([
              priceAPI.getAgreeCount(entryId),
              priceAPI.getDisagreeCount(entryId),
            ]);
            reactionData[entryId] = {
              type: null,
              likes: agreeRes.data?.count || 0,
              dislikes: disagreeRes.data?.count || 0,
            };
          } catch (e) {
            // Skip if counts fail
          }
        }
      }
      setReactions(reactionData);
    } catch (error: any) {
      console.error("Error fetching community entries:", error);
      if (error.response?.status === 401) {
        await logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMarketStats = async () => {
    try {
      const res = await farmerMarketplaceAPI.getAllListings();
      setMarketStatsEntries(Array.isArray(res.data) ? res.data : res.data.data || []);
    } catch (error: any) {
      console.error("Error fetching market stats:", error);
      if (error.response?.status === 401) {
        await logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (activeTab === "community") {
      fetchCommunity();
    } else {
      fetchMarketStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "community") {
      await fetchCommunity();
    } else {
      await fetchMarketStats();
    }
  };

  const handleReaction = async (id: string, type: "like" | "dislike") => {
    const current = reactions[id] || { type: null, likes: 0, dislikes: 0 };

    // Don't allow double reaction
    if (current.type === type) return;

    const farmerId = user?.id || "";
    
    if (!farmerId) {
      console.error("Farmer ID not found");
      return;
    }

    try {
      // Call API with correct parameters: entryId and farmerId
      if (type === "like") {
        await priceAPI.priceAgree(id, farmerId);
      } else {
        await priceAPI.priceDisagree(id, farmerId);
      }

      // Update local state
      setReactions((prev) => {
        return {
          ...prev,
          [id]: {
            type,
            likes:
              type === "like"
                ? current.likes + 1
                : current.type === "like"
                  ? Math.max(0, current.likes - 1)
                  : current.likes,
            dislikes:
              type === "dislike"
                ? current.dislikes + 1
                : current.type === "dislike"
                  ? Math.max(0, current.dislikes - 1)
                  : current.dislikes,
          },
        };
      });
    } catch (error: any) {
      console.error("Error voting:", error);
      if (error.response?.status === 401) {
        await logout();
      }
    }
  };

  const data = activeTab === "community" ? communityEntries : marketStatsEntries;

  const filteredData = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q || activeTab !== "marketStats") return data;

    return data.filter((e) => {
      const f = formatEntry(e);
      return (
        f.cropName.toLowerCase().includes(q) || f.marketName.toLowerCase().includes(q)
      );
    });
  }, [activeTab, data, searchText]);

  const headerStats = useMemo(() => {
    if (activeTab === "community") {
      return {
        left: { icon: "account-group", value: communityEntries.length, label: "Posts" },
        right: { icon: "chart-line", value: "Live", label: "Prices" },
      };
    }

    const activeCount = marketStatsEntries.filter(
      (e: any) => String(e?.status || "").toLowerCase() === "active",
    ).length;

    return {
      left: { icon: "sprout", value: marketStatsEntries.length, label: "Listings" },
      right: { icon: "check-circle-outline", value: activeCount, label: "Active" },
    };
  }, [activeTab, communityEntries.length, marketStatsEntries]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      {/* Header */}
      <View className="px-5 pt-5 pb-4 bg-white border-b border-gray-100">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-zinc-900 text-3xl font-extrabold">
            Farmer Dashboard
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/auth/farmer/analytics" as any)}
            className="bg-agri-primary rounded-xl px-4 py-2.5 flex-row items-center gap-2"
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="chart-box" size={18} color="white" />
            <Text className="text-white font-bold text-sm">Analytics</Text>
          </TouchableOpacity>
        </View>
        <Text className="text-zinc-500 mb-6">
          Track community prices and manage your listings
        </Text>

        <View className="flex-row" style={{ gap: 18 }}>
          <StatBadge
            icon={headerStats.left.icon as any}
            value={headerStats.left.value}
            label={headerStats.left.label}
            color="farmer"
          />
          <StatBadge
            icon={headerStats.right.icon as any}
            value={headerStats.right.value}
            label={headerStats.right.label}
            color={activeTab === "community" ? "orange" : "blue"}
          />
        </View>
      </View>

      {/* Tabs */}
      <View className="px-5 py-4 bg-white">
        <SegmentedTabs
          accent="farmer"
          tabs={[
            { key: "community", label: "Community Price" },
            { key: "marketStats", label: "All Statistics" },
          ]}
          value={activeTab}
          onChange={(k) => setActiveTab(k as TabKey)}
        />
      </View>

      {/* Search */}
      {activeTab === "marketStats" ? (
        <View className="px-5 pb-4 bg-white">
          <View className="flex-row items-center bg-gray-50 rounded-2xl px-4 py-4 border border-gray-200">
            <MaterialCommunityIcons name="magnify" size={22} color="#71717A" />
            <TextInput
              placeholder="Search crop or market..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor="#A1A1AA"
              className="flex-1 ml-3 text-zinc-900 text-base"
            />
          </View>
        </View>
      ) : null}

      {loading ? (
        <LoadingState
          label={activeTab === "community" ? "Loading community…" : "Loading listings…"}
        />
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item, idx) => item._id || String(idx)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
          ListEmptyComponent={
            <EmptyState
              title={activeTab === "community" ? "No community posts" : "No listings found"}
              subtitle={
                activeTab === "community"
                  ? "Check back later for new price updates."
                  : "Create a listing to appear here."
              }
            />
          }
          renderItem={({ item, index }) => {
            const f = formatEntry(item);
            const key = item._id ?? String(index);
            const reaction = reactions[key];

            const statusVariant =
              f.status === "active"
                ? "success"
                : f.status === "pending"
                  ? "warning"
                  : "default";

            return (
              <AnimatedIn delay={Math.min(index * 40, 240)} className="px-5 pt-4">
                <TouchableOpacity
                  activeOpacity={0.95}
                  onPress={() => setViewEntry(item)}
                >
                  <ModernCard className="p-5">
                    <View className="flex-row items-start justify-between mb-4">
                      <View className="flex-1 pr-3">
                        <View className="flex-row items-center gap-3 mb-2">
                          <View className="h-12 w-12 rounded-2xl bg-farmer-100 items-center justify-center">
                            <MaterialCommunityIcons
                              name={activeTab === "community" ? "account-group" : "sprout"}
                              size={24}
                              color="#EA580C"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-zinc-900 text-xl font-bold">
                              {f.cropName}
                            </Text>
                            <Text className="text-zinc-500 text-sm mt-0.5">
                              {f.marketName}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <View className="items-end">
                        <Text className="text-farmer-700 text-3xl font-extrabold">
                          ₹{f.price}
                        </Text>
                        {f.quantity ? (
                          <Text className="text-zinc-500 text-sm font-semibold">
                            /{f.quantity}
                          </Text>
                        ) : null}
                      </View>
                    </View>

                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-2">
                        <PillBadge
                          label={
                            activeTab === "community"
                              ? "Community"
                              : f.status.charAt(0).toUpperCase() + f.status.slice(1)
                          }
                          variant={activeTab === "community" ? "info" : (statusVariant as any)}
                        />
                        {f.time ? (
                          <View className="flex-row items-center gap-1.5">
                            <MaterialCommunityIcons
                              name="clock-outline"
                              size={14}
                              color="#A1A1AA"
                            />
                            <Text className="text-zinc-400 text-xs">{f.time}</Text>
                          </View>
                        ) : null}
                      </View>

                      {activeTab === "community" ? (
                        <View className="flex-row items-center gap-3">
                          <TouchableOpacity
                            disabled={reaction?.type === "dislike"}
                            onPress={() => handleReaction(key, "like")}
                            className="flex-row items-center gap-1"
                          >
                            <Text className="text-zinc-500 text-xs font-semibold">
                              {reaction?.likes ?? 0}
                            </Text>
                            <MaterialCommunityIcons
                              name={
                                reaction?.type === "like"
                                  ? "thumb-up"
                                  : "thumb-up-outline"
                              }
                              size={18}
                              color={reaction?.type === "like" ? "#059669" : "#6B7280"}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            disabled={reaction?.type === "like"}
                            onPress={() => handleReaction(key, "dislike")}
                            className="flex-row items-center gap-1"
                          >
                            <Text className="text-zinc-500 text-xs font-semibold">
                              {reaction?.dislikes ?? 0}
                            </Text>
                            <MaterialCommunityIcons
                              name={
                                reaction?.type === "dislike"
                                  ? "thumb-down"
                                  : "thumb-down-outline"
                              }
                              size={18}
                              color={reaction?.type === "dislike" ? "#DC2626" : "#6B7280"}
                            />
                          </TouchableOpacity>
                        </View>
                      ) : (
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={20}
                          color="#9CA3AF"
                        />
                      )}
                    </View>
                  </ModernCard>
                </TouchableOpacity>
              </AnimatedIn>
            );
          }}
        />
      )}

      {/* Details Modal */}
      <Modal visible={!!viewEntry} transparent animationType="slide">
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <AnimatedIn className="w-full max-w-md">
            <ModernCard className="p-6">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-3 flex-1">
                  <View className="h-12 w-12 rounded-2xl bg-farmer-100 items-center justify-center">
                    <MaterialCommunityIcons
                      name={activeTab === "community" ? "account-group" : "sprout"}
                      size={24}
                      color="#EA580C"
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-zinc-900 font-extrabold text-xl">
                      {selectedEntry?.cropName}
                    </Text>
                    <Text className="text-zinc-500 mt-0.5">
                      {selectedEntry?.marketName}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setViewEntry(null)}
                  className="h-10 w-10 rounded-2xl bg-zinc-100 items-center justify-center"
                >
                  <MaterialCommunityIcons name="close" size={20} color="#111827" />
                </TouchableOpacity>
              </View>

              <View className="bg-gray-50 rounded-2xl p-4 border border-gray-200 mb-4">
                <Text className="text-zinc-500 text-sm mb-1">Price</Text>
                <Text className="text-farmer-700 font-extrabold text-3xl">
                  ₹{selectedEntry?.price}
                </Text>
                {selectedEntry?.quantity ? (
                  <Text className="text-zinc-500 text-sm font-semibold mt-1">
                    per {selectedEntry.quantity}
                  </Text>
                ) : null}
              </View>

              <View className="gap-2 mb-6">
                <InfoRow label="Status" value={selectedEntry?.status} />
                <InfoRow label="Posted" value={selectedEntry?.time} />
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setViewEntry(null)}
                className="bg-farmer-600 rounded-2xl py-4 items-center"
              >
                <Text className="text-white font-extrabold">Close</Text>
              </TouchableOpacity>
            </ModernCard>
          </AnimatedIn>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View className="flex-row items-center justify-between py-2 border-b border-zinc-100 last:border-b-0">
      <Text className="text-zinc-500 text-sm">{label}</Text>
      <Text className="text-zinc-900 font-semibold">{value || "—"}</Text>
    </View>
  );
}
