import { source } from "@/lib/source";
import { DocsLayout } from "fumadocs-ui/layouts/docs";
import { baseOptions } from "@/lib/layout.shared";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="bg-gradient-to-r from-yellow-500/10 via-orange-500/10 to-yellow-500/10 border-b border-yellow-500/20 px-4 py-2 text-center text-sm shrink-0">
        🚧 This project is in <strong>experimental phase</strong> and will be
        stable after v1.0.0
      </div>
      <div className="flex-1 [&>div]:h-full">
        <DocsLayout
          tree={source.getPageTree()}
          {...baseOptions()}
          sidebar={{ tabs: false }}
        >
          {children}
        </DocsLayout>
      </div>
    </div>
  );
}
