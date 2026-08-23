import { mkdir, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  addComponents,
  dependenciesFor,
  detectFramework,
  detectPackageManager,
  initProject,
  parseArguments,
  parseStylingSelection,
  registryDependenciesFor,
  validateRegistryItem,
} from "../src/index";

const temporaryDirectories: string[] = [];

async function temporaryDirectory() {
  const cwd = await import("node:fs/promises").then(({ mkdtemp }) =>
    mkdtemp(path.join(os.tmpdir(), "moe-ui-cli-")),
  );
  temporaryDirectories.push(cwd);
  await writeFile(path.join(cwd, "tsconfig.json"), "{}\n");
  await writeFile(path.join(cwd, "pnpm-lock.yaml"), "lockfileVersion: '9.0'\n");
  return cwd;
}

async function nextFixture() {
  const cwd = await temporaryDirectory();
  await mkdir(path.join(cwd, "app"), { recursive: true });
  await writeFile(
    path.join(cwd, "package.json"),
    JSON.stringify({ dependencies: { next: "16.1.6" } }),
  );
  await writeFile(
    path.join(cwd, "next.config.ts"),
    'import type { NextConfig } from "next";\nconst nextConfig: NextConfig = {};\nexport default nextConfig;\n',
  );
  await writeFile(
    path.join(cwd, "app/layout.tsx"),
    "export default function Layout({ children }) { return <html><body>{children}</body></html>; }\n",
  );
  await writeFile(
    path.join(cwd, "app/globals.css"),
    '@import "tailwindcss";\n',
  );
  return cwd;
}

async function expoFixture(router = true) {
  const cwd = await temporaryDirectory();
  await writeFile(
    path.join(cwd, "package.json"),
    JSON.stringify({ dependencies: { expo: "^55.0.0" } }),
  );
  if (router) {
    await mkdir(path.join(cwd, "app"), { recursive: true });
    await writeFile(
      path.join(cwd, "app/_layout.tsx"),
      "export default function Layout() { return null; }\n",
    );
  } else {
    await writeFile(
      path.join(cwd, "App.tsx"),
      "export default function App() { return null; }\n",
    );
  }
  return cwd;
}

function options(cwd: string, styling?: "uniwind" | "nativewind") {
  return {
    cwd,
    yes: styling === undefined,
    styling,
    overwrite: false,
    install: false,
    packageManager: "pnpm" as const,
  };
}

afterEach(async () => {
  vi.unstubAllGlobals();
  const { rm } = await import("node:fs/promises");
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { recursive: true, force: true })),
  );
});

describe("CLI arguments and detection", () => {
  it("parses styling and package-manager options", () => {
    expect(
      parseArguments([
        "init",
        "--styling",
        "nativewind",
        "--package-manager",
        "pnpm",
        "--no-install",
      ]).options,
    ).toMatchObject({
      styling: "nativewind",
      packageManager: "pnpm",
      install: false,
    });
    expect(
      parseArguments(["add", "button", "dialog", "--overwrite"]).components,
    ).toEqual(["button", "dialog"]);
  });

  it("rejects invalid styling usage, unknown commands, and empty add lists", () => {
    expect(() => parseArguments(["init", "--styling", "other"])).toThrow(
      "must be uniwind or nativewind",
    );
    expect(() =>
      parseArguments(["add", "button", "--styling", "uniwind"]),
    ).toThrow("only valid");
    expect(() => parseArguments(["nope"])).toThrow("Unknown command");
    expect(() => parseArguments(["add"])).toThrow("Add at least one");
  });

  it("maps the interactive numbered selection with Uniwind as the default", () => {
    expect(parseStylingSelection("")).toBe("uniwind");
    expect(parseStylingSelection("1")).toBe("uniwind");
    expect(parseStylingSelection("2")).toBe("nativewind");
    expect(() => parseStylingSelection("3")).toThrow("Invalid styling");
  });

  it("detects supported frameworks and rejects ambiguous packages", () => {
    expect(detectFramework({ dependencies: { next: "16" } })).toBe("next");
    expect(detectFramework({ devDependencies: { expo: "55" } })).toBe("expo");
    expect(() =>
      detectFramework({ dependencies: { next: "16", expo: "55" } }),
    ).toThrow("Both Next.js and Expo");
    expect(() => detectFramework({ dependencies: { react: "19" } })).toThrow(
      "Neither framework",
    );
  });

  it("selects the dependency line for all four framework combinations", () => {
    expect(dependenciesFor("next", "uniwind")).toMatchObject({
      uniwind: "^1.11.0",
      tailwindcss: "^4.1.18",
      "tailwind-merge": "^3.5.0",
      "uniwind-plugin-next": "1.4.2",
    });
    expect(dependenciesFor("expo", "uniwind")).not.toHaveProperty(
      "uniwind-plugin-next",
    );
    for (const framework of ["next", "expo"] as const) {
      expect(dependenciesFor(framework, "nativewind")).toMatchObject({
        nativewind: "^4.2.6",
        "react-native-css-interop": "0.2.6",
        tailwindcss: "^3.4.17",
        "tailwind-merge": "^2.6.1",
        "tailwindcss-animate": "^1.0.7",
      });
    }
  });

  it("requires an explicit choice outside a TTY unless --yes is used", async () => {
    const cwd = await nextFixture();
    await expect(
      initProject({
        cwd,
        yes: false,
        overwrite: false,
        install: false,
      }),
    ).rejects.toThrow("required in non-interactive mode");
  });
});

