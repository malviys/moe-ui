"use client";

import {
  ToggleGroup,
  ToggleGroupItem,
} from "@moe-ui/registry/components/ui/toggle-group";
import { Bold, Italic, Underline } from "lucide-react-native";
import * as React from "react";

export default function ToggleGroupPreview() {
  const [value, setValue] = React.useState<string[]>([]);
  return (
    <ToggleGroup type="multiple" value={value} onValueChange={setValue}>
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Bold className="h-4 w-4 text-foreground" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Italic className="h-4 w-4 text-foreground" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <Underline className="h-4 w-4 text-foreground" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
