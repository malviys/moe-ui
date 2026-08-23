import { Label } from "@moe-ui/registry/components/ui/label";
import { Switch } from "@moe-ui/registry/components/ui/switch";
import * as React from "react";
import { View } from "react-native";

export default function SwitchPreview() {
  const [enabled, setEnabled] = React.useState(false);

  return (
    <View className="flex-row items-center gap-2">
      <Switch checked={enabled} onCheckedChange={setEnabled} />
      <Label>Airplane Mode</Label>
    </View>
  );
}
