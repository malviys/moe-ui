import type { ComponentProps } from "react";

export function Check(props: ComponentProps<"svg">) {
  return <svg aria-hidden="true" {...props} />;
}
