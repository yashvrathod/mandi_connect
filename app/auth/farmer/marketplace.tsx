import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import { Alert, FlatList, Image, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { commonAPI, buyerMarketplaceAPI, farmerMarketplaceAPI, connectionAPI } from "../../../services/api";
import { extractUserId, buildConnectionRequest } from "@/utils/apiHelpers";
import { handleApiError } from "@/utils/errorHandler";
import logger from "@/utils/logger";
import {
  AnimatedIn,
  EmptyState,
  LoadingState,
  ModernCard,
  PillBadge,
  SegmentedTabs,
} from "../../ui/components";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce";

type TabType = "demands" | "listings";

type BuyerDemand = {
  _id?: string;
  CropId?: string;
  buyerId?: string;
  BuyerId?: string;
  market?: any;
  Market?: string;
  ExpectedPrice?: { Value?: number };
  RequiredQuantity?: { Value?: number; Unit?: string };
  status?: string;
  [key: string]: any; // Allow other fields from API
};

type FarmerListing = {
  _id?: string;
  crop?: { name?: string };
  photoUrl?: string;
  location?: { village?: string; city?: string };
  price?: number;
  quantity?: number;
  unit?: string;
  status?: string;
};

type DemandViewModel = {
  id: string;
  cropName: string;
  marketName: string;
  expectedPrice: number;
  quantityValue: number;
  quantityUnit: string;
  status: string;
  buyerId?: string;
  raw: BuyerDemand;
};

export default function FarmerMarketplace() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();

  const [activeTab, setActiveTab] = useState<TabType>("demands");
  const [demands, setDemands] = useState<BuyerDemand[]>([]);
  const [listings, setListings] = useState<FarmerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [cropMap, setCropMap] = useState<Record<string, string>>({});

  const [viewDemand, setViewDemand] = useState<DemandViewModel | null>(null);
  const [connectRequested, setConnectRequested] = useState(false);

  /* ---------- LOAD CROPS ---------- */
  const loadCrops = async () => {
    try {
      const res = await commonAPI.getAllCrops();
      const map: Record<string, string> = {};
      res.data.forEach((c: any) => {
        map[c._id || c.id] = c.name;
      });
      setCropMap(map);
    } catch (error: any) {
      if (error.response?.status === 401) await logout();
    }
  };

  /* ---------- FETCH DATA ---------- */
  const fetchBuyerDemands = async () => {
    try {
      setLoading(true);
      const res = await buyerMarketplaceAPI.getAllDemands();
      const demandsData = Array.isArray(res.data) ? res.data : [];
      console.log("Fetched demands:", JSON.stringify(demandsData[0], null, 2)); // Debug first demand
      setDemands(demandsData);
    } catch (error: any) {
      if (error.response?.status === 401) await logout();
      console.error("Error fetching demands:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const res = await farmerMarketplaceAPI.getAllListings();
      setListings(Array.isArray(res.data) ? res.data : []);
    } catch (error: any) {
      if (error.response?.status === 401) await logout();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* ---------- CONNECT TO BUYER ---------- */
  const connectToBuyer = async () => {
    if (!viewDemand?.id || viewDemand.id.startsWith('temp-')) {
      logger.warn("Connect attempt with invalid demand ID", { demandId: viewDemand?.id });
      Alert.alert(
        "Error", 
        "Cannot connect: Demand ID not available. Please contact support if this issue persists."
      );
      return;
    }

    if (!user?.id) {
      logger.warn("Connect attempt without user login");
      Alert.alert("Error", "You must be logged in to send connection requests");
      return;
    }

    // Extract buyer ID using helper
    const buyerId = extractUserId(viewDemand.raw, 'buyer');

    if (!buyerId) {
      logger.warn("Missing buyer ID from demand", { 
        demandId: viewDemand.id,
        availableFields: Object.keys(viewDemand.raw || {})
      });
      Alert.alert(
        "Error", 
        "Cannot connect: Buyer information not available. Please contact support if this issue persists."
      );
      return;
    }

    try {
      const payload = buildConnectionRequest(
        buyerId,
        'buyer',
        'demand',
        viewDemand.id,
        `I can supply ${viewDemand.cropName} as per your demand.`
      );
      
      logger.info('Sending connection request', { 
        recipientId: buyerId,
        demandId: viewDemand.id 
      });
      
      await connectionAPI.sendRequest(payload);

      setConnectRequested(true);
      Alert.alert("Success", "Connection request sent to buyer!");
      logger.info('Connection request sent successfully');
    } catch (err: any) {
      logger.error("Failed to send connection request", err);
      const errorMsg = handleApiError(err, 'Sending connection request');
      Alert.alert("Error", errorMsg);
    }
  };

  /* ---------- INIT ---------- */
  useEffect(() => {
    loadCrops();
  }, []);

  useEffect(() => {
    setLoading(true);
    if (activeTab === "demands") {
      fetchBuyerDemands();
    } else {
      fetchMyListings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === "demands") {
      await fetchBuyerDemands();
    } else {
      await fetchMyListings();
    }
  };

  const demandsVm = useMemo((): DemandViewModel[] => {
    return demands.map((d, i) => {
      const cropName = cropMap[d.CropId || ""] || "Unknown Crop";
      const marketName = d.market?.marketName || d.market?.name || d.Market || "—";
      // Extract buyerId from various possible field names
      const buyerId = d.buyerId || (d as any).BuyerId || (d as any).buyerid || (d as any)["Buyer ID"];
      // Extract demand ID - try multiple field names including capitalized versions
      const demandId = d._id || (d as any).id || (d as any).Id || (d as any).ID || (d as any)["Demand ID"] || (d as any).demandId || (d as any).DemandId;
      
      console.log(`Demand ${i}:`, {
        demandId,
        buyerId,
        rawKeys: Object.keys(d),
        _id: d._id,
        id: (d as any).id
      });
      
      return {
        id: demandId || `temp-${i}`, // Fallback to temp ID
        cropName,
        marketName,
        expectedPrice: d.ExpectedPrice?.Value ?? 0,
        quantityValue: d.RequiredQuantity?.Value ?? 0,
        quantityUnit: d.RequiredQuantity?.Unit ?? "",
        status: d.status || "active",
        buyerId: buyerId,
        raw: d,
      };
    });
  }, [demands, cropMap]);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      <View className="px-5 pt-5 pb-4 bg-white border-b border-gray-100">
        <Text className="text-zinc-900 text-3xl font-extrabold mb-2">Marketplace</Text>
        <Text className="text-zinc-500">Buyer demands and your crop listings</Text>
      </View>

      <View className="px-5 py-4 bg-white">
        <SegmentedTabs
          accent="farmer"
          tabs={[
            { key: "demands", label: "Buyer Demands" },
            { key: "listings", label: "My Listings" },
          ]}
          value={activeTab}
          onChange={(k) => setActiveTab(k as TabType)}
        />
      </View>

      {activeTab === "listings" ? (
        <View className="px-5 pb-4 bg-white border-b border-gray-100">
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/auth/farmer/add-crop")}
            className="bg-farmer-600 rounded-2xl py-4 items-center shadow-sm"
          >
            <Text className="text-white font-extrabold text-base">+ List Crop for Sale</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading ? (
        <LoadingState label="Loading marketplace…" />
      ) : (
        <FlatList
          data={activeTab === "demands" ? demandsVm : listings}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(item: any, index) => item.id || item._id || String(index)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
          ListEmptyComponent={
            <EmptyState
              title={activeTab === "demands" ? "No buyer demands" : "No listings yet"}
              subtitle={
                activeTab === "demands"
                  ? "Check back later for new demands from buyers."
                  : "Tap ‘List Crop for Sale’ to create your first listing."
              }
            />
          }
          renderItem={({ item, index }) => {
            if (activeTab === "demands") {
              const d = item as DemandViewModel;
              const variant =
                String(d.status).toLowerCase() === "active"
                  ? "success"
                  : String(d.status).toLowerCase() === "fulfilled"
                    ? "info"
                    : "default";

              return (
                <AnimatedIn delay={Math.min(index * 35, 260)} className="px-5 pt-4">
                  <TouchableOpacity
                    activeOpacity={0.95}
                    onPress={() => {
                      setConnectRequested(false);
                      setViewDemand(d);
                    }}
                  >
                    <ModernCard className="p-5">
                      <View className="flex-row items-center justify-between mb-4">
                        <View className="flex-row items-center gap-3 flex-1">
                          <View className="h-12 w-12 rounded-xl bg-farmer-100 items-center justify-center">
                            <MaterialCommunityIcons
                              name="account-search"
                              size={24}
                              color="#EA580C"
                            />
                          </View>
                          <View className="flex-1">
                            <Text className="text-zinc-900 font-bold text-xl">
                              {d.cropName}
                            </Text>
                            <Text className="text-zinc-500 text-sm mt-0.5">
                              {d.marketName}
                            </Text>
                          </View>
                        </View>

                        <PillBadge
                          label={d.status.charAt(0).toUpperCase() + d.status.slice(1)}
                          variant={variant as any}
                        />
                      </View>

                      <View className="flex-row gap-4">
                        <View className="flex-1 bg-farmer-50 rounded-2xl p-4 border border-farmer-100">
                          <Text className="text-zinc-500 text-sm mb-1.5">Expected Price</Text>
                          <Text className="text-farmer-700 font-extrabold text-lg">
                            ₹{d.expectedPrice || "—"}
                          </Text>
                        </View>

                        <View className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                          <Text className="text-zinc-500 text-sm mb-1.5">Quantity</Text>
                          <Text className="text-zinc-900 font-extrabold text-lg">
                            {d.quantityValue || "—"} {d.quantityUnit}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center justify-between mt-4">
                        <Text className="text-zinc-500 text-sm">Tap to view details</Text>
                        <MaterialCommunityIcons
                          name="chevron-right"
                          size={20}
                          color="#9CA3AF"
                        />
                      </View>
                    </ModernCard>
                  </TouchableOpacity>
                </AnimatedIn>
              );
            }

            const l = item as FarmerListing;
            const statusVariant =
              String(l.status || "").toLowerCase() === "active"
                ? "success"
                : String(l.status || "").toLowerCase() === "sold"
                  ? "info"
                  : "default";

            return (
              <AnimatedIn delay={Math.min(index * 35, 260)} className="px-5 pt-4">
                <ModernCard className="overflow-hidden">
                  <Image
                    source={{ uri: l.photoUrl || FALLBACK_IMAGE }}
                    style={{ width: "100%", height: 160 }}
                    resizeMode="cover"
                  />
                  <View className="p-5">
                    <View className="flex-row items-center justify-between mb-3">
                      <Text className="text-zinc-900 font-extrabold text-2xl flex-1">
                        {l.crop?.name || "Crop"}
                      </Text>
                      <PillBadge
                        label={(l.status || "active").toString()}
                        variant={statusVariant as any}
                      />
                    </View>

                    <View className="flex-row items-center gap-2 mb-4">
                      <MaterialCommunityIcons name="map-marker" size={18} color="#71717A" />
                      <Text className="text-zinc-500">
                        {l.location?.village || "—"}, {l.location?.city || "—"}
                      </Text>
                    </View>

                    <View className="flex-row gap-4">
                      <View className="flex-1 bg-farmer-50 rounded-2xl p-4 border border-farmer-100">
                        <Text className="text-zinc-500 text-sm mb-1.5">Price</Text>
                        <Text className="text-farmer-700 font-extrabold text-lg">
                          ₹{l.price ?? "—"}
                        </Text>
                      </View>
                      <View className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        <Text className="text-zinc-500 text-sm mb-1.5">Available</Text>
                        <Text className="text-zinc-900 font-extrabold text-lg">
                          {l.quantity ?? "—"} {l.unit ?? ""}
                        </Text>
                      </View>
                    </View>
                  </View>
                </ModernCard>
              </AnimatedIn>
            );
          }}
        />
      )}

      {/* Demand modal */}
      {viewDemand ? (
        <Modal transparent animationType="slide" visible={!!viewDemand}>
          <View className="flex-1 bg-black/50 items-center justify-center px-6">
            <AnimatedIn className="w-full max-w-md">
              <ModernCard className="overflow-hidden">
                <View className="p-6">
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="h-12 w-12 rounded-2xl bg-farmer-100 items-center justify-center">
                        <MaterialCommunityIcons
                          name="account-search"
                          size={24}
                          color="#EA580C"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-zinc-900 font-extrabold text-xl">
                          {viewDemand.cropName}
                        </Text>
                        <Text className="text-zinc-500 mt-0.5">{viewDemand.marketName}</Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => setViewDemand(null)}
                      className="h-10 w-10 rounded-2xl bg-zinc-100 items-center justify-center"
                    >
                      <MaterialCommunityIcons name="close" size={20} color="#111827" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row gap-4 mb-4">
                    <View className="flex-1 bg-farmer-50 rounded-2xl p-4 border border-farmer-100">
                      <Text className="text-zinc-500 text-sm mb-1.5">Expected Price</Text>
                      <Text className="text-farmer-700 font-extrabold text-xl">
                        ₹{viewDemand.expectedPrice || "—"}
                      </Text>
                    </View>
                    <View className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                      <Text className="text-zinc-500 text-sm mb-1.5">Quantity</Text>
                      <Text className="text-zinc-900 font-extrabold text-xl">
                        {viewDemand.quantityValue || "—"} {viewDemand.quantityUnit}
                      </Text>
                    </View>
                  </View>

                  <View className="mb-5">
                    <PillBadge
                      label={(viewDemand.status || "active").toString()}
                      variant={
                        viewDemand.status === "active"
                          ? "success"
                          : viewDemand.status === "fulfilled"
                            ? "info"
                            : "default"
                      }
                    />
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={connectToBuyer}
                    disabled={connectRequested}
                    className={
                      (connectRequested
                        ? "bg-zinc-200"
                        : "bg-farmer-600") +
                      " rounded-2xl py-4 items-center mb-3"
                    }
                  >
                    <Text
                      className={
                        (connectRequested ? "text-zinc-600" : "text-white") +
                        " font-extrabold"
                      }
                    >
                      {connectRequested ? "Requested" : "Connect to Buyer"}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => setViewDemand(null)}
                    className="items-center py-2"
                  >
                    <Text className="text-zinc-700 font-bold">Close</Text>
                  </TouchableOpacity>
                </View>
              </ModernCard>
            </AnimatedIn>
          </View>
        </Modal>
      ) : null}
    </SafeAreaView>
  );
}
