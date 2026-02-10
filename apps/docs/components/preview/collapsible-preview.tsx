import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@moe/registry/ui/collapsible";
import { Button } from "@moe/registry/ui/button";
import { Text } from "@moe/registry/ui/text";
import { ChevronsUpDown } from "lucide-react-native";
import * as React from "react";
import { View } from "react-native";

export default function CollapsiblePreview() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-[350px] space-y-2"
    >
      <View className="flex flex-row items-center justify-between space-x-4 px-4">
        <Text className="text-sm font-semibold">
          @peduarte starred 3 repositories
        </Text>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-9 p-0">
            <ChevronsUpDown className="h-4 w-4" />
            <Text className="sr-only">Toggle</Text>
          </Button>
        </CollapsibleTrigger>
      </View>
      <View className="rounded-md border px-4 py-3 font-mono text-sm">
        <Text>@radix-ui/primitives</Text>
      </View>
      <CollapsibleContent className="space-y-2">
        <View className="rounded-md border px-4 py-3 font-mono text-sm">
          <Text>@radix-ui/colors</Text>
        </View>
        <View className="rounded-md border px-4 py-3 font-mono text-sm">
          <Text>@stitches/react</Text>
        </View>
      </CollapsibleContent>
    </Collapsible>
  );
}
