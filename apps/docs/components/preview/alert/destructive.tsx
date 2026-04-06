"use client";

import { Alert, AlertDescription, AlertTitle } from "@moe/registry/components/ui/alert";
import { AlertCircle } from "lucide-react-native";

export const AlertDestructiveVariantPreview = () => {
  return (
    <Alert icon={AlertCircle} variant="destructive">
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>
        Your session has expired. Please log in again.
      </AlertDescription>
    </Alert>
  );
};
