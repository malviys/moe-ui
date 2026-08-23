"use client";

import { type PreviewName, previewRegistry } from "./preview-registry";

type ComponentPreviewProps = {
  children?: React.ReactNode;
  name?: `${PreviewName}-preview` | PreviewName;
};

export const ComponentPreview = ({ children, name }: ComponentPreviewProps) => {
  const normalizedName = name?.replace(/-preview$/, "") as
    | PreviewName
    | undefined;
  const Preview = normalizedName ? previewRegistry[normalizedName] : undefined;

  return (
    <div
      className="component-preview not-prose relative my-6 flex min-h-80 items-center justify-center overflow-visible rounded-2xl border border-fd-border bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--color-fd-primary)_8%,transparent),_transparent_58%)] p-6 md:p-10"
      data-component-preview={normalizedName}
      data-testid={
        normalizedName ? `preview-${normalizedName}` : "component-preview"
      }
    >
      <div className="absolute left-4 top-4 rounded-full border border-fd-border bg-fd-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fd-muted-foreground backdrop-blur">
        Live preview
      </div>
      {Preview ? <Preview /> : children}
    </div>
  );
};
