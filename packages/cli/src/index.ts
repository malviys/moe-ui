import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
export const DEFAULT_REGISTRY = "https://moe-ui.vercel.app/r";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";

export type ComponentsConfig = {
  $schema: string;
  schemaVersion: 1;
  registry: string;
  typescript: true;
  paths: {
    components: string;
    lib: string;
    css: string;
  };
};

export type RegistryItem = {
  schemaVersion: 1;
  name: string;
  title: string;
  description: string;
  category: string;
  type: "registry:ui" | "registry:lib";
  files: Array<{ path: string; target: string; content: string }>;
  dependencies: Record<string, string>;
  registryDependencies: string[];
  integrity: string;
};

export type CliOptions = {
  cwd: string;
  yes: boolean;
  overwrite: boolean;
  install: boolean;
  packageManager?: PackageManager;
};

const SHARED_DEPENDENCIES: Record<string, string> = {
  "react-native": "0.83.1",
  "react-native-web": "^0.21.2",
  "lucide-react": "^0.563.0",
  tailwindcss: "^4.1.18",
  "@tailwindcss/postcss": "^4.2.1",
  uniwind: "^1.11.0",
  "uniwind-plugin-next": "1.4.2",
  clsx: "^2.1.1",
  "tailwind-merge": "^3.5.0",
};

function usage() {
  return `Moe UI v0.1 beta\n\nUsage:\n  moe-ui init [--cwd <path>] [--yes] [--package-manager <pnpm|npm|yarn|bun>] [--no-install]\n  moe-ui add <components...> [--cwd <path>] [--overwrite] [--no-install]\n`;
}

export function parseArguments(argv: string[]) {
  const [command, ...rest] = argv;
  if (!command || command === "help" || command === "--help" || command === "-h") {
    return { command: "help" as const, components: [], options: defaultOptions() };
  }

  if (command !== "init" && command !== "add") throw new Error(`Unknown command: ${command}\n\n${usage()}`);

  const options = defaultOptions();
  const components: string[] = [];

  for (let index = 0; index < rest.length; index += 1) {
    const argument = rest[index];
    if (argument === "--cwd") {
      const value = rest[++index];
      if (!value) throw new Error("--cwd requires a path");
      options.cwd = path.resolve(value);
    } else if (argument === "--package-manager") {
      const value = rest[++index] as PackageManager | undefined;
      if (!value || !["pnpm", "npm", "yarn", "bun"].includes(value)) {
        throw new Error("--package-manager must be pnpm, npm, yarn, or bun");
      }
      options.packageManager = value;
    } else if (argument === "--yes" || argument === "-y") {
      options.yes = true;
    } else if (argument === "--overwrite") {
      options.overwrite = true;
    } else if (argument === "--no-install") {
      options.install = false;
    } else if (argument.startsWith("-")) {
      throw new Error(`Unknown option: ${argument}`);
    } else {
      components.push(argument);
    }
  }

  if (command === "add" && components.length === 0) throw new Error("Add at least one component name.");
  return { command, components, options };
}

function defaultOptions(): CliOptions {
  return { cwd: process.cwd(), yes: false, overwrite: false, install: true };
}

async function exists(file: string) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  const locks: Array<[string, PackageManager]> = [
    ["pnpm-lock.yaml", "pnpm"],
    ["bun.lock", "bun"],
    ["bun.lockb", "bun"],
    ["yarn.lock", "yarn"],
    ["package-lock.json", "npm"],
  ];
  for (const [lock, manager] of locks) if (await exists(path.join(cwd, lock))) return manager;
  return "pnpm";
}

function dependencyArguments(manager: PackageManager, dependencies: Record<string, string>) {
  const packages = Object.entries(dependencies).map(([name, version]) => `${name}@${version}`);
  if (manager === "npm") return ["install", ...packages];
  if (manager === "yarn") return ["add", ...packages];
  return ["add", ...packages];
}

async function installDependencies(cwd: string, manager: PackageManager, dependencies: Record<string, string>) {
  if (Object.keys(dependencies).length === 0) return;
  await execFileAsync(manager, dependencyArguments(manager, dependencies), { cwd });
}

