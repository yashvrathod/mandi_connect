import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { cn } from "../ui/cn";

export function AuthBackground({ children }: { children: React.ReactNode }) {
  return (
    <View className="flex-1 bg-agri-bg">
      {children}
    </View>
  );
}

export function AuthCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <View
      className={cn(
        "rounded-3xl bg-white p-6 shadow-lg",
        className,
      )}
      style={{
        shadowColor: '#1E7D3A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      }}
    >
      {children}
    </View>
  );
}

export function AuthHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
}) {
  return (
    <View className="mb-6 -mx-5 -mt-5 px-5 pt-8 pb-12 bg-agri-primary rounded-b-[40px]">
      <View className="items-center mb-4">
        <View className="h-20 w-20 rounded-full bg-white/20 items-center justify-center mb-4">
          <MaterialCommunityIcons 
            name={icon || "lock-outline"} 
            size={40} 
            color="white" 
          />
        </View>
      </View>
      <View className="items-center">
        <Text className="text-white text-3xl font-bold mb-2">{title}</Text>
        {subtitle ? <Text className="text-white/80 text-base text-center">{subtitle}</Text> : null}
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
    <View className="flex-row bg-white rounded-2xl p-1.5 border border-agri-border">
      <TouchableOpacity
        className={cn(
          "flex-1 rounded-xl py-3",
          active === "left" ? "bg-agri-primary" : "bg-transparent",
        )}
        onPress={onLeftPress}
        activeOpacity={0.9}
      >
        <Text className={cn("text-center font-semibold", active === "left" ? "text-white" : "text-gray-600")}>
          {leftLabel}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={cn(
          "flex-1 rounded-xl py-3",
          active === "right" ? "bg-agri-primary" : "bg-transparent",
        )}
        onPress={onRightPress}
        activeOpacity={0.9}
      >
        <Text className={cn("text-center font-semibold", active === "right" ? "text-white" : "text-gray-600")}>
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
      <Text className="text-gray-700 text-sm font-semibold">{label}</Text>
      <View className="flex-row items-center bg-white rounded-2xl px-4 border border-agri-border">
        <MaterialCommunityIcons name={icon as any} size={20} color="#1E7D3A" />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          className="flex-1 text-gray-900 ml-3 py-4 text-base"
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
        color="#1E7D3A"
      />
    </TouchableOpacity>
  );
}

export function SectionHeader({ title }: { title: string }) {
  return (
    <View className="mb-3">
      <Text className="text-agri-text text-base font-bold">{title}</Text>
      <View className="h-0.5 bg-agri-border mt-1" />
    </View>
  );
}
