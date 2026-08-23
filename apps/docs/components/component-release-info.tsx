import { readFile } from "node:fs/promises";
import path from "node:path";
import { Check, Copy, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getComponent } from "@/lib/registry";

type RegistryItem = {
  files: Array<{ content: string }>;
  dependencies: Record<string, string>;
  registryDependencies: string[];
};

function extractExports(source: string) {
  const block =
    [...source.matchAll(/export\s*\{([^}]+)\}/gs)].at(-1)?.[1] ?? "";
  return block
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => name.split(/\s+as\s+/).at(-1) ?? name);
}

export async function ComponentReleaseInfo({ name }: { name: string }) {
  const metadata = getComponent(name);
  if (!metadata) return null;
  const registryFile = path.join(process.cwd(), "public/r", `${name}.json`);
  const item = JSON.parse(await readFile(registryFile, "utf8")) as RegistryItem;
  const source = item.files[0]?.content ?? "";
  const exports = extractExports(source);

  return (
    <div
      className="not-prose mb-8 space-y-4"
      data-testid={`release-info-${name}`}
    >
      <div className="grid gap-px overflow-hidden rounded-xl border border-fd-border bg-fd-border md:grid-cols-[1.4fr_1fr]">
        <div className="bg-fd-card p-5">
          <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-fd-muted-foreground">
            Install source
          </p>
          <div className="flex items-center justify-between gap-3 rounded-lg border border-fd-border bg-fd-background px-3 py-2.5">
            <code className="overflow-x-auto text-sm">
              pnpm dlx @moe-ui/cli@beta add {name}
            </code>
            <Copy
              className="size-4 shrink-0 text-fd-muted-foreground"
              aria-hidden
            />
          </div>
        </div>
        <div className="bg-fd-card p-5">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.2em] text-fd-muted-foreground">
            Web beta status
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {["Chromium", "Firefox", "WebKit", "WCAG 2.2 AA"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 rounded-full border border-emerald-500/25 bg-emerald-500/8 px-2 py-1 text-emerald-700 dark:text-emerald-300"
              >
                <Check className="size-3" aria-hidden /> {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <details className="group rounded-xl border border-fd-border bg-fd-card">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium">
          Canonical source and public exports
          <span className="font-mono text-xs text-fd-muted-foreground">
            {exports.length} exports
          </span>
        </summary>
        <div className="border-t border-fd-border p-5">
          <div className="mb-4 flex flex-wrap gap-2">
            {exports.map((name) => (
              <code
                key={name}
                className="rounded bg-fd-muted px-2 py-1 text-xs"
              >
                {name}
              </code>
            ))}
          </div>
          <pre className="max-h-[32rem] overflow-auto rounded-lg bg-neutral-950 p-4 text-xs leading-relaxed text-neutral-100">
            <code>{source}</code>
          </pre>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-fd-muted-foreground">
            <span>
              {Object.keys(item.dependencies).length} package dependencies
            </span>
            <span>
              {item.registryDependencies.length} registry dependencies
            </span>
            <Link
              className="ml-auto inline-flex items-center gap-1 text-fd-foreground hover:underline"
              href={`https://github.com/moe-ui/moe-ui/blob/main/packages/registry/src/components/ui/${name}.tsx`}
              target="_blank"
            >
              Open source <ExternalLink className="size-3" aria-hidden />
            </Link>
          </div>
        </div>
      </details>
    </div>
  );
}