function nextHelperSource(cssPath: string) {
  return `import type { NextConfig } from "next";
import { createRequire } from "node:module";
import path from "node:path";
import { withUniwind } from "uniwind-plugin-next";

const require = createRequire(import.meta.url);
const optionalTranspilePackages = [
  "@rn-primitives/accordion", "@rn-primitives/alert-dialog", "@rn-primitives/aspect-ratio",
  "@rn-primitives/avatar", "@rn-primitives/checkbox", "@rn-primitives/collapsible",
  "@rn-primitives/context-menu", "@rn-primitives/dialog", "@rn-primitives/dropdown-menu",
  "@rn-primitives/hover-card", "@rn-primitives/label", "@rn-primitives/menubar",
  "@rn-primitives/popover", "@rn-primitives/portal", "@rn-primitives/progress",
  "@rn-primitives/radio-group", "@rn-primitives/select", "@rn-primitives/separator",
  "@rn-primitives/slot", "@rn-primitives/switch", "@rn-primitives/tabs",
  "@rn-primitives/toggle", "@rn-primitives/toggle-group", "@rn-primitives/tooltip",
].filter((packageName) => {
  try { require.resolve(packageName); return true; } catch { return false; }
});

export function withMoeUI(nextConfig: NextConfig): NextConfig {
  const previousWebpack = nextConfig.webpack;
  const configured: NextConfig = {
    ...nextConfig,
    transpilePackages: Array.from(new Set([
      ...(nextConfig.transpilePackages ?? []),
      ...optionalTranspilePackages,
      "react-native",
      "react-native-web",
      "react-native-reanimated",
      "react-native-screens",
      "react-native-svg",
      "lucide-react-native",
      "uniwind",
    ])),
    experimental: { ...nextConfig.experimental, forceSwcTransforms: true },
    webpack(config, options) {
      config.plugins.push(new options.webpack.DefinePlugin({ __DEV__: JSON.stringify(false) }));
      config.resolve ??= {};
      config.resolve.alias = {
        ...(config.resolve.alias ?? {}),
        "lucide-react-native$": "lucide-react",
        "react-native$": "react-native-web",
        "react-native-reanimated$": path.resolve(import.meta.dirname, "moe-ui.reanimated.web.tsx"),
        "react-native-screens$": path.resolve(import.meta.dirname, "moe-ui.screens.web.tsx"),
        "uniwind/components/index$": path.resolve(import.meta.dirname, "moe-ui.react-native.web.ts"),
        "react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$": "react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter",
        "react-native/Libraries/vendor/emitter/EventEmitter$": "react-native-web/dist/vendor/react-native/emitter/EventEmitter",
        "react-native/Libraries/EventEmitter/NativeEventEmitter$": "react-native-web/dist/vendor/react-native/NativeEventEmitter",
      };
      config.resolve.extensions = [".web.tsx", ".web.ts", ".web.jsx", ".web.js", ...(config.resolve.extensions ?? [])];
      return previousWebpack ? previousWebpack(config, options) : config;
    },
  };

  return withUniwind(configured, { cssEntryFile: "./${cssPath}", dtsFile: "./uniwind-types.d.ts" });
}
`;
}

function screensWebSource() {
  return `import { Fragment, type PropsWithChildren } from "react";

export function FullWindowOverlay({ children }: PropsWithChildren) {
  return <Fragment>{children}</Fragment>;
}
`;
}

function reactNativeWebSource() {
  return `export { Image } from "uniwind/components/Image";
export { Pressable } from "uniwind/components/Pressable";
export { ScrollView } from "uniwind/components/ScrollView";
export { Text } from "uniwind/components/Text";
export { TextInput } from "uniwind/components/TextInput";
export { View } from "uniwind/components/View";
export { Platform, StyleSheet, useColorScheme } from "react-native-web";
`;
}

