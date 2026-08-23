import { Toggle } from "@moe-ui/registry/components/ui/toggle";
import { Bold } from "lucide-react-native";

export default function TogglePreview() {
  return (
    <Toggle aria-label="Toggle bold">
      <Bold className="h-4 w-4 text-foreground" />
    </Toggle>
  );
}
