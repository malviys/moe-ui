import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { access, mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
export const DEFAULT_REGISTRY = "https://moe-ui-docs.vercel.app/r";

export type PackageManager = "pnpm" | "npm" | "yarn" | "bun";
export type Framework = "next" | "expo";
export type StylingEngine = "uniwind" | "nativewind";

type ConfigPaths = { components: string; lib: string; css: string };

export type ComponentsConfig = {
  $schema: string;
  schemaVersion: 2;
  registry: string;
  typescript: true;
  framework: Framework;
  styling: StylingEngine;
  paths: ConfigPaths;
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
  registry?: string;
  styling?: StylingEngine;
};

export type RegistryIndexItem = {
  name: string;
  title: string;
  description: string;
  category: string;
};

type ProjectPackage = {
  type?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type PlannedFile = {
  file: string;
  content: string;
  generated?: boolean;
  skipIfExists?: boolean;
};

const COMMON_NEXT_DEPENDENCIES: Record<string, string> = {
  "react-native": "0.83.1",
  "react-native-web": "^0.21.2",
  "lucide-react": "^0.563.0",
  clsx: "^2.1.1",
};
const UNIWIND_DEPENDENCIES: Record<string, string> = {
  uniwind: "^1.11.0",
  tailwindcss: "^4.1.18",
  "tailwind-merge": "^3.5.0",
  "tw-animate-css": "^1.4.0",
};
const NATIVEWIND_DEPENDENCIES: Record<string, string> = {
  nativewind: "preview",
  "react-native-css": "latest",
  "react-native-reanimated": "latest",
  "react-native-safe-area-context": "latest",
  "@tailwindcss/postcss": "^4.2.1",
  lightningcss: "1.30.1",
  postcss: "^8.5.6",
  tailwindcss: "^4.2.1",
  "tailwind-merge": "^3.5.0",
  "tw-animate-css": "^1.4.0",
};
const EXPO_NATIVE_PACKAGES = new Set([
  "nativewind",
  "react-native",
  "react-native-css",
  "react-native-web",
  "react-native-reanimated",
  "react-native-screens",
  "react-native-svg",
  "react-native-safe-area-context",
]);

function usage() {
  return `Moe UI v0.1 beta\n\nUsage:\n  moe-ui\n  moe-ui init [--cwd <path>] [--styling <uniwind|nativewind>] [--registry <url>] [--yes] [--package-manager <pnpm|npm|yarn|bun>] [--no-install]\n  moe-ui add [components...] [--cwd <path>] [--overwrite] [--no-install]\n\nRun without a command for interactive mode.\n`;
}

export function parseArguments(argv: string[]) {
  const [command, ...rest] = argv;
  if (!command) {
    return {
      command: "interactive" as const,
      components: [],
      options: defaultOptions(),
    };
  }
  if (command === "help" || command === "--help" || command === "-h") {
    return {
      command: "help" as const,
      components: [],
      options: defaultOptions(),
    };
  }
  if (command !== "init" && command !== "add") {
    throw new Error(`Unknown command: ${command}\n\n${usage()}`);
  }
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
    } else if (argument === "--registry") {
      if (command !== "init")
        throw new Error("--registry is only valid with `moe-ui init`.");
      const value = rest[++index];
      if (!value) throw new Error("--registry requires a URL");
      options.registry = normalizeRegistryUrl(value);
    } else if (argument === "--styling") {
      if (command !== "init")
        throw new Error("--styling is only valid with `moe-ui init`.");
      const value = rest[++index] as StylingEngine | undefined;
      if (!value || !["uniwind", "nativewind"].includes(value)) {
        throw new Error("--styling must be uniwind or nativewind");
      }
      options.styling = value;
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
  return { command, components, options };
}

function defaultOptions(): CliOptions {
  return { cwd: process.cwd(), yes: false, overwrite: false, install: true };
}

function interactiveTerminal() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

async function ask(question: string) {
  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    return await prompt.question(question);
  } finally {
    prompt.close();
  }
}

export function parseCommandSelection(answer: string): "init" | "add" {
  const selection = answer.trim().toLowerCase();
  if (selection === "" || selection === "1" || selection === "init")
    return "init";
  if (selection === "2" || selection === "add") return "add";
  throw new Error("Invalid command selection. Enter 1 for init or 2 for add.");
}

async function selectCommand() {
  if (!interactiveTerminal()) return "help" as const;
  const answer = await ask(
    "What would you like to do?\n  1. Initialize this project\n  2. Add components\nSelection [1]: ",
  );
  return parseCommandSelection(answer);
}

export function normalizeRegistryUrl(value: string) {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Registry must be a valid http:// or https:// URL.");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("Registry must be a valid http:// or https:// URL.");
  }
  return url.toString().replace(/\/$/, "");
}

async function exists(file: string) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

export async function detectPackageManager(
  cwd: string,
): Promise<PackageManager> {
  const locks: Array<[string, PackageManager]> = [
    ["pnpm-lock.yaml", "pnpm"],
    ["bun.lock", "bun"],
    ["bun.lockb", "bun"],
    ["yarn.lock", "yarn"],
    ["package-lock.json", "npm"],
  ];
  for (const [lock, manager] of locks) {
    if (await exists(path.join(cwd, lock))) return manager;
  }
  return "pnpm";
}

