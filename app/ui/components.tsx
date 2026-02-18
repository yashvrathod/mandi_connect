import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Image, Text, TextInput, TouchableOpacity, View } from "react-native";
import * as Animatable from "react-native-animatable";
import { cn } from "./cn";

export function Screen({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <View className={cn("flex-1 bg-agri-bg", className)}>{children}</View>;
}

export function AuthBackground({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="flex-1 bg-zinc-50">
      <LinearGradient
        colors={["#ECFDF3", "#FFFFFF", "#F0FDF4"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />

      <View className="flex-1 px-5 py-10 items-center justify-center">
        <View className="w-full max-w-md">
          <View className="items-center mb-5">
            <View className="h-16 w-16 rounded-3xl bg-white items-center justify-center border border-brand-100 shadow-sm">
              <Text className="text-3xl">🌾</Text>
            </View>
            <H1 className="mt-3 text-center">{title}</H1>
            {subtitle ? <P className="mt-1 text-center">{subtitle}</P> : null}
          </View>

          {children}
        </View>
      </View>
    </View>
  );
}

export function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={cn(
        "rounded-3xl bg-white/90 p-5 shadow-sm border border-zinc-200",
        className,
      )}
    >
      {children}
    </View>
  );
}

export function H1({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text className={cn("text-3xl font-extrabold text-zinc-900", className)}>
      {children}
    </Text>
  );
}

export function H2({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Text className={cn("text-xl font-bold text-zinc-900", className)}>
      {children}
    </Text>
  );
}

export function P({
  children,
  className,
  onPress,
}: {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}) {
  return (
    <Text
      onPress={onPress}
      className={cn(
        "text-sm text-zinc-600",
        onPress && "active:opacity-70",
        className,
      )}
    >
      {children}
    </Text>
  );
}

export function PrimaryButton({
  title,
  onPress,
  loading,
  className,
}: {
  title: string;
  onPress: () => void;
  loading?: boolean;
  className?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.9}
      className={cn("bg-agri-primary rounded-2xl px-4 py-4 items-center", loading && "opacity-80", className)}
    >
      <Text className="text-white font-bold text-base">
        {loading ? "Please wait…" : title}
      </Text>
    </TouchableOpacity>
  );
}

export function SecondaryButton({
  title,
  onPress,
  className,
}: {
  title: string;
  onPress: () => void;
  className?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      className={cn(
        "rounded-2xl border-2 border-agri-primary bg-white px-4 py-4 items-center",
        className,
      )}
    >
      <Text className="text-agri-primary font-semibold text-base">{title}</Text>
    </TouchableOpacity>
  );
}

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  right,
}: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
  right?: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-gray-700">{label}</Text>
      <View className="flex-row items-center rounded-2xl border border-agri-border bg-white px-4">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          className="flex-1 py-4 text-base text-gray-900"
        />
        {right}
      </View>
    </View>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Modern light app components (responsive-ish + subtle animation)
 * -------------------------------------------------------------------------------------------------
 */

export function AnimatedIn({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <Animatable.View
      animation="fadeInUp"
      duration={450}
      delay={delay}
      useNativeDriver
      className={className}
    >
      {children}
    </Animatable.View>
  );
}

export function AppHeader({
  title,
  subtitle,
  leftIcon,
  onLeftPress,
  right,
}: {
  title: string;
  subtitle?: string;
  leftIcon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  onLeftPress?: () => void;
  right?: React.ReactNode;
}) {
  return (
    <View className="px-5 pt-2 pb-4 bg-agri-bg">
      <View className="flex-row items-center gap-3">
        {leftIcon ? (
          <TouchableOpacity
            onPress={onLeftPress}
            activeOpacity={0.8}
            className="h-10 w-10 rounded-2xl bg-white border border-agri-border items-center justify-center"
          >
            <MaterialCommunityIcons
              name={leftIcon as any}
              size={22}
              color="#1E7D3A"
            />
          </TouchableOpacity>
        ) : null}

        <View className="flex-1">
          <Text className="text-agri-text text-xl font-extrabold">{title}</Text>
          {subtitle ? (
            <Text className="text-gray-600 text-sm mt-0.5">{subtitle}</Text>
          ) : null}
        </View>

        {right ? (
          <View className="items-end justify-center">{right}</View>
        ) : null}
      </View>
    </View>
  );
}

export function SurfaceCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View
      className={cn(
        "rounded-3xl bg-white border border-agri-border shadow-sm",
        className,
      )}
      style={{
        shadowColor: '#1E7D3A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {children}
    </View>
  );
}

export function SectionTitle({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <View className="flex-row items-center justify-between px-1">
      <Text className="text-agri-text text-base font-extrabold">{title}</Text>
      {action ? action : null}
    </View>
  );
}

