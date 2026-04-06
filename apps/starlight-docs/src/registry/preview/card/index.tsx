"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@moe/registry/components/ui/card";
import { Text } from "@moe/registry/components/ui/text";

export const CardPreview = () => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <Text>Card Content</Text>
      </CardContent>
      <CardFooter>
        <Text>Card Footer</Text>
      </CardFooter>
    </Card>
  );
};
