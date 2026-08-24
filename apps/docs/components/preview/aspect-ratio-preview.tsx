"use client";

import { AspectRatio } from "@moe-ui/registry/components/ui/aspect-ratio";
import { Image, View } from "react-native";

export default function AspectRatioPreview() {
  return (
    <View className="w-[300px]">
      <AspectRatio ratio={16 / 9}>
        <Image
          alt="Mountain landscape"
          source={{
            uri: "/media/preview-landscape.svg",
          }}
          style={{ width: "100%", height: "100%", borderRadius: 8 }}
          resizeMode="cover"
        />
      </AspectRatio>
    </View>
  );
}
