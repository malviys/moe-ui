"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@moe/registry/components/ui/avatar";

export const AvatarPreview = () => {
  return (
    <Avatar alt="shadcn">
      <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
};
