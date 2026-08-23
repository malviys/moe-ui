"use client";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@moe-ui/registry/components/ui/context-menu";
import { Text } from "@moe-ui/registry/components/ui/text";
import { View } from "react-native";

export default function ContextMenuPreview() {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <View
          accessibilityLabel="Context menu target"
          className="border-border bg-muted/40 h-40 w-72 items-center justify-center rounded-xl border border-dashed"
        >
          <Text className="font-medium">Right-click this area</Text>
          <Text className="text-muted-foreground mt-1 text-sm">
            or press Shift + F10
          </Text>
        </View>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuLabel>Document</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Text>Back</Text>
          <ContextMenuShortcut>⌘[</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Text>Forward</Text>
          <ContextMenuShortcut>⌘]</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Text>Reload</Text>
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Text>Inspect</Text>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