function dependencyArguments(
  manager: PackageManager,
  dependencies: Record<string, string>,
) {
  const packages = Object.entries(dependencies).map(
    ([name, version]) => `${name}@${version}`,
  );
  if (manager === "npm") return ["install", ...packages];
  if (manager === "yarn") return ["add", ...packages];
  return ["add", ...packages];
}

async function installDependencies(
  cwd: string,
  manager: PackageManager,
  dependencies: Record<string, string>,
) {
  if (Object.keys(dependencies).length === 0) return;
  await execFileAsync(manager, dependencyArguments(manager, dependencies), {
    cwd,
  });
}

function expoInstallCommand(manager: PackageManager, packages: string[]) {
  if (manager === "pnpm")
    return { command: "pnpm", args: ["exec", "expo", "install", ...packages] };
  if (manager === "yarn")
    return { command: "yarn", args: ["expo", "install", ...packages] };
  if (manager === "bun")
    return { command: "bunx", args: ["expo", "install", ...packages] };
  return { command: "npx", args: ["expo", "install", ...packages] };
}

async function installExpoDependencies(
  cwd: string,
  manager: PackageManager,
  dependencies: Record<string, string>,
) {
  const nativePackages = Object.entries(dependencies)
    .filter(([name]) => EXPO_NATIVE_PACKAGES.has(name))
    .map(([name, version]) =>
      name === "nativewind" || name === "react-native-css"
        ? `${name}@${version}`
        : name,
    );
  const regularDependencies = Object.fromEntries(
    Object.entries(dependencies).filter(
      ([name]) => !EXPO_NATIVE_PACKAGES.has(name),
    ),
  );
  await installDependencies(cwd, manager, regularDependencies);
  if (nativePackages.length > 0) {
    const { command, args } = expoInstallCommand(manager, nativePackages);
    await execFileAsync(command, args, { cwd });
  }
}

export function dependenciesFor(framework: Framework, styling: StylingEngine) {
  return {
    ...(framework === "next" ? COMMON_NEXT_DEPENDENCIES : {}),
    ...(styling === "uniwind" ? UNIWIND_DEPENDENCIES : NATIVEWIND_DEPENDENCIES),
    ...(framework === "next" && styling === "uniwind"
      ? { "@tailwindcss/postcss": "^4.2.1", "uniwind-plugin-next": "1.4.2" }
      : {}),
  };
}

function normalizeConfig(value: unknown): ComponentsConfig {
  if (!value || typeof value !== "object")
    throw new Error("Unsupported components.json schema.");
  const config = value as {
    $schema?: string;
    schemaVersion?: number;
    registry?: string;
    typescript?: boolean;
    framework?: Framework;
    styling?: StylingEngine;
    paths?: Partial<ConfigPaths>;
  };
  if (
    config.typescript !== true ||
    !config.registry ||
    !config.paths ||
    typeof config.paths.components !== "string" ||
    typeof config.paths.lib !== "string" ||
    typeof config.paths.css !== "string"
  ) {
    throw new Error("Unsupported components.json schema.");
  }
  if (config.schemaVersion === 1) {
    return {
      $schema:
        config.$schema ??
        "https://moe-ui-docs.vercel.app/schema/components.json",
      schemaVersion: 2,
      registry: config.registry,
      typescript: true,
      framework: "next",
      styling: "uniwind",
      paths: config.paths as ConfigPaths,
    };
  }
  if (
    config.schemaVersion !== 2 ||
    !["next", "expo"].includes(config.framework ?? "") ||
    !["uniwind", "nativewind"].includes(config.styling ?? "")
  ) {
    throw new Error("Unsupported components.json schema.");
  }
  return config as ComponentsConfig;
}

async function readExistingConfig(cwd: string) {
  const file = path.join(cwd, "components.json");
  if (!(await exists(file))) return undefined;
  try {
    const value = JSON.parse(await readFile(file, "utf8")) as {
      schemaVersion?: number;
    };
    return {
      config: normalizeConfig(value),
      legacy: value.schemaVersion === 1,
    };
  } catch (error) {
    throw new Error(
      `Existing components.json cannot be transformed safely. ${
        error instanceof Error
          ? error.message
          : "Reconcile it before running init."
      }`,
    );
  }
}

async function selectStyling(
  options: CliOptions,
  existing: ComponentsConfig | undefined,
) {
  if (existing) {
    if (options.styling && options.styling !== existing.styling) {
      throw new Error(
        `This project is already initialized with ${existing.styling}. Automatic styling-engine switching is not supported.`,
      );
    }
    return existing.styling;
  }
  if (options.styling) return options.styling;
  if (options.yes) return "uniwind" as const;
  if (!interactiveTerminal()) {
    throw new Error(
      "A styling engine is required in non-interactive mode. Pass --styling uniwind|nativewind or --yes to accept Uniwind.",
    );
  }
  const answer = await ask(
    "Choose a styling engine:\n  1. Uniwind (recommended)\n  2. NativeWind\nSelection [1]: ",
  );
  return parseStylingSelection(answer);
}

export function parseStylingSelection(answer: string): StylingEngine {
  if (answer.trim() === "" || answer.trim() === "1") return "uniwind";
  if (answer.trim() === "2") return "nativewind";
  throw new Error(
    "Invalid styling selection. Enter 1 for Uniwind or 2 for NativeWind.",
  );
}

async function selectRegistry(
  options: CliOptions,
  existing: ComponentsConfig | undefined,
) {
  if (options.registry) return options.registry;
  if (existing) return existing.registry;
  if (options.yes || !interactiveTerminal()) return DEFAULT_REGISTRY;
  const answer = await ask(`Registry URL [${DEFAULT_REGISTRY}]: `);
  return answer.trim() === "" ? DEFAULT_REGISTRY : normalizeRegistryUrl(answer);
}