function reanimatedWebSource() {
  return `import { Fragment, type PropsWithChildren } from "react";
import { View } from "react-native";

const transition = {
  duration: () => transition,
  damping: () => transition,
  springify: () => transition,
  stiffness: () => transition,
  withInitialValues: () => transition,
};

export const FadeIn = transition;
export const FadeOut = transition;
export const FadeInDown = transition;
export const FadeInUp = transition;
export const FadeOutUp = transition;
export const LinearTransition = transition;
export const Extrapolation = { CLAMP: "clamp" } as const;
export function LayoutAnimationConfig({ children }: PropsWithChildren<{ skipEntering?: boolean }>) { return <Fragment>{children}</Fragment>; }
export function useSharedValue<T>(value: T) { return { value }; }
export function useDerivedValue<T>(factory: () => T) { return { value: factory() }; }
export function useAnimatedStyle<T>(factory: () => T) { return factory(); }
export function withTiming<T>(value: T) { return value; }
export function withSpring<T>(value: T) { return value; }
export function withRepeat<T>(value: T) { return value; }
export function interpolate(value: number, input: number[], output: number[]) {
  const [inputStart = 0, inputEnd = 1] = input;
  const [outputStart = 0, outputEnd = 1] = output;
  const ratio = inputEnd === inputStart ? 0 : (value - inputStart) / (inputEnd - inputStart);
  return outputStart + ratio * (outputEnd - outputStart);
}
export default { View };
`;
}

function transformNextConfig(content: string) {
  if (content.includes("withMoeUI(")) return content;
  const match = content.match(/export\s+default\s+([A-Za-z_$][\w$]*)\s*;?/);
  if (!match) {
    throw new Error("Unsupported next.config export. Use `export default nextConfig` and run init again.");
  }
  return `import { withMoeUI } from "./moe-ui.next";\n${content.replace(match[0], `export default withMoeUI(${match[1]});`)}`;
}

