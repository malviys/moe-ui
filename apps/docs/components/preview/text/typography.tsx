"use client";

import { Text } from "@moe-ui/registry/components/ui/text";
import { View } from "react-native";

export function TypographyPreview() {
  return (
    <View className="w-full max-w-lg gap-3">
      <Text variant="h1">Heading one</Text>
      <Text variant="h2">Heading two</Text>
      <Text variant="h3">Heading three</Text>
      <Text variant="h4">Heading four</Text>
      <Text variant="p">A paragraph with comfortable reading rhythm.</Text>
      <Text variant="blockquote">A short, memorable quotation.</Text>
      <Text variant="code">pnpm dlx @moe-ui/cli add text</Text>
      <Text variant="lead">Lead text introduces an important idea.</Text>
      <Text variant="large">Large supporting text</Text>
      <Text variant="small">Small interface label</Text>
      <Text variant="muted">Muted supporting copy</Text>
    </View>
  );
}
