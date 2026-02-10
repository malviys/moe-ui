import { RadioGroup, RadioGroupItem } from "@moe/registry/ui/radio-group";
import { Label } from "@moe/registry/ui/label";
import { View } from "react-native";

export default function RadioGroupPreview() {
  return (
    <RadioGroup defaultValue="option-one">
      <View className="flex-row items-center gap-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">Option One</Label>
      </View>
      <View className="flex-row items-center gap-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">Option Two</Label>
      </View>
    </RadioGroup>
  );
}