async function readProjectPackage(cwd: string) {
  const file = path.join(cwd, "package.json");
  if (!(await exists(file))) throw new Error("No package.json was found.");
  return JSON.parse(await readFile(file, "utf8")) as ProjectPackage;
}

export function detectFramework(projectPackage: ProjectPackage): Framework {
  const dependencies = {
    ...projectPackage.devDependencies,
    ...projectPackage.dependencies,
  };
  const hasNext = Boolean(dependencies.next);
  const hasExpo = Boolean(dependencies.expo);
  if (hasNext && hasExpo) {
    throw new Error(
      "Both Next.js and Expo were detected. Run init with --cwd pointing at one application package.",
    );
  }
  if (hasNext) return "next";
  if (hasExpo) return "expo";
  throw new Error(
    "Moe UI supports Next.js and Expo projects. Neither framework was detected.",
  );
}

const OPTIONAL_TRANSPILE_PACKAGES = [
  "@rn-primitives/accordion",
  "@rn-primitives/alert-dialog",
  "@rn-primitives/aspect-ratio",
  "@rn-primitives/avatar",
  "@rn-primitives/checkbox",
  "@rn-primitives/collapsible",
  "@rn-primitives/context-menu",
  "@rn-primitives/dialog",
  "@rn-primitives/dropdown-menu",
  "@rn-primitives/hover-card",
  "@rn-primitives/label",
  "@rn-primitives/menubar",
  "@rn-primitives/popover",
  "@rn-primitives/portal",
  "@rn-primitives/progress",
  "@rn-primitives/radio-group",
  "@rn-primitives/select",
  "@rn-primitives/separator",
  "@rn-primitives/slot",
  "@rn-primitives/switch",
  "@rn-primitives/tabs",
  "@rn-primitives/toggle",
  "@rn-primitives/toggle-group",
  "@rn-primitives/tooltip",
] as const;

