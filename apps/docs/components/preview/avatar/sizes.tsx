"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@moe-ui/registry/components/ui/avatar";
import { View } from "react-native";

export const AvatarSizesExamplePreview = () => {
  return (
    <View className="flex-row items-center gap-4">
      <Avatar alt="Small profile avatar" className="size-8">
        <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar alt="Medium profile avatar" className="size-10">
        <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar alt="Large profile avatar" className="size-14">
        <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </View>
  );
};
