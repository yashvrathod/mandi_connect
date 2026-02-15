import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  AnimatedIn,
  EmptyState,
  LoadingState,
  ModernCard,
  PillBadge,
  SegmentedTabs,
} from "../../ui/components";

const BASE_URL = "https://mandiconnect.onrender.com";
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce";

/* ================= TYPES ================= */

type FarmerListing = {
  id?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  photoUrl?: string;
  crop?: { name?: string };
  location?: { village?: string; city?: string };
};

type DemandStatus = "active" | "fulfilled" | "cancelled";

type BuyerDemand = {
  id: string;
  cropId: string;
  quantity: number;
  unit: string;
  price: number;
  status: DemandStatus;
};

type Crop = {
  id?: string;
  _id?: string;
  name: string;
};

/* ================= COMPONENT ================= */

export default function Marketplace() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"farmer" | "buyer">("farmer");
  const [demandStatus, setDemandStatus] = useState<DemandStatus>("active");

  const [farmerListings, setFarmerListings] = useState<FarmerListing[]>([]);
  const [buyerDemands, setBuyerDemands] = useState<BuyerDemand[]>([]);
  const [cropMap, setCropMap] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedListing, setSelectedListing] = useState<FarmerListing | null>(
    null,
  );
  const [showModal, setShowModal] = useState(false);

  /* ---------- AUTH ---------- */
  const getHeaders = async () => {
    const token = await AsyncStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  /* ---------- LOAD COMMON DATA ---------- */
  const loadCommonData = async () => {
    const headers = await getHeaders();

    const cropRes = await axios.get(`${BASE_URL}/getAllCrop`, { headers });
    const map: Record<string, string> = {};
    cropRes.data.forEach((c: Crop) => {
      const id = c.id || c._id;
      if (id) map[id] = c.name;
    });
    setCropMap(map);

    const farmerRes = await axios.get(
      `${BASE_URL}/marketplace/farmer/getAllListing`,
      { headers },
    );

    setFarmerListings(
      Array.isArray(farmerRes.data)
        ? farmerRes.data.filter((i) => i.status === "active")
        : [],
    );
  };

  /* ---------- LOAD DEMANDS ---------- */
  const loadBuyerDemands = async (status: DemandStatus) => {
    const headers = await getHeaders();

    const res = await axios.get(
      `${BASE_URL}/marketplace/buyer/status/${status}`,
      { headers },
    );

    const mapped: BuyerDemand[] = res.data.map((d: any) => ({
      id: d.id,
      cropId: d.CropId,
      quantity: d.RequiredQuantity?.Value ?? 0,
      unit: d.RequiredQuantity?.Unit ?? "",
      price: d.ExpectedPrice?.Value ?? 0,
      status: d.Status.toLowerCase(),
    }));

    setBuyerDemands(mapped);
  };

  /* ---------- CANCEL DEMAND ---------- */
  const cancelDemand = async (id: string) => {
    Alert.alert(
      "Cancel Demand",
      "Are you sure you want to cancel this demand?",
      [
        { text: "No" },
        {
          text: "Yes",
          style: "destructive",
          onPress: async () => {
            const headers = await getHeaders();
            await axios.put(
              `${BASE_URL}/marketplace/buyer/cancel/${id}`,
              {},
              { headers },
            );
            loadBuyerDemands(demandStatus);
          },
        },
      ],
    );
  };

  /* ---------- EFFECTS ---------- */
  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadCommonData();
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (activeTab === "buyer") {
      loadBuyerDemands(demandStatus);
    }
  }, [activeTab, demandStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCommonData();
    if (activeTab === "buyer") {
      await loadBuyerDemands(demandStatus);
    }
    setRefreshing(false);
  };

  /* ================= UI ================= */

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      <View className="px-5 pt-5 pb-4 bg-white border-b border-gray-100">
        <Text className="text-zinc-900 text-3xl font-extrabold mb-2">
          Marketplace
        </Text>
        <Text className="text-zinc-500">
          Browse listings and manage demands
        </Text>
      </View>

      <View className="px-5 py-4 bg-white">
        <SegmentedTabs
          tabs={[
            { key: "farmer", label: "Farmer Listings" },
            { key: "buyer", label: "Your Demands" },
          ]}
          value={activeTab}
          onChange={(k) => setActiveTab(k as any)}
        />
      </View>

      {activeTab === "buyer" ? (
        <View className="px-5 py-4 gap-4 bg-white border-b border-gray-100">
          <SegmentedTabs
            tabs={[
              { key: "active", label: "Active" },
              { key: "fulfilled", label: "Fulfilled" },
              { key: "cancelled", label: "Cancelled" },
            ]}
            value={demandStatus}
            onChange={(k) => setDemandStatus(k as DemandStatus)}
          />

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => router.push("/auth/buyer/addDemand")}
            className="bg-brand-600 rounded-2xl py-4 items-center shadow-sm"
          >
            <Text className="text-white font-extrabold text-base">
              + Add Demand
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {loading ? (
        <LoadingState label="Loading marketplace…" />
      ) : activeTab === "farmer" ? (
        <FlatList
          data={farmerListings}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(item, i) => item.id ?? i.toString()}
          contentContainerStyle={{ paddingBottom: 28 }}
          renderItem={({ item, index }) => (
            <AnimatedIn delay={Math.min(index * 35, 260)} className="px-5 pt-4">
              <TouchableOpacity
                activeOpacity={0.95}
                onPress={() => {
                  setSelectedListing(item);
                  setShowModal(true);
                }}
              >
                <ModernCard className="overflow-hidden">
                  {/* Crop Image - Full Width */}
                  {/* <Image
                    source={{ uri: item.photoUrl || FALLBACK_IMAGE }}
                    style={{ width: "100%", height: 180 }}
                    resizeMode="cover"
                  /> */}

                  <View className="p-8">
                    {/* Crop Name */}
                    <Text className="text-zinc-900 font-extrabold text-2xl mb-2">
                      {item.crop?.name || "Crop"}
                    </Text>

                    {/* Location */}
                    <View className="flex-row items-center gap-2 mb-4">
                      <MaterialCommunityIcons
                        name="map-marker"
                        size={18}
                        color="#71717A"
                      />
                      <Text className="text-zinc-500 text-base">
                        {item.location?.village}, {item.location?.city}
                      </Text>
                    </View>

                    {/* Price & Quantity */}
                    <View className="flex-row items-center gap-3 mb-4">
                      <View className="flex-1 bg-brand-50 rounded-2xl p-4 border border-brand-100">
                        <Text className="text-zinc-600 text-sm mb-1">
                          Price per {item.unit}
                        </Text>
                        <Text className="text-brand-600 font-extrabold text-2xl">
                          ₹{item.price ?? "-"}
                        </Text>
                      </View>
                      <View className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                        <Text className="text-zinc-600 text-sm mb-1">
                          Available
                        </Text>
                        <Text className="text-zinc-900 font-extrabold text-xl">
                          {item.quantity} {item.unit}
                        </Text>
                      </View>
                    </View>

                    {/* Farmer Badge */}
                    <View className="flex-row items-center gap-2 bg-gray-50 rounded-xl p-3">
                      <View className="h-10 w-10 rounded-full bg-brand-100 items-center justify-center">
                        <MaterialCommunityIcons
                          name="account"
                          size={20}
                          color="#059669"
                        />
                      </View>
                      <Text className="text-zinc-600 text-sm flex-1">
                        Posted by Farmer
                      </Text>
                      <MaterialCommunityIcons
                        name="chevron-right"
                        size={20}
                        color="#71717A"
                      />
                    </View>
                  </View>
                </ModernCard>
              </TouchableOpacity>
            </AnimatedIn>
          )}
        />
      ) : (
        <FlatList
          data={buyerDemands}
          refreshing={refreshing}
          onRefresh={onRefresh}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 28 }}
          ListEmptyComponent={
            <EmptyState
              title={`No ${demandStatus} demands`}
              subtitle="Create a new demand to get started."
            />
          }
          renderItem={({ item, index }) => {
            const cropName = cropMap[item.cropId] || "Crop";
            const statusVariant =
              item.status === "active"
                ? "success"
                : item.status === "fulfilled"
                  ? "info"
                  : "danger";

            return (
              <AnimatedIn
                delay={Math.min(index * 35, 260)}
                className="px-5 pt-4"
              >
                <ModernCard className="p-5">
                  {/* Header with Status */}
                  <View className="flex-row items-center justify-between mb-4">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View className="h-12 w-12 rounded-xl bg-brand-100 items-center justify-center">
                        <MaterialCommunityIcons
                          name="file-document-outline"
                          size={24}
                          color="#059669"
                        />
                      </View>
                      <Text className="text-zinc-900 font-bold text-xl flex-1">
                        {cropName}
                      </Text>
                    </View>
                    <PillBadge
                      label={
                        item.status.charAt(0).toUpperCase() +
                        item.status.slice(1)
                      }
                      variant={statusVariant}
                    />
                  </View>

                  {/* Details Grid */}
                  <View className="flex-row gap-4 mb-4">
                    <View className="flex-1 bg-gray-50 rounded-2xl p-4 border border-gray-200">
                      <Text className="text-zinc-500 text-sm mb-1.5">
                        Quantity
                      </Text>
                      <Text className="text-zinc-900 font-extrabold text-lg">
                        {item.quantity} {item.unit}
                      </Text>
                    </View>

                    <View className="flex-1 bg-brand-50 rounded-2xl p-4 border border-brand-100">
                      <Text className="text-zinc-500 text-sm mb-1.5">
                        Expected Price
                      </Text>
                      <Text className="text-brand-600 font-extrabold text-lg">
                        ₹{item.price}
                      </Text>
                    </View>
                  </View>

                  {/* Action Button */}
                  {item.status === "active" && (
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => cancelDemand(item.id)}
                      className="bg-red-50 border border-red-200 rounded-xl py-3.5 items-center"
                    >
                      <Text className="text-red-600 font-bold">
                        Cancel Demand
                      </Text>
                    </TouchableOpacity>
                  )}
                </ModernCard>
              </AnimatedIn>
            );
          }}
        />
      )}

      {showModal && selectedListing ? (
        <View className="absolute inset-0 bg-black/50 items-center justify-center px-8">
          <AnimatedIn className="w-full max-w-md">
            <ModernCard className="overflow-hidden">
              {/* <Image
                source={{ uri: selectedListing.photoUrl || FALLBACK_IMAGE }}
                style={{ width: "100%", height: 200 }}
                resizeMode="cover"
              /> */}

              <View className="p-5">
                {/* Crop Name */}
                <View className="flex-row items-center gap-2 mb-3">
                  <View className="h-10 w-15 rounded-xl bg-brand-100 items-center justify-center">
                    <MaterialCommunityIcons
                      name="sprout"
                      size={22}
                      color="#059669"
                    />
                  </View>
                  <Text className="text-zinc-900 font-extrabold text-xl flex-1">
                    {selectedListing.crop?.name || "Listing"}
                  </Text>
                </View>

                {/* Details */}
                <View className="gap-2 mb-4">
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={16}
                      color="#71717A"
                    />
                    <Text className="text-zinc-600">
                      {selectedListing.location?.village},{" "}
                      {selectedListing.location?.city}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons
                      name="weight-kilogram"
                      size={16}
                      color="#71717A"
                    />
                    <Text className="text-zinc-600">
                      {selectedListing.quantity} {selectedListing.unit}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-2">
                    <MaterialCommunityIcons
                      name="currency-inr"
                      size={16}
                      color="#71717A"
                    />
                    <Text className="text-zinc-600 font-bold">
                      ₹{selectedListing.price}
                    </Text>
                  </View>
                </View>

                {/* Actions */}
                <TouchableOpacity
                  activeOpacity={0.9}
                  className="bg-brand-600 rounded-2xl py-4 items-center mb-3"
                >
                  <Text className="text-white font-extrabold">
                    Contact Farmer
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setShowModal(false)}
                  className="items-center py-2"
                >
                  <Text className="text-zinc-700 font-bold">Close</Text>
                </TouchableOpacity>
              </View>
            </ModernCard>
          </AnimatedIn>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
