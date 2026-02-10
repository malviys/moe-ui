import { Button } from "@moe/registry/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@moe/registry/ui/tooltip";
import { Text } from "@moe/registry/ui/text";

export default function TooltipPreview() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">
          <Text>Hover</Text>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <Text>Add to library</Text>
      </TooltipContent>
    </Tooltip>
  );
}
