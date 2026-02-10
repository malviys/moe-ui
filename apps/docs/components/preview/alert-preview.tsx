import { Alert, AlertDescription, AlertTitle } from "@moe/registry/ui/alert";
import { AlertCircle } from "lucide-react-native";
import { View } from "react-native";

export default function AlertPreview() {
  return (
    <View className="w-full max-w-sm gap-4">
      <Alert>
        <AlertCircle className="h-4 w-4" color="#000" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components to your app using the cli.
        </AlertDescription>
      </Alert>
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" color="#fff" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Your session has expired. Please log in again.
        </AlertDescription>
      </Alert>
    </View>
  );
}
