import { Separator } from "@moe/registry/ui/separator";
import { View } from "react-native";
import { Text } from "@moe/registry/ui/text";

export default function SeparatorPreview() {
  return (
    <View className="w-full max-w-sm">
      <Text>Above</Text>
      <Separator className="my-4" />
      <Text>Below</Text>
    </View>
  );
}
