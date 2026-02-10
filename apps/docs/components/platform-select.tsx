"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@moe/registry/ui/select";
import { usePlatform } from "@/hooks/use-platform";
import { View } from "react-native";
import { Text } from "@moe/registry/ui/text";

const PLATFORMS = [
  { name: "web", label: "Web" },
  { name: "native", label: "Native" },
] as const;

export function PlatformSelect() {
  const [platform, setPlatform] = usePlatform();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const currentOption = {
    value: platform,
    label: PLATFORMS.find((p) => p.name === platform)?.label || "Web",
  };

  return (
    <View className="flex-row items-center gap-2">
      <Text className="text-sm text-muted-foreground mr-1">Platform:</Text>
      <Select
        value={currentOption}
        onValueChange={(option) => {
          if (option) {
            setPlatform(option.value as "web" | "native");
          }
        }}
      >
        <SelectTrigger className="w-[100px] h-8">
          <SelectValue placeholder="Select platform" />
        </SelectTrigger>
        <SelectContent>
          {PLATFORMS.map((p) => (
            <SelectItem key={p.name} value={p.name} label={p.label}>
              {p.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </View>
  );
}
