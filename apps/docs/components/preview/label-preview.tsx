import { Label } from "@moe/registry/ui/label";
import { Input } from "@moe/registry/ui/input";
import { View } from "react-native";

export default function LabelPreview() {
  return (
    <View className="w-full max-w-sm items-start gap-1.5">
      <Label nativeID="email">Email</Label>
      <Input aria-labelledby="email" placeholder="Enter email" />
    </View>
  );
}
