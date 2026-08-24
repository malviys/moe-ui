import * as TabsComponents from "fumadocs-ui/components/tabs";
import defaultMdxComponents from "fumadocs-ui/mdx";
import type { MDXComponents } from "mdx/types";

import {
  CliCommand,
  CliExamples,
  CliQuickStart,
} from "@/components/cli-reference";
import { ComponentPreview } from "@/components/component-preview";
import { ThemeGenerator } from "@/components/theme-generator";
import { WebCompatibilityMatrix } from "@/components/web-compatibility-matrix";

export function getMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...defaultMdxComponents,
    CliCommand,
    CliExamples,
    CliQuickStart,
    ComponentPreview,
    ThemeGenerator,
    WebCompatibilityMatrix,
    ...TabsComponents,
    ...components,
  };
}