describe("project initialization", () => {
  it("configures Next.js with Uniwind idempotently", async () => {
    const cwd = await nextFixture();
    expect(await detectPackageManager(cwd)).toBe("pnpm");
    await initProject(options(cwd));
    await writeFile(
      path.join(cwd, "uniwind-types.d.ts"),
      '// generated by Uniwind\n/// <reference types="uniwind/types" />\n',
    );
    await initProject(options(cwd));

    expect(await readFile(path.join(cwd, "next.config.ts"), "utf8")).toContain(
      "withMoeUI(nextConfig)",
    );
    expect(await readFile(path.join(cwd, "app/layout.tsx"), "utf8")).toContain(
      "suppressHydrationWarning",
    );
    expect(await readFile(path.join(cwd, "app/globals.css"), "utf8")).toContain(
      '@import "uniwind"',
    );
    expect(await readFile(path.join(cwd, "app/globals.css"), "utf8")).toContain(
      "--color-ring",
    );
    expect(
      await readFile(path.join(cwd, "lib/moe-ui-styling.ts"), "utf8"),
    ).toContain("withUniwind");
    expect(
      JSON.parse(await readFile(path.join(cwd, "components.json"), "utf8")),
    ).toMatchObject({
      schemaVersion: 2,
      framework: "next",
      styling: "uniwind",
      typescript: true,
    });
  });

  it("configures Next.js with NativeWind and Tailwind 3", async () => {
    const cwd = await nextFixture();
    await writeFile(
      path.join(cwd, "postcss.config.mjs"),
      'const config = { plugins: { "@tailwindcss/postcss": {} } };\nexport default config;\n',
    );
    await initProject(options(cwd, "nativewind"));

    expect(await readFile(path.join(cwd, "tsconfig.json"), "utf8")).toContain(
      '"jsxImportSource": "nativewind"',
    );
    expect(
      await readFile(path.join(cwd, "postcss.config.mjs"), "utf8"),
    ).toContain("tailwindcss");
    expect(
      await readFile(path.join(cwd, "tailwind.config.cjs"), "utf8"),
    ).toContain('require("nativewind/preset")');
    expect(await readFile(path.join(cwd, "app/globals.css"), "utf8")).toContain(
      "--radius: 0.625rem",
    );
    expect(
      await readFile(path.join(cwd, "lib/moe-ui-styling.ts"), "utf8"),
    ).toContain("cssInterop");
    expect(
      JSON.parse(await readFile(path.join(cwd, "components.json"), "utf8")),
    ).toMatchObject({
      framework: "next",
      styling: "nativewind",
    });
  });

  it("configures Expo Router with Uniwind", async () => {
    const cwd = await expoFixture();
    await initProject(options(cwd, "uniwind"));

    expect(await readFile(path.join(cwd, "app/_layout.tsx"), "utf8")).toContain(
      'import "../global.css"',
    );
    expect(
      await readFile(path.join(cwd, "moe-ui.metro.cjs"), "utf8"),
    ).toContain("withUniwindConfig");
    expect(await readFile(path.join(cwd, "global.css"), "utf8")).toContain(
      '@import "uniwind"',
    );
    expect(
      JSON.parse(await readFile(path.join(cwd, "components.json"), "utf8")),
    ).toMatchObject({
      framework: "expo",
      styling: "uniwind",
    });
  });

  it("configures a conventional Expo app with NativeWind", async () => {
    const cwd = await expoFixture(false);
    await initProject(options(cwd, "nativewind"));

    expect(await readFile(path.join(cwd, "App.tsx"), "utf8")).toContain(
      'import "./global.css"',
    );
    expect(
      await readFile(path.join(cwd, "moe-ui.metro.cjs"), "utf8"),
    ).toContain("withNativeWind");
    expect(await readFile(path.join(cwd, "babel.config.js"), "utf8")).toContain(
      "nativewind/babel",
    );
    expect(
      await readFile(path.join(cwd, "nativewind-env.d.ts"), "utf8"),
    ).toContain("nativewind/types");
  });

  it("migrates schema v1 as Next.js with Uniwind", async () => {
    const cwd = await nextFixture();
    await writeFile(
      path.join(cwd, "moe-ui.next.ts"),
      "// legacy generated helper\n",
    );
    await writeFile(
      path.join(cwd, "components.json"),
      JSON.stringify({
        schemaVersion: 1,
        registry: "https://example.com/r",
        typescript: true,
        paths: { components: "components", lib: "lib", css: "app/globals.css" },
      }),
    );
    const config = await initProject(options(cwd));
    expect(config).toMatchObject({
      schemaVersion: 2,
      framework: "next",
      styling: "uniwind",
      registry: "https://example.com/r",
    });
    expect(await readFile(path.join(cwd, "moe-ui.next.ts"), "utf8")).toBe(
      "// legacy generated helper\n",
    );
  });

  it("locks the styling engine after initialization", async () => {
    const cwd = await nextFixture();
    await initProject(options(cwd));
    await expect(initProject(options(cwd, "nativewind"))).rejects.toThrow(
      "switching is not supported",
    );
  });

  it("preflights unsupported configuration without partial edits", async () => {
    const cwd = await nextFixture();
    await writeFile(
      path.join(cwd, "components.json"),
      JSON.stringify({ schemaVersion: 99 }),
    );
    await expect(initProject(options(cwd))).rejects.toThrow(
      "cannot be transformed safely",
    );
    expect(
      await readFile(path.join(cwd, "next.config.ts"), "utf8"),
    ).not.toContain("withMoeUI");
  });

  it("rejects a custom PostCSS setup before writing NativeWind files", async () => {
    const cwd = await nextFixture();
    const originalLayout = await readFile(
      path.join(cwd, "app/layout.tsx"),
      "utf8",
    );
    await writeFile(
      path.join(cwd, "postcss.config.mjs"),
      'const config = { plugins: { "@tailwindcss/postcss": {}, autoprefixer: {} } };\nexport default config;\n',
    );

    await expect(initProject(options(cwd, "nativewind"))).rejects.toThrow(
      "Unsupported PostCSS config",
    );
    expect(await readFile(path.join(cwd, "app/layout.tsx"), "utf8")).toBe(
      originalLayout,
    );
    await expect(
      readFile(path.join(cwd, "components.json"), "utf8"),
    ).rejects.toThrow();
  });

  it("uses CommonJS config files for Expo packages marked as modules", async () => {
    const cwd = await expoFixture(false);
    await writeFile(
      path.join(cwd, "package.json"),
      JSON.stringify({ type: "module", dependencies: { expo: "^55.0.0" } }),
    );
    await initProject(options(cwd, "nativewind"));

    expect(
      await readFile(path.join(cwd, "metro.config.cjs"), "utf8"),
    ).toContain("withMoeUI");
    expect(
      await readFile(path.join(cwd, "babel.config.cjs"), "utf8"),
    ).toContain("nativewind/babel");
  });
});

