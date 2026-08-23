import { Label } from "@moe-ui/registry/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "@moe-ui/registry/components/ui/radio-group";
import { View } from "react-native";

export default function RadioGroupPreview() {
  return (
    <RadioGroup defaultValue="option-one">
      <View className="flex-row items-center gap-2">
        <RadioGroupItem
          accessibilityLabel="Option One"
          value="option-one"
          id="option-one"
        />
        <Label htmlFor="option-one">Option One</Label>
      </View>
      <View className="flex-row items-center gap-2">
        <RadioGroupItem
          accessibilityLabel="Option Two"
          value="option-two"
          id="option-two"
        />
        <Label htmlFor="option-two">Option Two</Label>
      </View>
    </RadioGroup>
  );
}
