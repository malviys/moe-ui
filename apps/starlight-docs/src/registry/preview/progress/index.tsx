"use client";

import * as React from "react";
import { View } from "react-native";

import { Progress } from "@moe/registry/components/ui/progress";

export function ProgressPreview() {
  const [progress, setProgress] = React.useState(13);

  React.useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="w-full max-w-sm">
      <Progress value={progress} />
    </View>
  );
}
export default ProgressPreview;
