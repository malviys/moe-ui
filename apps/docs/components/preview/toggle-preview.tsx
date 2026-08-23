import { Toggle } from "@moe-ui/registry/components/ui/toggle";
import { Bold } from "lucide-react-native";
import { View } from "react-native";

export default function TogglePreview() {
  return (
    <Toggle aria-label="Toggle bold">
      <Bold className="h-4 w-4 text-foreground" />
    </Toggle>
  );
}

export function ToggleOutlinePreview() {
  return (
    <Toggle variant="outline" aria-label="Toggle bold outline">
      <Bold className="h-4 w-4 text-foreground" />
    </Toggle>
  );
}

export function ToggleSizesPreview() {
  return (
    <View className="flex-row items-center gap-3">
      <Toggle size="sm" aria-label="Toggle bold small">
        <Bold className="h-4 w-4 text-foreground" />
      </Toggle>
      <Toggle size="default" aria-label="Toggle bold default size">
        <Bold className="h-4 w-4 text-foreground" />
      </Toggle>
      <Toggle size="lg" aria-label="Toggle bold large">
        <Bold className="h-4 w-4 text-foreground" />
      </Toggle>
    </View>
  );
}
