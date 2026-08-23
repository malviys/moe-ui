import { Separator } from "@moe-ui/registry/components/ui/separator";
import { Text } from "@moe-ui/registry/components/ui/text";
import { View } from "react-native";

export default function SeparatorPreview() {
  return (
    <View className="w-full max-w-sm">
      <Text>Above</Text>
      <Separator className="my-4" />
      <Text>Below</Text>
    </View>
  );
}
