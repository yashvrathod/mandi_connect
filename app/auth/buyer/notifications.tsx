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

/* ---------- TYPES ---------- */
type NotificationItem = {
  id: string;
  type: "FARMER_LISTING" | "INTEREST_ACCEPTED" | "PRICE_UPDATE" | "CONNECTION_REQUEST" | "GENERAL";
  message: string;
  subText?: string;
  time: string;
  isRead: boolean;
  createdAt?: string;
};

export default function BuyerNotifications() {
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
        message: notif.message || notif.content || "New notification",
        subText: notif.subText || notif.description,
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
      item.type === "FARMER_LISTING"
        ? "sprout"
        : item.type === "INTEREST_ACCEPTED"
          ? "check-circle-outline"
          : "chart-line";
    
    const typeLabel =
      item.type === "FARMER_LISTING"
        ? "New Listing"
        : item.type === "INTEREST_ACCEPTED"
          ? "Accepted"
          : "Price Alert";
    
    const typeBadgeVariant =
      item.type === "FARMER_LISTING"
        ? "success"
        : item.type === "INTEREST_ACCEPTED"
          ? "info"
          : "warning";

    return (
      <AnimatedIn delay={Math.min(index * 40, 240)} className="px-5 pt-4">
        <TouchableOpacity activeOpacity={0.85}>
          <ModernCard className="p-5">
            <View className="flex-row items-start gap-4">
              {/* Icon */}
              <View
                className={
                  "h-14 w-14 rounded-2xl items-center justify-center " +
                  (item.isRead
                    ? "bg-gray-100"
                    : "bg-agri-light")
                }
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={26}
                  color={item.isRead ? "#71717A" : "#1E7D3A"}
                />
              </View>

              <View className="flex-1">
                {/* Type Badge */}
                <View className="mb-2">
                  <PillBadge label={typeLabel} variant={typeBadgeVariant} />
                </View>

                {/* Message */}
                <Text className={item.isRead ? "text-gray-700" : "text-agri-text font-bold text-base"}>
                  {item.message}
                </Text>
                
                {/* Subtext */}
                {item.subText ? (
                  <Text className="text-gray-600 text-sm mt-1.5">{item.subText}</Text>
                ) : null}

                {/* Time */}
                <View className="flex-row items-center gap-1.5 mt-2.5">
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#9CA3AF" />
                  <Text className="text-gray-500 text-sm">{item.time}</Text>
                </View>
              </View>

              {/* Unread Indicator */}
              {!item.isRead ? (
                <View className="h-3 w-3 rounded-full bg-agri-primary mt-1" />
              ) : null}
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
          <Text className="text-agri-text text-3xl font-extrabold mb-2">Notifications</Text>
          <Text className="text-gray-600">Stay updated with latest alerts</Text>
        </View>
        <LoadingState label="Loading notifications..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-agri-bg">
      <StatusBar style="dark" />

      <View className="px-5 pt-5 pb-4 bg-white border-b border-agri-border">
        <Text className="text-agri-text text-3xl font-extrabold mb-2">Notifications</Text>
        <Text className="text-gray-600">Stay updated with latest alerts</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState 
            title="No notifications" 
            subtitle="You'll see updates from farmers and market here" 
          />
        }
      />
    </SafeAreaView>
  );
}
