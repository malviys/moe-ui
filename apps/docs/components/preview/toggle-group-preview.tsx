import { ToggleGroup, ToggleGroupItem } from "@moe/registry/ui/toggle-group";
import { Bold, Italic, Underline } from "lucide-react-native";

export default function ToggleGroupPreview() {
  return (
    <ToggleGroup type="multiple">
      <ToggleGroupItem value="bold" aria-label="Toggle bold">
        <Bold className="h-4 w-4 text-foreground" />
      </ToggleGroupItem>
      <ToggleGroupItem value="italic" aria-label="Toggle italic">
        <Italic className="h-4 w-4 text-foreground" />
      </ToggleGroupItem>
      <ToggleGroupItem value="underline" aria-label="Toggle underline">
        <Underline className="h-4 w-4 text-foreground" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