describe("registry installation", () => {
  const item = {
    schemaVersion: 1 as const,
    name: "button",
    title: "Button",
    description: "Button",
    category: "foundation",
    type: "registry:ui" as const,
    files: [
      {
        path: "components/ui/button.tsx",
        target: "components/ui/button.tsx",
        content: "export const Button = () => null;\n",
      },
    ],
    dependencies: {},
    registryDependencies: [],
    integrity: "sha256-EBCGwEqsBhLzSUi72HXE5yac0WG/UhGKiMJuLq/PWXU=",
  };

  it("uses the stored styling engine for merge compatibility and icon peers", () => {
    const nativeConfig = {
      $schema: "https://moe-ui.vercel.app/schema/components.json",
      schemaVersion: 2 as const,
      registry: "https://moe-ui.vercel.app/r",
      typescript: true as const,
      framework: "expo" as const,
      styling: "nativewind" as const,
      paths: { components: "components", lib: "lib", css: "global.css" },
    };
    const dependencies = registryDependenciesFor(nativeConfig, [
      {
        ...item,
        dependencies: {
          "tailwind-merge": "^3.5.0",
          "lucide-react-native": "0.563.0",
        },
      },
    ]);
    expect(dependencies).toMatchObject({
      "tailwind-merge": "^2.6.1",
      "react-native-svg": "15.15.3",
    });
  });

  it("validates schema and installs idempotently", async () => {
    const cwd = await nextFixture();
    await initProject(options(cwd));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(item), { status: 200 })),
    );
    await addComponents(["button"], options(cwd));
    const second = await addComponents(["button"], options(cwd));
    expect(second.files).toEqual([]);
    expect(validateRegistryItem(item).name).toBe("button");
  });

  it("surfaces network failures", async () => {
    const cwd = await nextFixture();
    await initProject(options(cwd));
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response("missing", { status: 404, statusText: "Not Found" }),
      ),
    );
    await expect(addComponents(["missing"], options(cwd))).rejects.toThrow(
      "Unable to fetch",
    );
  });

  it("resolves registry dependencies recursively", async () => {
    const cwd = await nextFixture();
    await initProject(options(cwd));
    const utilsContent = "export const cn = () => '';\n";
    const component = { ...item, registryDependencies: ["utils"] };
    const utils = {
      ...item,
      name: "utils",
      type: "registry:lib" as const,
      files: [
        { path: "lib/utils.ts", target: "lib/utils.ts", content: utilsContent },
      ],
      integrity: `sha256-${await import("node:crypto").then(({ createHash }) =>
        createHash("sha256").update(utilsContent).digest("base64"),
      )}`,
    };
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async (request: string | URL | Request) =>
          new Response(
            JSON.stringify(
              String(request).endsWith("utils.json") ? utils : component,
            ),
            {
              status: 200,
            },
          ),
      ),
    );
    const result = await addComponents(["button"], options(cwd));
    expect(result.items).toEqual(["button", "utils"]);
    expect(await readFile(path.join(cwd, "lib/utils.ts"), "utf8")).toBe(
      utilsContent,
    );
  });

  it("protects local changes unless overwrite is explicit", async () => {
    const cwd = await nextFixture();
    await initProject(options(cwd));
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(JSON.stringify(item), { status: 200 })),
    );
    await addComponents(["button"], options(cwd));
    const target = path.join(cwd, "components/ui/button.tsx");
    await writeFile(target, "// local change\n");
    await expect(addComponents(["button"], options(cwd))).rejects.toThrow(
      "--overwrite",
    );
    await addComponents(["button"], { ...options(cwd), overwrite: true });
    expect(await readFile(target, "utf8")).toBe(item.files[0].content);
  });
});
