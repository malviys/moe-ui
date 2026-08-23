import { Button } from "@moe-ui/registry/components/ui/button";
import { Text } from "@moe-ui/registry/components/ui/text";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@moe-ui/registry/components/ui/tooltip";

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
