"use client";

import { AspectRatio } from "@moe/registry/ui/aspect-ratio";
import { Image, View } from "react-native";

export default function AspectRatioPreview() {
  return (
    <View className="w-[300px]">
      <AspectRatio ratio={16 / 9}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80",
          }}
          style={{ width: "100%", height: "100%", borderRadius: 8 }}
          resizeMode="cover"
        />
      </AspectRatio>
    </View>
  );
}
