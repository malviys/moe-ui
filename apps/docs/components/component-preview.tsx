"use client";

import { cn } from "@/lib/cn";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import * as React from "react";
// import { examples, code } from "@/registry";

interface ComponentPreviewProps {
  name: string;
  children: React.ReactNode;
  className?: string;
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
  // if (!(examples as any)[name] || !(code as any)[name]) {
  //   return (
  //     <div className="text-sm text-muted-foreground">
  //       Component not found: {name}
  //     </div>
  //   );
  // }

  // const Component = (examples as Record<string, React.ComponentType<any>>)[
  //   name
  // ];
  // const sourceCode = (code as Record<string, string>)[name];

  return (
    <div
      className={cn("group my-4 flex flex-col space-y-2", className)}
      {...props}
    >
      <Tabs items={["Preview", "Code"]}>
        <Tab value="Preview">
          <div className="preview flex min-h-[350px] w-full justify-center p-10 items-center rounded-md border ring-offset-background bg-background">
            <React.Suspense
              fallback={<div className="text-sm text-muted">Loading...</div>}
            >
              {/* <Component /> */}
            </React.Suspense>
          </div>
        </Tab>
        <Tab value="Code">
          <div className="w-full rounded-md [&_pre]:my-0 [&_pre]:max-h-[350px] [&_pre]:overflow-auto border bg-fd-secondary/50">
            <pre className="p-4 overflow-x-auto text-sm">
              {/* <code>{sourceCode}</code> */}
            </pre>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
