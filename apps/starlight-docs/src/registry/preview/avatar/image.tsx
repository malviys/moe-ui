"use client";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@moe/registry/components/ui/avatar";

export const AvatarImageExamplePreview = () => {
  return (
    <Avatar className="size-10" alt="shadcn">
      <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
};
