import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

/* ================= TYPES ================= */

type FarmerListing = {
  id?: string;
  farmerId?: string;
  FarmerId?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  photoUrl?: string;
  crop?: { name?: string };
  location?: { village?: string; city?: string };
  [key: string]: any;
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
  const { user, logout } = useAuth();

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
  const [connectRequested, setConnectRequested] = useState(false);

  /* ---------- LOAD COMMON DATA ---------- */
  const loadCommonData = async () => {
    try {
      const cropRes = await commonAPI.getAllCrops();
      const map: Record<string, string> = {};
      cropRes.data.forEach((c: Crop) => {
        const id = c.id || c._id;
        if (id) map[id] = c.name;
      });
      setCropMap(map);

      const farmerRes = await farmerMarketplaceAPI.getAllListings();

      setFarmerListings(
        Array.isArray(farmerRes.data)
          ? farmerRes.data.filter((i) => i.status === "active")
          : [],
      );
    } catch (error: any) {
      if (error.response?.status === 401) await logout();
    }
  };

  /* ---------- LOAD DEMANDS ---------- */
  const loadBuyerDemands = async (status: DemandStatus) => {
    try {
      const res = await buyerMarketplaceAPI.getDemandsByStatus(status);

      const mapped: BuyerDemand[] = res.data.map((d: any) => ({
        id: d.id,
        cropId: d.CropId,
        quantity: d.RequiredQuantity?.Value ?? 0,
        unit: d.RequiredQuantity?.Unit ?? "",
        price: d.ExpectedPrice?.Value ?? 0,
        status: d.Status.toLowerCase(),
      }));

      setBuyerDemands(mapped);
    } catch (error: any) {
      if (error.response?.status === 401) await logout();
    }
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
            try {
              await buyerMarketplaceAPI.updateDemandStatus(id, { Status: "cancelled" });
              loadBuyerDemands(demandStatus);
            } catch (error: any) {
              if (error.response?.status === 401) await logout();
              Alert.alert("Error", "Failed to cancel demand");
            }
          },
        },
      ],
    );
  };

  /* ---------- CONNECT TO FARMER ---------- */
  const connectToFarmer = async () => {
    if (!selectedListing?.id) {
      logger.warn("Connect attempt with missing listing ID");
      Alert.alert("Error", "Missing listing information");
      return;
    }

    if (!user?.id) {
      logger.warn("Connect attempt without user login");
      Alert.alert("Error", "You must be logged in to send connection requests");
      return;
    }

    // Extract farmer ID using helper
    const farmerId = extractUserId(selectedListing, 'farmer');

    if (!farmerId) {
      logger.warn("Missing farmer ID from listing", { 
        listingId: selectedListing.id,
        availableFields: Object.keys(selectedListing)
      });
      Alert.alert(
        "Error", 
        "Cannot connect: Farmer information not available. Please contact support if this issue persists."
      );
      return;
    }

    try {
      const payload = buildConnectionRequest(
        farmerId,
        'farmer',
        'listing',
        selectedListing.id,
        `I'm interested in your ${selectedListing.crop?.name || 'crop'} listing.`
      );
      
      logger.info('Sending connection request', { 
        recipientId: farmerId,
        listingId: selectedListing.id 
      });
      
      await connectionAPI.sendRequest(payload);

      setConnectRequested(true);
      Alert.alert("Success", "Connection request sent to farmer!");
      logger.info('Connection request sent successfully');
    } catch (err: any) {
      logger.error("Failed to send connection request", err);
      const errorMsg = handleApiError(err, 'Sending connection request');
      Alert.alert("Error", errorMsg);
    }
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
                  setConnectRequested(false);
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
                  onPress={connectToFarmer}
                  disabled={connectRequested}
                  className={
                    (connectRequested
                      ? "bg-gray-200"
                      : "bg-brand-600") +
                    " rounded-2xl py-4 items-center mb-3"
                  }
                >
                  <Text
                    className={
                      (connectRequested ? "text-gray-600" : "text-white") +
                      " font-extrabold"
                    }
                  >
                    {connectRequested ? "Request Sent" : "Contact Farmer"}
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
