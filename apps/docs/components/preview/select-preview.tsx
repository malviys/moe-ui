import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@moe-ui/registry/components/ui/select";
import { View } from "react-native";

export default function SelectPreview() {
  return (
    <View className="w-[180px]">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            <SelectItem value="apple" label="Apple">
              Apple
            </SelectItem>
            <SelectItem value="banana" label="Banana">
              Banana
            </SelectItem>
            <SelectItem value="blueberry" label="Blueberry">
              Blueberry
            </SelectItem>
            <SelectItem value="grapes" label="Grapes">
              Grapes
            </SelectItem>
            <SelectItem value="pineapple" label="Pineapple">
              Pineapple
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </View>
  );
}
