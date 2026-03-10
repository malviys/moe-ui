"use client";

import { Avatar, AvatarFallback } from "@moe/registry/components/ui/avatar";

export const AvatarFallbackExamplePreview = () => {
  return (
    <Avatar className="size-10">
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  );
};
