"use client";

import { Check, Code2, Copy, Eye } from "lucide-react";
import { type KeyboardEvent, useId, useState } from "react";
import type { ComponentCategory } from "@/lib/component-accents";
import { type PreviewName, previewRegistry } from "./preview-registry";

type ComponentPreviewClientProps = {
  children?: React.ReactNode;
  name?: `${PreviewName}-preview` | PreviewName;
  variant?: string;
  source: string;
  category: ComponentCategory;
};

const tabs = ["preview", "code"] as const;
type PreviewTab = (typeof tabs)[number];

export function ComponentPreviewClient({
  children,
  name,
  variant,
  source,
  category,
}: ComponentPreviewClientProps) {
  const [activeTab, setActiveTab] = useState<PreviewTab>("preview");
  const [copied, setCopied] = useState(false);
  const id = useId();
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

  function changeTab(nextTab: PreviewTab) {
    setActiveTab(nextTab);
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const currentIndex = tabs.indexOf(activeTab);
    const offset = event.key === "ArrowRight" ? 1 : -1;
    const nextTab = tabs[(currentIndex + offset + tabs.length) % tabs.length];
    setActiveTab(nextTab);
    document.getElementById(`${id}-${nextTab}-tab`)?.focus();
  }

  async function copySource() {
    await navigator.clipboard.writeText(source);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div
      className="component-preview not-prose"
      data-accent={category}
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
      <div className="component-preview-toolbar">
        <div role="tablist" aria-label="Component example view">
          <button
            id={`${id}-preview-tab`}
            type="button"
            role="tab"
            aria-selected={activeTab === "preview"}
            aria-controls={`${id}-preview-panel`}
            tabIndex={activeTab === "preview" ? 0 : -1}
            data-active={activeTab === "preview"}
            onClick={() => changeTab("preview")}
            onKeyDown={handleTabKeyDown}
          >
            <Eye aria-hidden /> Preview
          </button>
          <button
            id={`${id}-code-tab`}
            type="button"
            role="tab"
            aria-selected={activeTab === "code"}
            aria-controls={`${id}-code-panel`}
            tabIndex={activeTab === "code" ? 0 : -1}
            data-active={activeTab === "code"}
            onClick={() => changeTab("code")}
            onKeyDown={handleTabKeyDown}
          >
            <Code2 aria-hidden /> Code
          </button>
        </div>
        <div className="component-preview-meta">
          <span className="category-orbit" aria-hidden />
          <span>{selectedVariant?.label ?? "Default"}</span>
          {activeTab === "code" ? (
            <button
              type="button"
              onClick={copySource}
              aria-label="Copy example source"
            >
              {copied ? <Check aria-hidden /> : <Copy aria-hidden />}
            </button>
          ) : null}
        </div>
      </div>

      <div
        id={`${id}-preview-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-preview-tab`}
        hidden={activeTab !== "preview"}
        className="component-preview-canvas"
      >
        <div className="preview-colour-field" aria-hidden />
        <div className="component-preview-content">
          {Preview ? <Preview /> : children}
        </div>
      </div>

      <div
        id={`${id}-code-panel`}
        role="tabpanel"
        aria-labelledby={`${id}-code-tab`}
        hidden={activeTab !== "code"}
        className="component-preview-code"
      >
        <pre>
          <code>{source}</code>
        </pre>
      </div>
      <span className="sr-only" aria-live="polite">
        {copied ? "Example source copied" : ""}
      </span>
    </div>
  );
}
