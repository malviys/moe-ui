"use client";

import { type PreviewName, previewRegistry } from "./preview-registry";

type ComponentPreviewProps = {
  children?: React.ReactNode;
  name?: `${PreviewName}-preview` | PreviewName;
  variant?: string;
};

export const ComponentPreview = ({
  children,
  name,
  variant,
}: ComponentPreviewProps) => {
  const normalizedName = name?.replace(/-preview$/, "") as
    | PreviewName
    | undefined;
  const definition = normalizedName
    ? previewRegistry[normalizedName]
    : undefined;
  const selectedVariant = variant
    ? definition?.variants?.find((item) => item.id === variant)
    : definition?.variants?.[0];
  const Preview = variant ? selectedVariant?.Preview : definition?.Preview;
  const previewId = selectedVariant?.id;

  return (
    <div
      className="component-preview not-prose relative my-6 flex min-h-80 items-center justify-center overflow-visible rounded-2xl border border-fd-border bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--color-fd-primary)_8%,transparent),_transparent_58%)] p-6 md:p-10"
      data-component-preview={normalizedName}
      data-preview-variant={previewId}
      data-testid={
        normalizedName && variant
          ? `preview-${normalizedName}-${variant}`
          : normalizedName
            ? `preview-${normalizedName}`
            : "component-preview"
      }
    >
      <div className="absolute left-4 top-4 rounded-full border border-fd-border bg-fd-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fd-muted-foreground backdrop-blur">
        Live preview
        {selectedVariant ? ` · ${selectedVariant.label}` : null}
      </div>
      {Preview ? <Preview /> : children}
    </div>
  );
};
