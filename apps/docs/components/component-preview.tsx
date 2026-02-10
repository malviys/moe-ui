"use client";

import * as React from "react";
import { Tabs, Tab } from "fumadocs-ui/components/tabs";
import { cn } from "@/lib/cn";
import { examples, code } from "@/registry";

interface ComponentPreviewProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  align?: "center" | "start" | "end";
  description?: string;
}

export function ComponentPreview({
  name,
  children,
  className,
  align = "center",
  ...props
}: Readonly<ComponentPreviewProps>) {
  const Component = examples[name];
  const sourceCode = code[name];

  if (!Component) {
    return (
      <div className="text-sm text-muted-foreground">
        Component <code className="bg-muted px-1 py-0.5 rounded">{name}</code>{" "}
        not found in registry.
      </div>
    );
  }

  return (
    <div
      className={cn("group relative my-4 flex flex-col space-y-2", className)}
      {...props}
    >
      <Tabs items={["Preview", "Code"]}>
        <Tab value="Preview" className="relative mr-auto w-full p-0">
          <div
            className={cn(
              "preview flex min-h-[350px] w-full justify-center p-10 items-center rounded-md border",
              align === "start" && "items-start",
              align === "end" && "items-end",
            )}
          >
            <Component />
          </div>
        </Tab>
        <Tab value="Code">
          <div className="flex flex-col space-y-4">
            <div className="w-full rounded-md [&_pre]:my-0 [&_pre]:max-h-[350px] [&_pre]:overflow-auto border bg-fd-secondary/50">
              {/* We need a proper code block here. For now we just render pre/code but typically we'd use the MDX code block or a syntax highlighter */}
              <pre className="p-4 overflow-x-auto text-sm">
                <code>{sourceCode}</code>
              </pre>
            </div>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
