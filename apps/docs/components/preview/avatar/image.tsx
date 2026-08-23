"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@moe-ui/registry/components/ui/avatar";
import { Text } from "@moe-ui/registry/components/ui/text";

export const AvatarImageExamplePreview = () => {
  return (
    <Avatar alt="shadcn profile" className="size-10">
      <AvatarImage source={{ uri: "/media/avatar.svg" }} />
      <AvatarFallback>
        <Text>CN</Text>
      </AvatarFallback>
    </Avatar>
  );
};
