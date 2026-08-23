"use client";

import { Avatar, AvatarFallback } from "@moe-ui/registry/components/ui/avatar";
import { Text } from "@moe-ui/registry/components/ui/text";

export const AvatarFallbackExamplePreview = () => {
  return (
    <Avatar alt="JD avatar" className="size-10">
      <AvatarFallback>
        <Text>JD</Text>
      </AvatarFallback>
    </Avatar>
  );
};
