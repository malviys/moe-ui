import { cn } from "../../lib/utils";
import { View } from "react-native";
import * as React from "react";

function Skeleton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof View>) {
  return (
    <View
      className={cn("rounded-md bg-secondary animate-pulse", className)}
      {...props}
    />
  );
}

export { Skeleton };
