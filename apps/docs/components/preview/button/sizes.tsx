"use client";

import { Button } from "@moe-ui/registry/components/ui/button";
import { Text } from "@moe-ui/registry/components/ui/text";
import { Plus } from "lucide-react-native";
import { View } from "react-native";

export const ButtonSizesPreview = () => {
  return (
    <View className="flex-row flex-wrap items-center justify-center gap-3">
      <Button size="default">
        <Text>Default</Text>
      </Button>
      <Button size="sm">
        <Text>Small</Text>
      </Button>
      <Button size="lg">
        <Text>Large</Text>
      </Button>
      <Button size="icon" aria-label="Icon button">
        <Plus />
      </Button>
    </View>
  );
};