function ensureCss(content: string) {
  const withoutImports = content
    .replace(/^\s*@import\s+["']tailwindcss["'];?\s*$/m, "")
    .replace(/^\s*@import\s+["']uniwind["'];?\s*$/m, "")
    .trimStart();
  const theme = withoutImports.includes("--color-background")
    ? ""
    : `\n@theme inline {\n  --color-background: var(--background);\n  --color-foreground: var(--foreground);\n  --color-primary: var(--primary);\n  --color-primary-foreground: var(--primary-foreground);\n  --color-border: var(--border);\n  --color-ring: var(--ring);\n}\n\n:root {\n  --background: oklch(1 0 0);\n  --foreground: oklch(0.145 0 0);\n  --primary: oklch(0.205 0 0);\n  --primary-foreground: oklch(0.985 0 0);\n  --border: oklch(0.922 0 0);\n  --ring: oklch(0.708 0 0);\n}\n\n.dark {\n  --background: oklch(0.145 0 0);\n  --foreground: oklch(0.985 0 0);\n  --primary: oklch(0.985 0 0);\n  --primary-foreground: oklch(0.205 0 0);\n  --border: oklch(1 0 0 / 10%);\n  --ring: oklch(0.556 0 0);\n}\n`;
  return `@import "tailwindcss";\n@import "uniwind";\n\n${withoutImports}${theme}`;
}

function addHydrationSuppression(content: string) {
  if (content.includes("suppressHydrationWarning")) return content;
  if (!content.includes("<html")) throw new Error("Root layout does not contain an <html> element.");
  return content.replace(/<html(\s|>)/, "<html suppressHydrationWarning$1");
}

async function findNextConfig(cwd: string) {
  for (const name of ["next.config.ts", "next.config.mjs", "next.config.js"]) {
    const file = path.join(cwd, name);
    if (await exists(file)) return file;
  }
  throw new Error("No next.config.ts, next.config.mjs, or next.config.js was found.");
}

async function readProjectPackage(cwd: string) {
  const file = path.join(cwd, "package.json");
  if (!(await exists(file))) throw new Error("No package.json was found.");
  return JSON.parse(await readFile(file, "utf8")) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
}

export async function initProject(options: CliOptions) {
  const cwd = path.resolve(options.cwd);
  const projectPackage = await readProjectPackage(cwd);
  if (!projectPackage.dependencies?.next && !projectPackage.devDependencies?.next) {
    throw new Error("Moe UI v0.1 supports Next.js App Router projects only.");
  }
  if (!(await exists(path.join(cwd, "tsconfig.json")))) throw new Error("Moe UI v0.1 requires TypeScript.");

  const usesSrc = await exists(path.join(cwd, "src/app/layout.tsx"));
  const appRoot = usesSrc ? "src/app" : "app";
  const layoutFile = path.join(cwd, appRoot, "layout.tsx");
  const cssRelative = `${appRoot}/globals.css`;
  const cssFile = path.join(cwd, cssRelative);
  const nextConfigFile = await findNextConfig(cwd);
  if (!(await exists(layoutFile)) || !(await exists(cssFile))) {
    throw new Error("Expected an App Router layout.tsx and globals.css file.");
  }

  const [nextConfig, layout, css] = await Promise.all([
    readFile(nextConfigFile, "utf8"),
    readFile(layoutFile, "utf8"),
    readFile(cssFile, "utf8"),
  ]);
  const transformedConfig = transformNextConfig(nextConfig);
  const transformedLayout = addHydrationSuppression(layout);
  const transformedCss = ensureCss(css);
  const manager = options.packageManager ?? (await detectPackageManager(cwd));

  const prefix = usesSrc ? "src/" : "";
  const config: ComponentsConfig = {
    $schema: "https://moe-ui.vercel.app/schema/components.json",
    schemaVersion: 1,
    registry: DEFAULT_REGISTRY,
    typescript: true,
    paths: {
      components: `${prefix}components`,
      lib: `${prefix}lib`,
      css: cssRelative,
    },
  };

  const configFile = path.join(cwd, "components.json");
  if (await exists(configFile)) {
    const existing = JSON.parse(await readFile(configFile, "utf8")) as Partial<ComponentsConfig>;
    if (JSON.stringify(existing) !== JSON.stringify(config)) {
      throw new Error("Existing components.json cannot be transformed safely. Reconcile it before running init.");
    }
  }

  const helperFile = path.join(cwd, "moe-ui.next.ts");
  const helperSource = nextHelperSource(cssRelative);
  const generatedFiles = [
    { file: helperFile, content: helperSource },
    { file: path.join(cwd, "moe-ui.reanimated.web.tsx"), content: reanimatedWebSource() },
    { file: path.join(cwd, "moe-ui.screens.web.tsx"), content: screensWebSource() },
    { file: path.join(cwd, "moe-ui.react-native.web.ts"), content: reactNativeWebSource() },
    {
      file: path.join(cwd, "uniwind-types.d.ts"),
      content:
        '/// <reference types="uniwind/types" />\n\ndeclare module "react-native-web" {\n  export { Platform, StyleSheet, useColorScheme } from "react-native";\n}\n',
    },
  ];
  for (const generatedFile of generatedFiles) {
    if ((await exists(generatedFile.file)) && (await readFile(generatedFile.file, "utf8")) !== generatedFile.content) {
      throw new Error(`Existing ${path.basename(generatedFile.file)} contains local changes. Reconcile it before running init.`);
    }
  }

  if (options.install) await installDependencies(cwd, manager, SHARED_DEPENDENCIES);

  await Promise.all([
    writeFile(nextConfigFile, transformedConfig),
    writeFile(layoutFile, transformedLayout),
    writeFile(cssFile, transformedCss),
    ...generatedFiles.map((generatedFile) => writeFile(generatedFile.file, generatedFile.content)),
    writeFile(configFile, `${JSON.stringify(config, null, 2)}\n`),
  ]);

  return config;
}

export function validateRegistryItem(value: unknown): RegistryItem {
  if (!value || typeof value !== "object") throw new Error("Registry response is not an object.");
  const item = value as Partial<RegistryItem>;
  if (item.schemaVersion !== 1 || !item.name || !Array.isArray(item.files) || !Array.isArray(item.registryDependencies)) {
    throw new Error("Registry item does not match schema version 1.");
  }
  if (!item.dependencies || typeof item.dependencies !== "object" || !item.integrity) {
    throw new Error("Registry item is missing dependency or integrity metadata.");
  }
  return item as RegistryItem;
}

async function fetchItem(registry: string, name: string) {
  const response = await fetch(`${registry.replace(/\/$/, "")}/${encodeURIComponent(name)}.json`);
  if (!response.ok) throw new Error(`Unable to fetch ${name}: ${response.status} ${response.statusText}`);
  const item = validateRegistryItem(await response.json());
  for (const file of item.files) {
    const actual = `sha256-${createHash("sha256").update(file.content).digest("base64")}`;
    if (item.files.length === 1 && actual !== item.integrity) throw new Error(`Integrity check failed for ${name}.`);
  }
  return item;
}

async function resolveItems(registry: string, requested: string[]) {
  const items = new Map<string, RegistryItem>();
  const queue = [...requested];
  while (queue.length > 0) {
    const name = queue.shift()!;
    if (items.has(name)) continue;
    const item = await fetchItem(registry, name);
    items.set(name, item);
    queue.unshift(...item.registryDependencies);
  }
  return [...items.values()];
}

function targetPath(cwd: string, config: ComponentsConfig, target: string) {
  if (target.startsWith("components/")) {
    return path.join(cwd, config.paths.components, target.slice("components/".length));
  }
  if (target.startsWith("lib/")) return path.join(cwd, config.paths.lib, target.slice("lib/".length));
  throw new Error(`Unsupported registry target: ${target}`);
}

async function confirmOverwrite(relativePath: string) {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(`${relativePath} already exists. Re-run with --overwrite.`);
  }

  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await prompt.question(`Overwrite ${relativePath}? (y/N) `);
    if (!/^y(es)?$/i.test(answer.trim())) {
      throw new Error(`Kept local changes in ${relativePath}.`);
    }
  } finally {
    prompt.close();
  }
}

export async function addComponents(names: string[], options: CliOptions) {
  const cwd = path.resolve(options.cwd);
  const configFile = path.join(cwd, "components.json");
  if (!(await exists(configFile))) throw new Error("Run `moe-ui init` before adding components.");
  const config = JSON.parse(await readFile(configFile, "utf8")) as ComponentsConfig;
  if (config.schemaVersion !== 1 || config.typescript !== true) throw new Error("Unsupported components.json schema.");

  const items = await resolveItems(config.registry, names);
  const writes: Array<{ file: string; content: string }> = [];
  for (const item of items) {
    for (const registryFile of item.files) {
      const file = targetPath(cwd, config, registryFile.target);
      if (await exists(file)) {
        const current = await readFile(file, "utf8");
        if (current === registryFile.content) continue;
        if (!options.overwrite) await confirmOverwrite(path.relative(cwd, file));
      }
      writes.push({ file, content: registryFile.content });
    }
  }

  const dependencies = Object.assign({}, ...items.map((item) => item.dependencies)) as Record<string, string>;
  const manager = options.packageManager ?? (await detectPackageManager(cwd));
  if (options.install) await installDependencies(cwd, manager, dependencies);

  for (const write of writes) {
    await mkdir(path.dirname(write.file), { recursive: true });
    const temporary = `${write.file}.moe-ui-tmp`;
    await writeFile(temporary, write.content);
    await rename(temporary, write.file);
  }

  return { items: items.map((item) => item.name), files: writes.map((write) => write.file) };
}

export async function run(argv = process.argv.slice(2)) {
  const parsed = parseArguments(argv);
  if (parsed.command === "help") {
    console.log(usage());
    return;
  }
  if (parsed.command === "init") {
    await initProject(parsed.options);
    console.log("Moe UI initialized. Add a component with `moe-ui add button`.");
    return;
  }
  const result = await addComponents(parsed.components, parsed.options);
  console.log(`Installed ${result.items.join(", ")}.`);
}

const isEntry = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isEntry) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
