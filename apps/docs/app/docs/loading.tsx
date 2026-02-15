import { LoadingSpinner } from "@/components/loading-spinner";

export default function Loading() {
  return (
    <LoadingSpinner
      color="yellow"
      text="Loading documentation..."
      minHeight="60vh"
    />
  );
}
