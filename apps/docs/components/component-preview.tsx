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
  const definition = normalizedName
    ? previewRegistry[normalizedName]
    : undefined;
  const Preview = definition?.Preview;
  const variants = definition?.variants;
  const hasVariants = Boolean(variants?.length);

  return (
    <div
      className={`component-preview not-prose relative my-6 min-h-80 overflow-visible rounded-2xl border border-fd-border bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--color-fd-primary)_8%,transparent),_transparent_58%)] ${
        hasVariants
          ? "p-4 pt-16 md:p-6 md:pt-16"
          : "flex items-center justify-center p-6 md:p-10"
      }`}
      data-component-preview={normalizedName}
      data-testid={
        normalizedName ? `preview-${normalizedName}` : "component-preview"
      }
    >
      <div className="absolute left-4 top-4 rounded-full border border-fd-border bg-fd-background/80 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-fd-muted-foreground backdrop-blur">
        {hasVariants ? "Live variants" : "Live preview"}
      </div>
      {variants?.length ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {variants.map(({ id, label, Preview: VariantPreview }) => (
            <section
              className="relative flex min-h-44 items-center justify-center overflow-hidden rounded-xl border border-fd-border/80 bg-fd-background/75 px-5 pb-6 pt-12 shadow-sm shadow-black/[0.03]"
              data-preview-variant={id}
              data-testid={`preview-${normalizedName}-${id}`}
              key={id}
            >
              <div className="absolute inset-x-0 top-0 flex h-9 items-center border-b border-fd-border/70 bg-fd-muted/45 px-3 font-mono text-[11px] font-medium text-fd-muted-foreground">
                {label}
              </div>
              <VariantPreview />
            </section>
          ))}
        </div>
      ) : Preview ? (
        <Preview />
      ) : (
        children
      )}
    </div>
  );
};
