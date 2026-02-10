import * as React from "react";
import dynamic from "next/dynamic";

export const examples: Record<string, React.ComponentType<any>> = {
  "button-demo": dynamic(() => import("./examples/button-demo")),
};

export const code: Record<string, string> = {
  "button-demo": `import { Button } from "@/components/ui/button"

export default function ButtonDemo() {
  return <Button>Click me</Button>
}
`,
};
