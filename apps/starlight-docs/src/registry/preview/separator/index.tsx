"use client";

import { View } from "react-native";

import { Separator } from "@moe/registry/components/ui/separator";
import { Text } from "@moe/registry/components/ui/text";

export function SeparatorPreview() {
  return (
    <View className="w-full max-w-sm">
      <Text>Above</Text>
      <Separator className="my-4" />
      <Text>Below</Text>
    </View>
  );
}
export default SeparatorPreview;
