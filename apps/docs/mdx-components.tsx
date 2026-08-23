import * as TabsComponents from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import { ComponentPreview } from "@/components/component-preview";
import { WebCompatibilityMatrix } from "@/components/web-compatibility-matrix";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    ComponentPreview,
    WebCompatibilityMatrix,
    ...TabsComponents,
    ...components,
  };
}