function nextHelperSource(cssPath: string, styling: StylingEngine) {
  const stylingImport =
    styling === "uniwind"
      ? 'import { withUniwind } from "uniwind-plugin-next";\n'
      : "";
  const stylingPackages =
    styling === "uniwind"
      ? '      "uniwind",\n'
      : '      "nativewind",\n      "react-native-css",\n';
  const uniwindAlias =
    styling === "uniwind"
      ? '        "uniwind/components/index$": path.resolve(import.meta.dirname, "moe-ui.react-native.web.ts"),\n'
      : "";
  const result =
    styling === "uniwind"
      ? `return withUniwind(configured, { cssEntryFile: "./${cssPath}", dtsFile: "./uniwind-types.d.ts" });`
      : "return configured;";
  return `import type { NextConfig } from "next";
import { createRequire } from "node:module";
import path from "node:path";
${stylingImport}
const require = createRequire(import.meta.url);
const optionalTranspilePackages = ${JSON.stringify(OPTIONAL_TRANSPILE_PACKAGES, null, 2)}.filter((packageName) => {
  try { require.resolve(packageName); return true; } catch { return false; }
});

export function withMoeUI(nextConfig: NextConfig): NextConfig {
  const previousWebpack = nextConfig.webpack;
  const configured: NextConfig = {
    ...nextConfig,
    transpilePackages: Array.from(new Set([
      ...(nextConfig.transpilePackages ?? []),
      ...optionalTranspilePackages,
      "react-native", "react-native-web", "react-native-reanimated",
      "react-native-screens", "react-native-svg", "lucide-react-native",
${stylingPackages}    ])),
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
${uniwindAlias}        "react-native/Libraries/EventEmitter/RCTDeviceEventEmitter$": "react-native-web/dist/vendor/react-native/NativeEventEmitter/RCTDeviceEventEmitter",
        "react-native/Libraries/vendor/emitter/EventEmitter$": "react-native-web/dist/vendor/react-native/emitter/EventEmitter",
        "react-native/Libraries/EventEmitter/NativeEventEmitter$": "react-native-web/dist/vendor/react-native/NativeEventEmitter",
      };
      config.resolve.extensions = [".web.tsx", ".web.ts", ".web.jsx", ".web.js", ...(config.resolve.extensions ?? [])];
      return previousWebpack ? previousWebpack(config, options) : config;
    },
  };
  ${result}
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
  duration: () => transition, damping: () => transition, springify: () => transition,
  stiffness: () => transition, withInitialValues: () => transition,
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

function stylingAdapterSource(styling: StylingEngine) {
  if (styling === "uniwind") {
    return `import type { ComponentType } from "react";
import { withUniwind } from "uniwind";
export function withMoeIcon<Props extends object>(
  component: ComponentType<Props>,
): ComponentType<Props> {
  return withUniwind(component, {
    size: { fromClassName: "className", styleProperty: "width" },
    color: { fromClassName: "className", styleProperty: "color" },
  }) as ComponentType<Props>;
}
`;
  }
  return `import type { ComponentType } from "react";
import { styled } from "nativewind";
type MoeIconInteropProps = {
  className?: string;
  style?: object;
  size?: number | string;
  color?: string;
};
export function withMoeIcon<Props extends object>(
  component: ComponentType<Props>,
): ComponentType<Props> {
  return styled(component as unknown as ComponentType<MoeIconInteropProps>, {
    className: { target: "style", nativeStyleToProp: { width: "size", height: "size", color: true } },
  }) as unknown as ComponentType<Props>;
}
`;
}

function metroHelperSource(styling: StylingEngine, cssPath: string) {
  if (styling === "uniwind") {
    return `const { withUniwindConfig } = require("uniwind/metro");
function withMoeUI(config) {
  return withUniwindConfig(config, { cssEntryFile: "./${cssPath}", dtsFile: "./uniwind-types.d.ts" });
}
module.exports = { withMoeUI };
`;
  }
  return `const { withNativewind } = require("nativewind/metro");
function withMoeUI(config) { return withNativewind(config); }
module.exports = { withMoeUI };
`;
}

function transformNextConfig(content: string) {
  if (content.includes("withMoeUI(")) return content;
  const match = content.match(/export\s+default\s+([A-Za-z_$][\w$]*)\s*;?/);
  if (!match)
    throw new Error(
      "Unsupported next.config export. Use `export default nextConfig` and run init again.",
    );
  return `import { withMoeUI } from "./moe-ui.next";\n${content.replace(match[0], `export default withMoeUI(${match[1]});`)}`;
}

function transformMetroConfig(content: string) {
  if (content.includes("withMoeUI(")) return content;
  const match = content.match(/module\.exports\s*=\s*([A-Za-z_$][\w$]*)\s*;?/);
  if (!match)
    throw new Error(
      "Unsupported Metro config. Export a named config with `module.exports = config` and run init again.",
    );
  return `const { withMoeUI } = require("./moe-ui.metro.cjs");\n${content.replace(match[0], `module.exports = withMoeUI(${match[1]});`)}`;
}

function defaultMetroConfig() {
  return `const { getDefaultConfig } = require("expo/metro-config");
const { withMoeUI } = require("./moe-ui.metro.cjs");
const config = getDefaultConfig(__dirname);
module.exports = withMoeUI(config);
`;
}

const UNIWIND_THEME = `/* Moe UI theme */
@layer theme {
  :root {
    @variant light {
      --color-background: oklch(100% 0 0); --color-foreground: oklch(14.5% 0 0);
      --color-card: oklch(100% 0 0); --color-card-foreground: oklch(14.5% 0 0);
      --color-popover: oklch(100% 0 0); --color-popover-foreground: oklch(14.5% 0 0);
      --color-primary: oklch(20.5% 0 0); --color-primary-foreground: oklch(98% 0 0);
      --color-secondary: oklch(96.7% 0 0); --color-secondary-foreground: oklch(20.5% 0 0);
      --color-muted: oklch(96.7% 0 0); --color-muted-foreground: oklch(55.5% 0 0);
      --color-accent: oklch(96.7% 0 0); --color-accent-foreground: oklch(20.5% 0 0);
      --color-destructive: oklch(55% 0.22 29.23); --color-border: oklch(91.7% 0 0);
      --color-input: oklch(91.7% 0 0); --color-ring: oklch(69.4% 0 0);
    }
    @variant dark {
      --color-background: oklch(14.5% 0 0); --color-foreground: oklch(98% 0 0);
      --color-card: oklch(14.5% 0 0); --color-card-foreground: oklch(98% 0 0);
      --color-popover: oklch(14.5% 0 0); --color-popover-foreground: oklch(98% 0 0);
      --color-primary: oklch(98% 0 0); --color-primary-foreground: oklch(20.5% 0 0);
      --color-secondary: oklch(28.5% 0 0); --color-secondary-foreground: oklch(98% 0 0);
      --color-muted: oklch(28.5% 0 0); --color-muted-foreground: oklch(71.3% 0 0);
      --color-accent: oklch(28.5% 0 0); --color-accent-foreground: oklch(98% 0 0);
      --color-destructive: oklch(52% 0.2 29.23); --color-border: oklch(28.5% 0 0);
      --color-input: oklch(28.5% 0 0); --color-ring: oklch(55.5% 0 0);
    }
    --radius: 0.625rem;
  }
}
`;

const NATIVEWIND_THEME = `/* Moe UI theme */
@theme {
  --color-background: oklch(100% 0 0); --color-foreground: oklch(14.5% 0 0);
  --color-card: oklch(100% 0 0); --color-card-foreground: oklch(14.5% 0 0);
  --color-popover: oklch(100% 0 0); --color-popover-foreground: oklch(14.5% 0 0);
  --color-primary: oklch(20.5% 0 0); --color-primary-foreground: oklch(98% 0 0);
  --color-secondary: oklch(96.7% 0 0); --color-secondary-foreground: oklch(20.5% 0 0);
  --color-muted: oklch(96.7% 0 0); --color-muted-foreground: oklch(55.5% 0 0);
  --color-accent: oklch(96.7% 0 0); --color-accent-foreground: oklch(20.5% 0 0);
  --color-destructive: oklch(55% 0.22 29.23); --color-border: oklch(91.7% 0 0);
  --color-input: oklch(91.7% 0 0); --color-ring: oklch(69.4% 0 0);
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
}

@layer theme {
  :root { --radius: 0.625rem; }
  .dark {
    --color-background: oklch(14.5% 0 0); --color-foreground: oklch(98% 0 0);
    --color-card: oklch(14.5% 0 0); --color-card-foreground: oklch(98% 0 0);
    --color-popover: oklch(14.5% 0 0); --color-popover-foreground: oklch(98% 0 0);
    --color-primary: oklch(98% 0 0); --color-primary-foreground: oklch(20.5% 0 0);
    --color-secondary: oklch(28.5% 0 0); --color-secondary-foreground: oklch(98% 0 0);
    --color-muted: oklch(28.5% 0 0); --color-muted-foreground: oklch(71.3% 0 0);
    --color-accent: oklch(28.5% 0 0); --color-accent-foreground: oklch(98% 0 0);
    --color-destructive: oklch(52% 0.2 29.23); --color-border: oklch(28.5% 0 0);
    --color-input: oklch(28.5% 0 0); --color-ring: oklch(55.5% 0 0);
  }
}
`;

function ensureUniwindCss(content: string) {
  const body = content
    .replace(/^\s*@import\s+["']tailwindcss["'];?\s*$/gm, "")
    .replace(/^\s*@import\s+["']uniwind["'];?\s*$/gm, "")
    .replace(/^\s*@import\s+["']tw-animate-css["'];?\s*$/gm, "")
    .trimStart();
  const theme =
    body.includes("--color-background") || body.includes("/* Moe UI theme */")
      ? ""
      : `\n${UNIWIND_THEME}`;
  return `@import "tailwindcss";\n@import "uniwind";\n@import "tw-animate-css";\n\n${body}${theme}`;
}

function ensureNativewindCss(content: string) {
  const body = content
    .replace(
      /^\s*@import\s+["'](?:tailwindcss|tailwindcss\/theme\.css|tailwindcss\/preflight\.css|tailwindcss\/utilities\.css|nativewind\/theme|uniwind|tw-animate-css)["'](?:\s+layer\([^)]+\))?;?\s*$/gm,
      "",
    )
    .replace(/^\s*@tailwind\s+(?:base|components|utilities);?\s*$/gm, "")
    .trimStart();
  const theme = body.includes("/* Moe UI theme */")
    ? ""
    : `\n${NATIVEWIND_THEME}`;
  return `@import "tailwindcss/theme.css" layer(theme);\n@import "tailwindcss/preflight.css" layer(base);\n@import "tailwindcss/utilities.css";\n@import "nativewind/theme";\n@import "tw-animate-css";\n\n${body}${theme}`;
}

function ensureNativewindPostcss(content: string | undefined) {
  if (content === undefined)
    return `const config = { plugins: { "@tailwindcss/postcss": {} } };\nexport default config;\n`;
  const compact = content
    .replaceAll("'", '"')
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "")
    .replace(/\s+/g, "")
    .replace(/;/g, "")
    .replace(/,}/g, "}");
  const canonical = new Set([
    'constconfig={plugins:{"@tailwindcss/postcss":{}}}exportdefaultconfig',
    'module.exports={plugins:{"@tailwindcss/postcss":{}}}',
    "constconfig={plugins:{tailwindcss:{}}}exportdefaultconfig",
    "module.exports={plugins:{tailwindcss:{}}}",
  ]);
  if (canonical.has(compact)) {
    return content.includes("@tailwindcss/postcss")
      ? content
      : content.replace("tailwindcss", "@tailwindcss/postcss");
  }
  throw new Error(
    "Unsupported PostCSS config for NativeWind. Use the canonical Tailwind plugin configuration and run init again.",
  );
}

function addCssImport(content: string, importPath: string) {
  const statement = `import "${importPath}";`;
  if (
    content.includes(statement) ||
    content.includes(`import '${importPath}';`)
  )
    return content;
  return `${statement}\n${content}`;
}

function addHydrationSuppression(content: string) {
  if (content.includes("suppressHydrationWarning")) return content;
  if (!content.includes("<html"))
    throw new Error("Root layout does not contain an <html> element.");
  return content.replace(/<html(\s|>)/, "<html suppressHydrationWarning$1");
}

async function findNextConfig(cwd: string) {
  for (const name of ["next.config.ts", "next.config.mjs", "next.config.js"]) {
    const file = path.join(cwd, name);
    if (await exists(file)) return file;
  }
  throw new Error(
    "No next.config.ts, next.config.mjs, or next.config.js was found.",
  );
}

async function findOptionalConfig(cwd: string, names: string[]) {
  for (const name of names) {
    const file = path.join(cwd, name);
    if (await exists(file)) return file;
  }
  return undefined;
}

async function findExpoEntry(cwd: string) {
  for (const name of [
    "src/app/_layout.tsx",
    "app/_layout.tsx",
    "App.tsx",
    "src/App.tsx",
  ]) {
    const file = path.join(cwd, name);
    if (await exists(file)) return { file, relative: name };
  }
  throw new Error(
    "Expected an Expo Router _layout.tsx or conventional App.tsx entry file.",
  );
}

function relativeImport(fromFile: string, targetFile: string) {
  let value = path
    .relative(path.dirname(fromFile), targetFile)
    .replaceAll(path.sep, "/");
  if (!value.startsWith(".")) value = `./${value}`;
  return value;
}

async function assertGeneratedFiles(planned: PlannedFile[]) {
  for (const output of planned) {
    if (!output.generated || !(await exists(output.file))) continue;
    if ((await readFile(output.file, "utf8")) !== output.content) {
      throw new Error(
        `Existing ${path.basename(output.file)} contains local changes. Reconcile it before running init.`,
      );
    }
  }
}

async function writePlannedFiles(planned: PlannedFile[]) {
  await Promise.all(
    planned.map(async (output) => {
      if (output.skipIfExists && (await exists(output.file))) return;
      await mkdir(path.dirname(output.file), { recursive: true });
      await writeFile(output.file, output.content);
    }),
  );
}

async function planNextInitialization(
  cwd: string,
  styling: StylingEngine,
  existing: ComponentsConfig | undefined,
  legacy: boolean,
) {
  const usesSrc = await exists(path.join(cwd, "src/app/layout.tsx"));
  const appRoot = usesSrc ? "src/app" : "app";
  const layoutFile = path.join(cwd, appRoot, "layout.tsx");
  const cssRelative = existing?.paths.css ?? `${appRoot}/globals.css`;
  const cssFile = path.join(cwd, cssRelative);
  const nextConfigFile = await findNextConfig(cwd);
  if (!(await exists(layoutFile)) || !(await exists(cssFile)))
    throw new Error("Expected an App Router layout.tsx and globals.css file.");
  const [nextConfig, layout, css] = await Promise.all([
    readFile(nextConfigFile, "utf8"),
    readFile(layoutFile, "utf8"),
    readFile(cssFile, "utf8"),
  ]);
  const prefix = usesSrc ? "src/" : "";
  const paths = existing?.paths ?? {
    components: `${prefix}components`,
    lib: `${prefix}lib`,
    css: cssRelative,
  };
  const generatedFiles: PlannedFile[] = [
    {
      file: path.join(cwd, "moe-ui.next.ts"),
      content: nextHelperSource(cssRelative, styling),
      generated: true,
    },
    {
      file: path.join(cwd, "moe-ui.reanimated.web.tsx"),
      content: reanimatedWebSource(),
      generated: true,
    },
    {
      file: path.join(cwd, "moe-ui.screens.web.tsx"),
      content: screensWebSource(),
      generated: true,
    },
    {
      file: path.join(cwd, paths.lib, "moe-ui-styling.ts"),
      content: stylingAdapterSource(styling),
      generated: true,
    },
    {
      file: path.join(cwd, "moe-ui.react-native-web.d.ts"),
      content: 'declare module "react-native-web";\n',
      generated: true,
    },
  ];
  const mutations: PlannedFile[] = [
    { file: nextConfigFile, content: transformNextConfig(nextConfig) },
    { file: layoutFile, content: addHydrationSuppression(layout) },
    {
      file: cssFile,
      content:
        styling === "uniwind"
          ? ensureUniwindCss(css)
          : ensureNativewindCss(css),
    },
  ];
  if (styling === "uniwind") {
    generatedFiles.push(
      {
        file: path.join(cwd, "moe-ui.react-native.web.ts"),
        content: reactNativeWebSource(),
        generated: true,
      },
      {
        file: path.join(cwd, "uniwind-types.d.ts"),
        content: '/// <reference types="uniwind/types" />\n',
        skipIfExists: true,
      },
    );
  } else {
    const postcssFile =
      (await findOptionalConfig(cwd, [
        "postcss.config.mjs",
        "postcss.config.js",
        "postcss.config.cjs",
      ])) ?? path.join(cwd, "postcss.config.mjs");
    const postcss = (await exists(postcssFile))
      ? await readFile(postcssFile, "utf8")
      : undefined;
    generatedFiles.push({
      file: path.join(cwd, "nativewind-env.d.ts"),
      content: '/// <reference types="react-native-css/types" />\n',
      generated: true,
    });
    mutations.push({
      file: postcssFile,
      content: ensureNativewindPostcss(postcss),
    });
  }
  if (legacy) {
    for (const output of generatedFiles) {
      if (
        path.basename(output.file) !== "moe-ui-styling.ts" &&
        (await exists(output.file))
      ) {
        output.content = await readFile(output.file, "utf8");
      }
    }
  }
  return { paths, mutations, generatedFiles };
}

async function planExpoInitialization(
  cwd: string,
  styling: StylingEngine,
  existing: ComponentsConfig | undefined,
  projectType: ProjectPackage["type"],
) {
  const entry = await findExpoEntry(cwd);
  const cssRelative = existing?.paths.css ?? "global.css";
  const cssFile = path.join(cwd, cssRelative);
  const css = (await exists(cssFile)) ? await readFile(cssFile, "utf8") : "";
  const metroFile =
    (await findOptionalConfig(cwd, ["metro.config.js", "metro.config.cjs"])) ??
    path.join(
      cwd,
      projectType === "module" ? "metro.config.cjs" : "metro.config.js",
    );
  const metro = (await exists(metroFile))
    ? transformMetroConfig(await readFile(metroFile, "utf8"))
    : defaultMetroConfig();
  const prefix = entry.relative.startsWith("src/") ? "src/" : "";
  const paths = existing?.paths ?? {
    components: `${prefix}components`,
    lib: `${prefix}lib`,
    css: cssRelative,
  };
  const mutations: PlannedFile[] = [
    {
      file: entry.file,
      content: addCssImport(
        await readFile(entry.file, "utf8"),
        relativeImport(entry.file, cssFile),
      ),
    },
    {
      file: cssFile,
      content:
        styling === "uniwind"
          ? ensureUniwindCss(css)
          : ensureNativewindCss(css),
    },
    { file: metroFile, content: metro },
  ];
  const generatedFiles: PlannedFile[] = [
    {
      file: path.join(cwd, "moe-ui.metro.cjs"),
      content: metroHelperSource(styling, cssRelative),
      generated: true,
    },
    {
      file: path.join(cwd, paths.lib, "moe-ui-styling.ts"),
      content: stylingAdapterSource(styling),
      generated: true,
    },
  ];
  if (styling === "uniwind") {
    generatedFiles.push({
      file: path.join(cwd, "uniwind-types.d.ts"),
      content: '/// <reference types="uniwind/types" />\n',
      skipIfExists: true,
    });
  } else {
    const postcssFile =
      (await findOptionalConfig(cwd, [
        "postcss.config.mjs",
        "postcss.config.js",
        "postcss.config.cjs",
      ])) ?? path.join(cwd, "postcss.config.mjs");
    const postcss = (await exists(postcssFile))
      ? await readFile(postcssFile, "utf8")
      : undefined;
    generatedFiles.push({
      file: path.join(cwd, "nativewind-env.d.ts"),
      content: '/// <reference types="react-native-css/types" />\n',
      generated: true,
    });
    mutations.push({
      file: postcssFile,
      content: ensureNativewindPostcss(postcss),
    });
  }
  return { paths, mutations, generatedFiles };
}

export async function initProject(options: CliOptions) {
  const cwd = path.resolve(options.cwd);
  const projectPackage = await readProjectPackage(cwd);
  const framework = detectFramework(projectPackage);
  if (!(await exists(path.join(cwd, "tsconfig.json"))))
    throw new Error("Moe UI requires TypeScript.");
  const existingState = await readExistingConfig(cwd);
  const existing = existingState?.config;
  if (existing && existing.framework !== framework) {
    throw new Error(
      `components.json targets ${existing.framework}, but this package was detected as ${framework}.`,
    );
  }
  const styling = await selectStyling(options, existing);
  const registry = await selectRegistry(options, existing);
  const manager = options.packageManager ?? (await detectPackageManager(cwd));
  const plan =
    framework === "next"
      ? await planNextInitialization(
          cwd,
          styling,
          existing,
          existingState?.legacy ?? false,
        )
      : await planExpoInitialization(
          cwd,
          styling,
          existing,
          projectPackage.type,
        );
  const config: ComponentsConfig = {
    $schema: "https://moe-ui-docs.vercel.app/schema/components.json",
    schemaVersion: 2,
    registry,
    typescript: true,
    framework,
    styling,
    paths: plan.paths,
  };
  await assertGeneratedFiles(plan.generatedFiles);
  if (options.install) {
    const dependencies = dependenciesFor(framework, styling);
    if (framework === "expo")
      await installExpoDependencies(cwd, manager, dependencies);
    else await installDependencies(cwd, manager, dependencies);
  }
  await writePlannedFiles([...plan.mutations, ...plan.generatedFiles]);
  await writeFile(
    path.join(cwd, "components.json"),
    `${JSON.stringify(config, null, 2)}\n`,
  );
  return config;
}

export function validateRegistryItem(value: unknown): RegistryItem {
  if (!value || typeof value !== "object")
    throw new Error("Registry response is not an object.");
  const item = value as Partial<RegistryItem>;
  if (
    item.schemaVersion !== 1 ||
    !item.name ||
    !Array.isArray(item.files) ||
    !Array.isArray(item.registryDependencies)
  ) {
    throw new Error("Registry item does not match schema version 1.");
  }
  if (
    !item.dependencies ||
    typeof item.dependencies !== "object" ||
    !item.integrity
  ) {
    throw new Error(
      "Registry item is missing dependency or integrity metadata.",
    );
  }
  return item as RegistryItem;
}

async function fetchItem(registry: string, name: string) {
  const response = await fetch(
    `${registry.replace(/\/$/, "")}/${encodeURIComponent(name)}.json`,
  );
  if (!response.ok)
    throw new Error(
      `Unable to fetch ${name}: ${response.status} ${response.statusText}`,
    );
  const item = validateRegistryItem(await response.json());
  for (const file of item.files) {
    const actual = `sha256-${createHash("sha256").update(file.content).digest("base64")}`;
    if (item.files.length === 1 && actual !== item.integrity)
      throw new Error(`Integrity check failed for ${name}.`);
  }
  return item;
}

function validateRegistryIndex(value: unknown): RegistryIndexItem[] {
  if (!value || typeof value !== "object")
    throw new Error("Registry index response is not an object.");
  const items = (value as { items?: unknown }).items;
  if (!Array.isArray(items))
    throw new Error("Registry index does not contain an items array.");
  return items.map((item) => {
    if (!item || typeof item !== "object")
      throw new Error("Registry index contains an invalid item.");
    const candidate = item as Partial<RegistryIndexItem>;
    if (
      typeof candidate.name !== "string" ||
      typeof candidate.title !== "string" ||
      typeof candidate.description !== "string" ||
      typeof candidate.category !== "string"
    ) {
      throw new Error("Registry index contains an invalid item.");
    }
    return candidate as RegistryIndexItem;
  });
}

async function fetchRegistryIndex(registry: string) {
  const response = await fetch(`${registry.replace(/\/$/, "")}/index.json`);
  if (!response.ok) {
    throw new Error(
      `Unable to fetch the registry index: ${response.status} ${response.statusText}`,
    );
  }
  return validateRegistryIndex(await response.json());
}

export function parseComponentSelection(
  answer: string,
  items: RegistryIndexItem[],
) {
  const tokens = answer
    .trim()
    .toLowerCase()
    .split(/[\s,]+/)
    .filter(Boolean);
  if (tokens.length === 0) {
    throw new Error("Select at least one component.");
  }
  if (tokens.includes("all")) return items.map((item) => item.name);

  const available = new Map(
    items.map((item) => [item.name.toLowerCase(), item]),
  );
  const selected: string[] = [];
  for (const token of tokens) {
    const numeric = /^\d+$/.test(token) ? Number(token) : undefined;
    const item = numeric ? items[numeric - 1] : available.get(token);
    if (!item) {
      throw new Error(
        `Unknown component selection: ${token}. Enter a listed number or component name.`,
      );
    }
    if (!selected.includes(item.name)) selected.push(item.name);
  }
  return selected;
}

async function selectComponents(options: CliOptions) {
  if (!interactiveTerminal()) {
    throw new Error("Add at least one component name.");
  }
  const configFile = path.join(path.resolve(options.cwd), "components.json");
  if (!(await exists(configFile)))
    throw new Error("Run `moe-ui init` before adding components.");
  const config = normalizeConfig(
    JSON.parse(await readFile(configFile, "utf8")),
  );
  const items = await fetchRegistryIndex(config.registry);
  const choices = items
    .map(
      (item, index) =>
        `  ${index + 1}. ${item.title} (${item.name}) — ${item.category}`,
    )
    .join("\n");
  const answer = await ask(
    `Choose components by number or name (comma-separated), or enter all:\n${choices}\nSelection: `,
  );
  return parseComponentSelection(answer, items);
}

async function resolveItems(registry: string, requested: string[]) {
  const items = new Map<string, RegistryItem>();
  const queue = [...requested];
  while (queue.length > 0) {
    const name = queue.shift();
    if (!name) continue;
    if (items.has(name)) continue;
    const item = await fetchItem(registry, name);
    items.set(name, item);
    queue.unshift(...item.registryDependencies);
  }
  return [...items.values()];
}

function targetPath(cwd: string, config: ComponentsConfig, target: string) {
  if (target.startsWith("components/")) {
    return path.join(
      cwd,
      config.paths.components,
      target.slice("components/".length),
    );
  }
  if (target.startsWith("lib/"))
    return path.join(cwd, config.paths.lib, target.slice("lib/".length));
  throw new Error(`Unsupported registry target: ${target}`);
}

async function confirmOverwrite(relativePath: string) {
  if (!interactiveTerminal())
    throw new Error(`${relativePath} already exists. Re-run with --overwrite.`);
  const answer = await ask(`Overwrite ${relativePath}? (y/N) `);
  if (!/^y(es)?$/i.test(answer.trim()))
    throw new Error(`Kept local changes in ${relativePath}.`);
}

export function registryDependenciesFor(
  _config: ComponentsConfig,
  items: RegistryItem[],
) {
  const dependencies = Object.assign(
    {},
    ...items.map((item) => item.dependencies),
  ) as Record<string, string>;
  if (dependencies["tailwind-merge"]) {
    dependencies["tailwind-merge"] = "^3.5.0";
  }
  if (dependencies["lucide-react-native"]) {
    dependencies["react-native-svg"] = "15.15.3";
  }
  return dependencies;
}

export async function addComponents(names: string[], options: CliOptions) {
  const cwd = path.resolve(options.cwd);
  const configFile = path.join(cwd, "components.json");
  if (!(await exists(configFile)))
    throw new Error("Run `moe-ui init` before adding components.");
  const config = normalizeConfig(
    JSON.parse(await readFile(configFile, "utf8")),
  );
  const adapterFile = path.join(cwd, config.paths.lib, "moe-ui-styling.ts");
  const items = await resolveItems(config.registry, names);
  const writes: Array<{ file: string; content: string }> = [];
  if (!(await exists(adapterFile))) {
    writes.push({
      file: adapterFile,
      content: stylingAdapterSource(config.styling),
    });
  }
  for (const item of items) {
    for (const registryFile of item.files) {
      const file = targetPath(cwd, config, registryFile.target);
      if (await exists(file)) {
        const current = await readFile(file, "utf8");
        if (current === registryFile.content) continue;
        if (!options.overwrite)
          await confirmOverwrite(path.relative(cwd, file));
      }
      writes.push({ file, content: registryFile.content });
    }
  }
  const dependencies = registryDependenciesFor(config, items);
  const manager = options.packageManager ?? (await detectPackageManager(cwd));
  if (options.install) {
    if (config.framework === "expo")
      await installExpoDependencies(cwd, manager, dependencies);
    else await installDependencies(cwd, manager, dependencies);
  }
  for (const write of writes) {
    await mkdir(path.dirname(write.file), { recursive: true });
    const temporary = `${write.file}.moe-ui-tmp`;
    await writeFile(temporary, write.content);
    await rename(temporary, write.file);
  }
  return {
    items: items.map((item) => item.name),
    files: writes.map((write) => write.file),
  };
}

export async function run(argv = process.argv.slice(2)) {
  const parsed = parseArguments(argv);
  const command =
    parsed.command === "interactive" ? await selectCommand() : parsed.command;
  if (command === "help") {
    console.log(usage());
    return;
  }
  if (command === "init") {
    const config = await initProject(parsed.options);
    console.log(
      `Moe UI initialized for ${config.framework} with ${config.styling}. Add a component with \`moe-ui add button\`.`,
    );
    return;
  }
  const components =
    parsed.components.length > 0
      ? parsed.components
      : await selectComponents(parsed.options);
  const result = await addComponents(components, parsed.options);
  console.log(`Installed ${result.items.join(", ")}.`);
}

const isEntry =
  process.argv[1] &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isEntry) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
