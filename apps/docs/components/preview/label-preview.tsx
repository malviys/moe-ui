import { Input } from "@moe-ui/registry/components/ui/input";
import { Label } from "@moe-ui/registry/components/ui/label";
import { View } from "react-native";

export default function LabelPreview() {
  return (
    <View className="w-full max-w-sm items-start gap-1.5">
      <Label nativeID="email">Email</Label>
      <Input aria-labelledby="email" placeholder="Enter email" />
    </View>
  );
}
