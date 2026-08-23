"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@moe-ui/registry/components/ui/avatar";

export const AvatarImageExamplePreview = () => {
  return (
    <Avatar alt="shadcn profile" className="size-10">
      <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
};
