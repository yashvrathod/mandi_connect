import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AnimatedIn, ModernCard, PillBadge } from "../../ui/components";

type NotificationType = "BUYER_DEMAND" | "FEEDBACK" | "PRICE_UPDATE";

type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
};

const notifications: NotificationItem[] = [
  {
    id: "1",
    type: "BUYER_DEMAND",
    title: "Buyer interested",
    message: "Buyer wants 200kg Brinjal near your mandi",
    time: "10 min ago",
    isRead: false,
  },
  {
    id: "2",
    type: "FEEDBACK",
    title: "Price feedback",
    message: "5 farmers agreed with your Brinjal price",
    time: "1 hour ago",
    isRead: false,
  },
  {
    id: "3",
    type: "PRICE_UPDATE",
    title: "Price update",
    message: "No new price update for Onion today",
    time: "Yesterday",
    isRead: true,
  },
];

export default function FarmerNotifications() {
  const insets = useSafeAreaInsets();

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
                  (item.isRead ? "bg-zinc-100" : "bg-farmer-100")
                }
              >
                <MaterialCommunityIcons
                  name={icon as any}
                  size={26}
                  color={item.isRead ? "#71717A" : "#059669"}
                />
              </View>

              <View className="flex-1">
                <View className="mb-2 flex-row items-center justify-between">
                  <PillBadge label={typeLabel} variant={variant as any} />
                  {!item.isRead ? (
                    <View className="h-3 w-3 rounded-full bg-farmer-600" />
                  ) : null}
                </View>

                <Text
                  className={
                    item.isRead
                      ? "text-zinc-700"
                      : "text-zinc-900 font-bold text-base"
                  }
                >
                  {item.message}
                </Text>

                <View className="flex-row items-center gap-1.5 mt-2.5">
                  <MaterialCommunityIcons
                    name="clock-outline"
                    size={14}
                    color="#A1A1AA"
                  />
                  <Text className="text-zinc-400 text-sm">{item.time}</Text>
                </View>
              </View>
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
        <Text className="text-zinc-900 text-3xl font-extrabold mb-2">
          Notifications
        </Text>
        <Text className="text-zinc-500">Updates from buyers and market</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}
      />
    </SafeAreaView>
  );
}
