import { Avatar, AvatarFallback, AvatarImage } from "@moe/registry/ui/avatar";

export default function AvatarPreview() {
  return (
    <Avatar>
      <AvatarImage source={{ uri: "https://github.com/shadcn.png" }} />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  );
}
