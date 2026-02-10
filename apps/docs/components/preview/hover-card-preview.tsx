import { Button } from "@moe/registry/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@moe/registry/ui/hover-card";
import { Text } from "@moe/registry/ui/text";
import { View } from "react-native";
import { CalendarDays } from "lucide-react-native";
import { Avatar, AvatarFallback, AvatarImage } from "@moe/registry/ui/avatar";

export default function HoverCardPreview() {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">
          <Text>@nextjs</Text>
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <View className="flex flex-row justify-between space-x-4">
          <Avatar>
            <AvatarImage src="https://github.com/vercel.png" />
            <AvatarFallback>VC</AvatarFallback>
          </Avatar>
          <View className="space-y-1">
            <Text className="text-sm font-semibold">@nextjs</Text>
            <Text className="text-sm">
              The React Framework – created and maintained by @vercel.
            </Text>
            <View className="flex flex-row items-center pt-2">
              <CalendarDays className="mr-2 h-4 w-4 opacity-70" color="gray" />
              <Text className="text-xs text-muted-foreground">
                Joined December 2021
              </Text>
            </View>
          </View>
        </View>
      </HoverCardContent>
    </HoverCard>
  );
}