export function SegmentedTabs({
  tabs,
  value,
  onChange,
  accent = "brand",
}: {
  tabs: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
  accent?: "brand" | "farmer";
}) {
  const activeBg = "bg-agri-primary";

  return (
    <View className="flex-row bg-white border border-agri-border rounded-2xl p-1.5">
      {tabs.map((t) => {
        const active = t.key === value;
        return (
          <TouchableOpacity
            key={t.key}
            onPress={() => onChange(t.key)}
            activeOpacity={0.85}
            className={cn(
              "flex-1 rounded-xl py-3",
              active ? activeBg : "bg-transparent",
            )}
          >
            <Text
              className={cn(
                "text-center font-semibold",
                active ? "text-white" : "text-gray-600",
              )}
            >
              {t.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export function EmptyState({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="items-center justify-center py-16">
      <View className="h-14 w-14 rounded-3xl bg-agri-light border border-agri-border items-center justify-center">
        <Text className="text-2xl">🌾</Text>
      </View>
      <Text className="mt-4 text-agri-text font-extrabold">{title}</Text>
      {subtitle ? (
        <Text className="mt-1 text-gray-600 text-sm text-center">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <View className="py-16 items-center justify-center">
      <Text className="text-gray-600 text-sm">{label}</Text>
    </View>
  );
}

/* ==================== BUYER BANNER ==================== */
export function BuyerBanner() {
  return (
    <View className="mx-4 mt-4 mb-3 rounded-3xl overflow-hidden">
      <LinearGradient
        colors={["#D1FAE5", "#DBEAFE", "#E0F2FE"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingVertical: 16,
          paddingHorizontal: 20,
          alignItems: "center",
        }}
      >
        {/* Buyer Illustration - Just Image, No Text */}
        <Image
          source={require("../../assets/images/banner.jpg")}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />
      </LinearGradient>
    </View>
  );
}

/* -------------------------------------------------------------------------------------------------
 * Modern polished design components (matching reference UI)
 * -------------------------------------------------------------------------------------------------
 */

export function StatBadge({
  icon,
  value,
  label,
  color = "brand",
}: {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  value: string | number;
  label: string;
  color?: "brand" | "farmer" | "blue" | "red" | "orange";
}) {
  const bgColor =
    color === "brand"
      ? "bg-agri-light"
      : color === "farmer"
        ? "bg-farmer-100"
        : color === "blue"
          ? "bg-blue-100"
          : color === "red"
            ? "bg-red-100"
            : "bg-orange-100";
  const iconColor =
    color === "brand"
      ? "#1E7D3A"
      : color === "farmer"
        ? "#EA580C"
        : color === "blue"
          ? "#3B82F6"
          : color === "red"
            ? "#EF4444"
            : "#F59E0B";

  return (
    <View className="items-center">
      <View
        className={`h-16 w-16 rounded-full ${bgColor} items-center justify-center mb-2`}
      >
        <MaterialCommunityIcons
          name={icon as any}
          size={28}
          color={iconColor}
        />
      </View>
      <Text className="text-agri-text font-extrabold text-lg">{value}</Text>
      <Text className="text-gray-600 text-xs">{label}</Text>
    </View>
  );
}

export function PillBadge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: "default" | "success" | "warning" | "danger" | "info";
}) {
  const colors = {
    default: "bg-zinc-100 text-zinc-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-yellow-100 text-yellow-700",
    danger: "bg-red-100 text-red-700",
    info: "bg-blue-100 text-blue-700",
  };

  return (
    <View className={`px-3 py-1 rounded-full ${colors[variant]}`}>
      <Text className="text-xs font-bold">{label}</Text>
    </View>
  );
}

export function ModernCard({
  children,
  className,
  onPress,
}: {
  children: React.ReactNode;
  className?: string;
  onPress?: () => void;
}) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={onPress ? 0.9 : 1}
      className={cn(
        "bg-white rounded-3xl border border-agri-border",
        className,
      )}
      style={{
        shadowColor: '#1E7D3A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}
    >
      {children}
    </Wrapper>
  );
}

export function IllustrationPlaceholder({ emoji }: { emoji: string }) {
  return (
    <View className="h-48 bg-gradient-to-br from-brand-50 to-blue-50 rounded-3xl items-center justify-center mb-6">
      <Text style={{ fontSize: 80 }}>{emoji}</Text>
    </View>
  );
}

export function AvatarListItem({
  name,
  subtitle,
  badge,
  amount,
  date,
  avatarUrl,
  onPress,
}: {
  name: string;
  subtitle?: string;
  badge?: {
    label: string;
    variant: "default" | "success" | "warning" | "danger" | "info";
  };
  amount?: string;
  date?: string;
  avatarUrl?: string;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="flex-row items-center gap-3 bg-white rounded-2xl p-4 border border-agri-border"
    >
      <View className="h-12 w-12 rounded-full bg-agri-light items-center justify-center overflow-hidden">
        {avatarUrl ? (
          <Text className="text-agri-primary font-bold text-lg">
            {name.charAt(0).toUpperCase()}
          </Text>
        ) : (
          <MaterialCommunityIcons name="account" size={24} color="#1E7D3A" />
        )}
      </View>

      <View className="flex-1">
        <Text className="text-agri-text font-bold">{name}</Text>
        {subtitle ? (
          <Text className="text-gray-600 text-xs mt-0.5">{subtitle}</Text>
        ) : null}
        {badge ? (
          <View className="mt-1">
            <PillBadge label={badge.label} variant={badge.variant} />
          </View>
        ) : null}
      </View>

      <View className="items-end">
        {amount ? (
          <Text className="text-agri-text font-bold">{amount}</Text>
        ) : null}
        {date ? (
          <Text className="text-gray-500 text-xs mt-0.5">{date}</Text>
        ) : null}
        <MaterialCommunityIcons
          name="chevron-right"
          size={20}
          color="#1E7D3A"
        />
      </View>
    </TouchableOpacity>
  );
}
