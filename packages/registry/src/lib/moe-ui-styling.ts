import type { ComponentType } from "react";
import { withUniwind } from "uniwind";

export function withMoeIcon<Props extends object>(
  component: ComponentType<Props>,
): ComponentType<Props> {
  return withUniwind(component, {
    size: {
      fromClassName: "className",
      styleProperty: "width",
    },
    color: {
      fromClassName: "className",
      styleProperty: "color",
    },
  }) as ComponentType<Props>;
}
