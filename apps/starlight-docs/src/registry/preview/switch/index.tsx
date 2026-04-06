"use client";

import { Switch } from "@moe/registry/components/ui/switch";
import { Label } from "@moe/registry/components/ui/label";
import { View } from "react-native";
import * as React from "react";

export function SwitchPreview() {
  const [enabled, setEnabled] = React.useState(false);

  return (
    <View className="flex-row items-center gap-2">
      <Switch checked={enabled} onCheckedChange={setEnabled} />
      <Label>Airplane Mode</Label>
    </View>
  );
}
export default SwitchPreview;
