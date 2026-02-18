import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { Alert, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { connectionAPI } from "../../../services/api";
import { handleApiError } from "@/utils/errorHandler";
import logger from "@/utils/logger";
import type { ConnectionRequest } from "@/types/api.types";
import { EmptyState, LoadingState, ModernCard, SegmentedTabs } from "../../ui/components";

type ConnectionRequest = {
  id: string;
  senderName: string;
  senderRole: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
};

export default function ConnectionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const [tab, setTab] = useState<"received" | "sent">("received");
  const [receivedRequests, setReceivedRequests] = useState<ConnectionRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadConnections();
  }, [tab]);

  const loadConnections = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      if (tab === "received") {
        const res = await connectionAPI.getIncomingRequests(user.id);
        const apiData = res.data?.data || res.data || [];
        const mapped = apiData
          .filter((req: any) => req.status !== "rejected")
          .map((req: any) => ({
            id: req._id || req.id,
            senderName: req.senderName || req.sender?.name || "Unknown",
            senderRole: req.senderRole || "USER",
            status: req.status || "pending",
            createdAt: req.createdAt,
          }));
        setReceivedRequests(mapped);
        logger.info('Loaded incoming connection requests', { count: mapped.length });
      } else {
        const res = await connectionAPI.getSentRequests(user.id);
        const apiData = res.data?.data || res.data || [];
        const mapped = apiData
          .filter((req: any) => req.status !== "rejected")
          .map((req: any) => ({
            id: req._id || req.id,
            senderName: req.recipientName || req.recipient?.name || "Unknown",
            senderRole: req.recipientRole || "USER",
            status: req.status || "pending",
            createdAt: req.createdAt,
          }));
        setSentRequests(mapped);
        logger.info('Loaded sent connection requests', { count: mapped.length });
      }
    } catch (error: any) {
      logger.error("Error loading connections", error);
      const errorMsg = handleApiError(error, 'Loading connections');
      if (error.response?.status === 401) await logout();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAccept = async (id: string) => {
    try {
      await connectionAPI.acceptRequest(id);
      Alert.alert("Success", "Connection request accepted!");
      logger.info('Connection request accepted', { requestId: id });
      loadConnections();
    } catch (error: any) {
      logger.error("Error accepting connection", error);
      const errorMsg = handleApiError(error, 'Accepting connection');
      Alert.alert("Error", errorMsg);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await connectionAPI.rejectRequest(id);
      Alert.alert("Success", "Connection request rejected");
      logger.info('Connection request rejected', { requestId: id });
      loadConnections();
    } catch (error: any) {
      logger.error("Error rejecting connection", error);
      const errorMsg = handleApiError(error, 'Rejecting connection');
      Alert.alert("Error", errorMsg);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadConnections();
  };

  const renderItem = ({ item }: { item: ConnectionRequest }) => {
    const isPending = item.status === "pending";
    const isAccepted = item.status === "accepted";

    return (
      <View className="px-5 pt-4">
        <ModernCard className="p-5">
          <View className="flex-row items-start gap-4">
            <View className={`h-14 w-14 rounded-2xl items-center justify-center ${
              isAccepted ? "bg-green-100" : isPending ? "bg-blue-100" : "bg-gray-100"
            }`}>
              <MaterialCommunityIcons
                name={item.senderRole === "BUYER" ? "cart-outline" : "sprout"}
                size={26}
                color={isAccepted ? "#059669" : isPending ? "#3B82F6" : "#71717A"}
              />
            </View>

            <View className="flex-1">
              <Text className="text-agri-text font-bold text-base mb-1">{item.senderName}</Text>
              <Text className="text-gray-600 text-sm mb-2">{item.senderRole}</Text>
              
              {tab === "received" && isPending && (
                <View className="flex-row gap-2 mt-2">
                  <TouchableOpacity
                    onPress={() => handleAccept(item.id)}
                    className="bg-agri-primary rounded-xl px-4 py-2 flex-1"
                  >
                    <Text className="text-white font-semibold text-center text-sm">Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleReject(item.id)}
                    className="bg-gray-200 rounded-xl px-4 py-2 flex-1"
                  >
                    <Text className="text-gray-700 font-semibold text-center text-sm">Reject</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!isPending && (
                <View className={`px-3 py-1.5 rounded-lg self-start ${
                  isAccepted ? "bg-green-100" : "bg-gray-100"
                }`}>
                  <Text className={`text-xs font-semibold ${
                    isAccepted ? "text-green-700" : "text-gray-700"
                  }`}>
                    {isAccepted ? "✓ Accepted" : "Rejected"}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ModernCard>
      </View>
    );
  };

  const data = tab === "received" ? receivedRequests : sentRequests;

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-agri-bg">
        <StatusBar style="dark" />
        <View className="flex-row items-center justify-between px-5 pt-5 pb-4 bg-white border-b border-agri-border">
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialCommunityIcons name="arrow-left" size={26} color="#1E7D3A" />
          </TouchableOpacity>
          <Text className="text-agri-text text-xl font-extrabold">Connections</Text>
          <View style={{ width: 26 }} />
        </View>
        <LoadingState label="Loading connections..." />
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
        <Text className="text-agri-text text-xl font-extrabold">Connection Requests</Text>
        <View style={{ width: 26 }} />
      </View>

      {/* Tabs */}
      <View className="px-5 pt-4 bg-white pb-4">
        <SegmentedTabs
          tabs={[
            { key: "received", label: "Received" },
            { key: "sent", label: "Sent" },
          ]}
          value={tab}
          onChange={(k) => setTab(k as "received" | "sent")}
          accent="farmer"
        />
      </View>

      {/* List */}
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            title={tab === "received" ? "No received requests" : "No sent requests"}
            subtitle="Connection requests will appear here"
          />
        }
      />
    </SafeAreaView>
  );
}
