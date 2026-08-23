import { readFile } from "node:fs/promises";
import path from "node:path";
import { Check, ExternalLink } from "lucide-react";
import Link from "next/link";
import { getComponent } from "@/lib/registry";

type RegistryItem = {
  files: Array<{ content: string }>;
  dependencies: Record<string, string>;
  registryDependencies: string[];
};

const webBetaLabels = ["Chromium", "Firefox", "WebKit", "WCAG 2.2 AA"] as const;

function extractExports(source: string) {
  const block =
    [...source.matchAll(/export\s*\{([^}]+)\}/gs)].at(-1)?.[1] ?? "";
  return block
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .map((name) => name.split(/\s+as\s+/).at(-1) ?? name);
}

export function WebBetaStatus({ name }: { name: string }) {
  return (
    <ul
      aria-label="Web beta status"
      className="web-beta-status m-0 flex list-none flex-wrap gap-2 p-0 text-xs"
      data-testid={`web-beta-status-${name}`}
    >
      {webBetaLabels.map((label) => (
        <li
          key={label}
          className="inline-flex items-center gap-1 rounded-full px-2 py-1"
        >
          <Check className="size-3" aria-hidden /> {label}
        </li>
      ))}
    </ul>
  );
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
      className="component-source not-prose mb-8 space-y-4"
      data-testid={`release-info-${name}`}
    >
      <details className="group source-disclosure">
        <summary>
          <span>
            <span className="eyebrow">Nothing hidden</span>
            Canonical source and public exports
          </span>
          <span className="font-mono text-xs text-fd-muted-foreground">
            {exports.length} exports
          </span>
        </summary>
        <div className="source-disclosure-body">
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
          <pre>
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
