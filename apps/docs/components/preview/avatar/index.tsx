"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@moe-ui/registry/components/ui/avatar";
import { Text } from "@moe-ui/registry/components/ui/text";

export const AvatarPreview = () => {
  return (
    <Avatar alt="shadcn profile">
      <AvatarImage source={{ uri: "/media/avatar.svg" }} />
      <AvatarFallback>
        <Text>CN</Text>
      </AvatarFallback>
    </Avatar>
  );
};
