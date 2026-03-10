"use client";

import { Checkbox } from "@moe/registry/components/ui/checkbox";
import { Label } from "@moe/registry/components/ui/label";
import React from "react";
import { View } from "react-native";

export const CheckboxPreview = () => {
  const [checked, setChecked] = React.useState(false);

  return (
    <View className="flex-row items-center gap-2">
      <Checkbox id="terms" checked={checked} onCheckedChange={setChecked} />
      <Label htmlFor="terms">Accept terms and conditions</Label>
    </View>
  );
};
