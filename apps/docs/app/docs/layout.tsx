import { DocsLayout } from "fumadocs-ui/layouts/docs";
import type { CSSProperties } from "react";
import { MobileSidebarAccessibility } from "@/components/mobile-sidebar-accessibility";
import { baseOptions } from "@/lib/layout.shared";
import { source } from "@/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout
      tree={source.getPageTree()}
      {...baseOptions()}
      containerProps={{
        className: "docs-layout-shell",
        style: {
          "--fd-docs-height": "var(--moe-docs-height)",
          "--fd-sidebar-width": "var(--moe-sidebar-width)",
        } as CSSProperties,
      }}
      sidebar={{ tabs: false, collapsible: false }}
    >
      <MobileSidebarAccessibility />
      {children}
    </DocsLayout>
  );
}
