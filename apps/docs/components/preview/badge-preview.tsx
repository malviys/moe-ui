import { Badge } from "@moe-ui/registry/components/ui/badge";
import { Text } from "@moe-ui/registry/components/ui/text";

export default function BadgePreview() {
  return (
    <Badge>
      <Text>Badge</Text>
    </Badge>
  );
}

export function BadgeSecondaryPreview() {
  return (
    <Badge variant="secondary">
      <Text>Secondary</Text>
    </Badge>
  );
}

export function BadgeDestructivePreview() {
  return (
    <Badge variant="destructive">
      <Text>Destructive</Text>
    </Badge>
  );
}

export function BadgeOutlinePreview() {
  return (
    <Badge variant="outline">
      <Text>Outline</Text>
    </Badge>
  );
}
