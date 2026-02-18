import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../../context/AuthContext";
import { notificationAPI } from "../../../services/api";
import { handleApiError } from "@/utils/errorHandler";
import logger from "@/utils/logger";
import type { Notification } from "@/types/api.types";
import { AnimatedIn, EmptyState, LoadingState, ModernCard, PillBadge } from "../../ui/components";

type NotificationType = "BUYER_DEMAND" | "FEEDBACK" | "PRICE_UPDATE" | "CONNECTION_REQUEST" | "GENERAL";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  createdAt?: string;
};

export default function FarmerNotifications() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const res = await notificationAPI.getNotificationsByUserId(user.id);
      
      const apiData = res.data?.data || res.data || [];
      const mapped: NotificationItem[] = apiData.map((notif: any) => ({
        id: notif._id || notif.id,
        type: notif.type || "GENERAL",
        title: notif.title || "Notification",
        message: notif.message || notif.content || "",
        time: formatTime(notif.createdAt),
        isRead: notif.isRead || notif.read || false,
        createdAt: notif.createdAt,
      }));
      
      setNotifications(mapped);
      logger.info('Notifications loaded', { count: mapped.length });
    } catch (error: any) {
      logger.error("Error loading notifications", error);
      const errorMsg = handleApiError(error, 'Loading notifications');
      if (error.response?.status === 401) {
        await logout();
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "Recently";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadNotifications();
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: NotificationItem;
    index: number;
  }) => {
    const icon =
      item.type === "BUYER_DEMAND"
        ? "account-search"
        : item.type === "FEEDBACK"
          ? "thumb-up-outline"
          : "chart-line";

    const typeLabel =
      item.type === "BUYER_DEMAND"
        ? "Buyer Demand"
        : item.type === "FEEDBACK"
          ? "Feedback"
          : "Price Alert";

    const variant =
      item.type === "BUYER_DEMAND"
        ? "info"
        : item.type === "FEEDBACK"
          ? "success"
          : "warning";

    return (
      <AnimatedIn delay={Math.min(index * 40, 240)} className="px-5 pt-4">
        <TouchableOpacity activeOpacity={0.85}>
          <ModernCard className="p-5">
            <View className="flex-row items-start gap-4">
              <View
                className={
                  "h-14 w-14 rounded-2xl items-center justify-center " +
                  (item.isRead ? "bg-gray-100" : "bg-agri-light")
                }
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={26}
                  color={item.isRead ? "#71717A" : "#1E7D3A"}
                />
              </View>

              <View className="flex-1">
                <View className="mb-2 flex-row items-center justify-between">
                  <PillBadge label={typeLabel} variant={variant as any} />
                  {!item.isRead ? (
                    <View className="h-3 w-3 rounded-full bg-agri-primary" />
                  ) : null}
                </View>

                <Text
                  className={
                    item.isRead
                      ? "text-gray-700"
                      : "text-agri-text font-bold text-base"
                  }
                >
                  {item.message}
                </Text>

                <View className="flex-row items-center gap-1.5 mt-2.5">
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color="#9CA3AF"
                  />
                  <Text className="text-gray-500 text-sm">{item.time}</Text>
                </View>
              </View>
            </View>
          </ModernCard>
        </TouchableOpacity>
      </AnimatedIn>
    );
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-agri-bg">
        <StatusBar style="dark" />
        <View className="px-5 pt-5 pb-4 bg-white border-b border-agri-border">
          <Text className="text-agri-text text-3xl font-extrabold mb-2">
            Notifications
          </Text>
          <Text className="text-gray-600">Updates from buyers and market</Text>
        </View>
        <LoadingState label="Loading notifications..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-agri-bg">
      <StatusBar style="dark" />

      <View className="px-5 pt-5 pb-4 bg-white border-b border-agri-border">
        <Text className="text-agri-text text-3xl font-extrabold mb-2">
          Notifications
        </Text>
        <Text className="text-gray-600">Updates from buyers and market</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState 
            title="No notifications" 
            subtitle="You'll see updates from buyers and market here" 
          />
        }
      />
    </SafeAreaView>
  );
}
