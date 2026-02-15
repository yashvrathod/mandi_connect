import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { cn } from "../ui/cn";

export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 bg-dark-bg">
      <LinearGradient
        colors={["#2B1B12", "#1C1C1E", "#121214"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="absolute inset-0"
      />
      {children}
    </View>
  );
}

export function AuthCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View
      className={cn(
        "rounded-3xl bg-dark-card/80 border border-white/10 p-5 shadow-xl",
        className,
      )}
    >
      {children}
    </View>
  );
}

export function AuthHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center gap-3 mb-3">
        <View className="h-12 w-12 rounded-2xl bg-farmer-500/15 border border-farmer-400/30 items-center justify-center">
          <Text className="text-lg font-extrabold text-farmer-400">FH</Text>
        </View>
        <View className="flex-1">
          <Text className="text-white text-2xl font-extrabold">{title}</Text>
          {subtitle ? <Text className="text-zinc-400 text-sm mt-1">{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}

export function AuthSegmentedTabs({
  leftLabel,
  rightLabel,
  active,
  onLeftPress,
  onRightPress,
}: {
  leftLabel: string;
  rightLabel: string;
  active: "left" | "right";
  onLeftPress: () => void;
  onRightPress: () => void;
}) {
  return (
    <View className="flex-row bg-dark-card rounded-2xl p-1">
      <TouchableOpacity
        className={cn(
          "flex-1 rounded-xl py-3",
          active === "left" ? "bg-dark-input" : "bg-transparent",
        )}
        onPress={onLeftPress}
        activeOpacity={0.9}
      >
        <Text className={cn("text-center font-semibold", active === "left" ? "text-white" : "text-zinc-400")}>
          {leftLabel}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={cn(
          "flex-1 rounded-xl py-3",
          active === "right" ? "bg-dark-input" : "bg-transparent",
        )}
        onPress={onRightPress}
        activeOpacity={0.9}
      >
        <Text className={cn("text-center font-semibold", active === "right" ? "text-white" : "text-zinc-400")}>
          {rightLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export function AuthTextField({
  label,
  icon,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  autoCapitalize,
  secureTextEntry,
  right,
}: {
  label: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  keyboardType?: any;
  autoCapitalize?: any;
  secureTextEntry?: boolean;
  right?: React.ReactNode;
}) {
  return (
    <View className="gap-2">
      <Text className="text-zinc-300 text-sm font-semibold">{label}</Text>
      <View className="flex-row items-center bg-dark-input rounded-2xl px-4">
        <MaterialCommunityIcons name={icon as any} size={20} color="#9CA3AF" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          className="flex-1 text-white ml-3 py-4 text-base"
        />
        {right}
      </View>
    </View>
  );
}

export function EyeToggle({ shown, onPress }: { shown: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} className="pl-3 py-2" accessibilityRole="button">
      <MaterialCommunityIcons
        name={shown ? "eye-outline" : "eye-off-outline"}
        size={20}
        color="#9CA3AF"
      />
    </TouchableOpacity>
  );
}
