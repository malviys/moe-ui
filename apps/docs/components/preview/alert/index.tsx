"use client";

import { Alert, AlertDescription, AlertTitle } from "@moe/registry/components/ui/alert";
import { AlertCircle } from "lucide-react-native";

export const AlertPreview = () => {
  return (
    <Alert icon={AlertCircle}>
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
  );
};
