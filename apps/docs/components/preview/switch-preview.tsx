import { Switch } from "@moe/registry/ui/switch";
import { Label } from "@moe/registry/ui/label";
import { View } from "react-native";
import * as React from "react";

export default function SwitchPreview() {
  const [enabled, setEnabled] = React.useState(false);

  return (
    <View className="flex-row items-center gap-2">
      <Switch checked={enabled} onCheckedChange={setEnabled} />
      <Label>Airplane Mode</Label>
    </View>
  );
}
