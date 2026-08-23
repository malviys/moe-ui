import { createHash } from "node:crypto";
import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import registryPackage from "../../../packages/registry/package.json";
import registryManifest from "../../../packages/registry/registry.json";

type RegistryFile = {
  path: string;
  target: string;
  content: string;
};

type RegistryItem = {
  $schema: string;
  schemaVersion: 1;
  name: string;
  title: string;
  description: string;
  category: string;
  type: "registry:ui" | "registry:lib";
  files: RegistryFile[];
  dependencies: Record<string, string>;
  registryDependencies: string[];
  integrity: string;
};

const workspaceRoot = path.resolve(import.meta.dirname, "../../..");
const registryRoot = path.join(workspaceRoot, "packages/registry/src");
const outputRoot = path.join(workspaceRoot, "apps/docs/public/r");
const schemaRoot = path.join(workspaceRoot, "apps/docs/public/schema");
const checkOnly = process.argv.includes("--check");

const publicComponents = new Map(
  registryManifest.components.map((component) => [component.name, component]),
);

const helperItems = new Map([
  [
    "icon",
    {
      name: "icon",
      title: "Icon",
      description: "Uniwind-aware Lucide icon helper.",
      category: "internal",
    },
  ],
  [
    "native-only-animated-view",
    {
      name: "native-only-animated-view",
      title: "Native-only Animated View",
      description: "Animation compatibility helper.",
      category: "internal",
    },
  ],
  [
    "utils",
    {
      name: "utils",
      title: "Utilities",
      description: "Class-name composition utility.",
      category: "internal",
    },
  ],
]);

const packageVersions = registryPackage.dependencies as Record<string, string>;

function packageName(specifier: string) {
  if (specifier.startsWith("@"))
    return specifier.split("/").slice(0, 2).join("/");
  return specifier.split("/")[0];
}

function extractImports(content: string) {
  return [...content.matchAll(/(?:from\s+|import\s+)["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
}

function sourceFor(name: string) {
  if (name === "utils") {
    return {
      source: path.join(registryRoot, "lib/cn.ts"),
      target: "lib/utils.ts",
      type: "registry:lib" as const,
    };
  }

  return {
    source: path.join(registryRoot, `components/ui/${name}.tsx`),
    target: `components/ui/${name}.tsx`,
    type: "registry:ui" as const,
  };
}

function resolveRelativeDependency(importer: string, specifier: string) {
  if (specifier.includes("lib/utils")) return "utils";
  const resolved = path.basename(
    path.resolve(path.dirname(importer), specifier),
  );
  return resolved.replace(/\.(?:ts|tsx)$/, "");
}

async function createItem(name: string): Promise<RegistryItem> {
  const metadata = publicComponents.get(name) ?? helperItems.get(name);
  if (!metadata) throw new Error(`Unknown registry item: ${name}`);

  const { source, target, type } = sourceFor(name);
  const content = await readFile(source, "utf8");
  const imports = extractImports(content);
  const registryDependencies = new Set<string>();
  const dependencies: Record<string, string> = {};

  for (const specifier of imports) {
    if (specifier.startsWith(".")) {
      const dependency = resolveRelativeDependency(source, specifier);
      if (
        dependency !== name &&
        (publicComponents.has(dependency) || helperItems.has(dependency))
      ) {
        registryDependencies.add(dependency);
      }
      continue;
    }

    const dependency = packageName(specifier);
    if (["react", "react/jsx-runtime"].includes(dependency)) continue;
    const version = packageVersions[dependency];
    if (version) dependencies[dependency] = version;
  }

  const integrity = `sha256-${createHash("sha256").update(content).digest("base64")}`;

  return {
    $schema: "https://moe-ui.vercel.app/schema/registry-item.json",
    schemaVersion: 1,
    name,
    title: metadata.title,
    description: metadata.description,
    category: metadata.category,
    type,
    files: [{ path: target, target, content }],
    dependencies: Object.fromEntries(
      Object.entries(dependencies).sort(([a], [b]) => a.localeCompare(b)),
    ),
    registryDependencies: [...registryDependencies].sort(),
    integrity,
  };
}

const registryItemSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://moe-ui.vercel.app/schema/registry-item.json",
  title: "Moe UI registry item",
  type: "object",
  additionalProperties: false,
  required: [
    "schemaVersion",
    "name",
    "type",
    "files",
    "dependencies",
    "registryDependencies",
    "integrity",
  ],
  properties: {
    $schema: { type: "string", format: "uri" },
    schemaVersion: { const: 1 },
    name: { type: "string", pattern: "^[a-z0-9-]+$" },
    title: { type: "string" },
    description: { type: "string" },
    category: { type: "string" },
    type: { enum: ["registry:ui", "registry:lib"] },
    files: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["path", "target", "content"],
        properties: {
          path: { type: "string" },
          target: { type: "string" },
          content: { type: "string" },
        },
      },
    },
    dependencies: { type: "object", additionalProperties: { type: "string" } },
    registryDependencies: {
      type: "array",
      items: { type: "string" },
      uniqueItems: true,
    },
    integrity: { type: "string", pattern: "^sha256-" },
  },
};

const componentsSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  $id: "https://moe-ui.vercel.app/schema/components.json",
  title: "Moe UI project configuration",
  type: "object",
  additionalProperties: false,
  required: ["schemaVersion", "registry", "typescript", "paths"],
  properties: {
    $schema: { type: "string", format: "uri" },
    schemaVersion: { const: 1 },
    registry: { type: "string", format: "uri" },
    typescript: { const: true },
    paths: {
      type: "object",
      additionalProperties: false,
      required: ["components", "lib", "css"],
      properties: {
        components: { type: "string" },
        lib: { type: "string" },
        css: { type: "string" },
      },
    },
  },
};

async function emit(file: string, value: unknown) {
  const content = `${JSON.stringify(value, null, 2)}\n`;
  await emitText(file, content);
}

async function emitText(file: string, content: string) {
  if (checkOnly) {
    try {
      const current = await readFile(file, "utf8");
      if (current !== content)
        throw new Error(
          `Generated registry file is stale: ${path.relative(workspaceRoot, file)}`,
        );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        throw new Error(
          `Generated registry file is missing: ${path.relative(workspaceRoot, file)}`,
        );
      }
      throw error;
    }
    return;
  }

  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, content);
}

async function main() {
  await access(registryRoot);
  const names = [...publicComponents.keys(), ...helperItems.keys()].sort();
  const items = await Promise.all(names.map(createItem));

  for (const item of items)
    await emit(path.join(outputRoot, `${item.name}.json`), item);

  await emit(path.join(outputRoot, "index.json"), {
    $schema: "https://moe-ui.vercel.app/schema/registry.json",
    schemaVersion: 1,
    name: "moe-ui",
    homepage: "https://moe-ui.vercel.app",
    items: items
      .filter((item) => publicComponents.has(item.name))
      .map(({ name, title, description, category, integrity }) => ({
        name,
        title,
        description,
        category,
        integrity,
      })),
  });
  await emit(path.join(schemaRoot, "registry-item.json"), registryItemSchema);
  await emit(path.join(schemaRoot, "components.json"), componentsSchema);

  const accessibilityCopy: Record<string, string> = {
    form: "Associate the control with a visible label. Keyboard focus, disabled state, and validation semantics are covered by the web test matrix.",
    overlay:
      "The trigger is keyboard reachable, Escape dismisses the surface, and focus returns to the trigger. Modal surfaces keep focus within the active layer.",
    navigation:
      "Arrow-key and Tab behavior follows the underlying accessible primitive. Focus indicators remain visible in both themes.",
    feedback:
      "Status is not communicated by color alone. Add an accessible label or live-region behavior when the message changes dynamically.",
    media:
      "Provide meaningful alternative text for informative media and an empty alternative for decorative media.",
    foundation:
      "Semantic roles, disabled state, visible focus, and contrast are verified in the component browser matrix.",
  };

  for (const component of registryManifest.components) {
    const symbol = component.title.replace(/\s+/g, "");
    const doc = `---
title: ${component.title}
description: ${component.description}
---

<ComponentPreview name="${component.name}-preview" />

## Installation

\`\`\`bash
pnpm dlx @moe-ui/cli@beta add ${component.name}
\`\`\`

## Usage

The CLI installs editable source into your application. Import the component from your configured UI directory:

\`\`\`tsx
import { ${symbol} } from "@/components/ui/${component.name}";
\`\`\`

## Variants and composition

Compound parts and variants remain regular source in your project, so you can change them without wrapping a package API.

## Public API

The canonical source panel above lists every public export, dependency, and the complete implementation shipped by the registry.

## Keyboard and accessibility

${accessibilityCopy[component.category]}

## Browser support

This beta is release-tested in Chromium, Firefox, and WebKit in light and dark themes. See the [web compatibility matrix](/docs/web-compatibility) for the current gate.
`;
    await emitText(
      path.join(
        workspaceRoot,
        "apps/docs/content/docs/components",
        `${component.name}.mdx`,
      ),
      doc,
    );
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
