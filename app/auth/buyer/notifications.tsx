import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedIn, AppHeader, ModernCard, PillBadge } from "../../ui/components";

/* ---------- TYPES ---------- */
type NotificationItem = {
  id: string;
  type: "FARMER_LISTING" | "INTEREST_ACCEPTED" | "PRICE_UPDATE";
  message: string;
  subText?: string;
  time: string;
  isRead: boolean;
};

const notifications: NotificationItem[] = [
  {
    id: "1",
    type: "FARMER_LISTING",
    message: "New Brinjal listing available near you",
    subText: "Sangamner mandi",
    time: "5 min ago",
    isRead: false,
  },
  {
    id: "2",
    type: "INTEREST_ACCEPTED",
    message: "Farmer accepted your interest",
    subText: "You can now contact the farmer",
    time: "1 hour ago",
    isRead: false,
  },
  {
    id: "3",
    type: "PRICE_UPDATE",
    message: "Tomato price decreased today",
    time: "Yesterday",
    isRead: true,
  },
];

export default function BuyerNotifications() {
  const insets = useSafeAreaInsets();

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
                    ? "bg-zinc-100"
                    : "bg-brand-100")
                }
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={26}
                  color={item.isRead ? "#71717A" : "#059669"}
                />
              </View>

              <View className="flex-1">
                {/* Type Badge */}
                <View className="mb-2">
                  <PillBadge label={typeLabel} variant={typeBadgeVariant} />
                </View>

                {/* Message */}
                <Text className={item.isRead ? "text-zinc-700" : "text-zinc-900 font-bold text-base"}>
                  {item.message}
                </Text>
                
                {/* Subtext */}
                {item.subText ? (
                  <Text className="text-zinc-500 text-sm mt-1.5">{item.subText}</Text>
                ) : null}

                {/* Time */}
                <View className="flex-row items-center gap-1.5 mt-2.5">
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#A1A1AA" />
                  <Text className="text-zinc-400 text-sm">{item.time}</Text>
                </View>
              </View>

              {/* Unread Indicator */}
              {!item.isRead ? (
                <View className="h-3 w-3 rounded-full bg-brand-600 mt-1" />
              ) : null}
            </View>
          </ModernCard>
        </TouchableOpacity>
      </AnimatedIn>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="dark" />

      <View className="px-5 pt-5 pb-4 bg-white border-b border-gray-100">
        <Text className="text-zinc-900 text-3xl font-extrabold mb-2">Notifications</Text>
        <Text className="text-zinc-500">Stay updated with latest alerts</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
