import { Button } from "@moe/registry/ui/button";
import { Input } from "@moe/registry/ui/input";
import { Label } from "@moe/registry/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@moe/registry/ui/popover";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";

export default function PopoverPreview() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">
          <Text>Open popover</Text>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <View className="grid gap-4">
          <View className="space-y-2">
            <Text className="font-medium leading-none">Dimensions</Text>
            <Text className="text-sm text-muted-foreground">
              Set the dimensions for the layer.
            </Text>
          </View>
          <View className="grid gap-2">
            <View className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Width</Label>
              <Input
                id="width"
                defaultValue="100%"
                className="col-span-2 h-8"
              />
            </View>
            <View className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxWidth">Max. width</Label>
              <Input
                id="maxWidth"
                defaultValue="300px"
                className="col-span-2 h-8"
              />
            </View>
            <View className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="height">Height</Label>
              <Input
                id="height"
                defaultValue="25px"
                className="col-span-2 h-8"
              />
            </View>
            <View className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="maxHeight">Max. height</Label>
              <Input
                id="maxHeight"
                defaultValue="none"
                className="col-span-2 h-8"
              />
            </View>
          </View>
        </View>
      </PopoverContent>
    </Popover>
  );
}
