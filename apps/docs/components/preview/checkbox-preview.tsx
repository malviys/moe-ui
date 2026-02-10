import { Checkbox } from "@moe/registry/ui/checkbox";
import { Label } from "@moe/registry/ui/label";
import { View } from "react-native";

export default function CheckboxPreview() {
  return (
    <View className="flex-row items-center gap-2">
      <Checkbox id="terms" />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </View>
  );
}
