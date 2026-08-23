"use client";

import { Avatar, AvatarFallback } from "@moe-ui/registry/components/ui/avatar";

export const AvatarFallbackExamplePreview = () => {
  return (
    <Avatar alt="JD avatar" className="size-10">
      <AvatarFallback>JD</AvatarFallback>
    </Avatar>
  );
};
