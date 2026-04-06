"use client";

import { View } from "react-native";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@moe/registry/components/ui/avatar";

export const AvatarSizesExamplePreview = () => {
  return (
    <View className="flex-row items-center gap-4">
      <Avatar className="size-8" alt="shadcn">
        <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar className="size-10" alt="shadcn">
        <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar className="size-14" alt="shadcn">
        <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </View>
  );
};
