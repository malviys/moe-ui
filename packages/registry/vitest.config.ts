import { fileURLToPath } from "node:url";
import { transformWithEsbuild } from "vite";
import { defineConfig } from "vitest/config";

const primitive = (name: string, file: string) =>
  fileURLToPath(new URL(`./node_modules/@rn-primitives/${name}/dist/${file}`, import.meta.url));

export default defineConfig({
  plugins: [
    {
      name: "transform-rn-primitives-jsx",
      enforce: "pre",
      async transform(code, id) {
        if (!id.includes("@rn-primitives") || !/\.m?js$/.test(id)) return null;
        return transformWithEsbuild(code, id, { loader: "jsx", jsx: "automatic" });
      },
    },
  ],
  resolve: {
    alias: {
      "@rn-primitives/checkbox": primitive("checkbox", "checkbox.web.mjs"),
      "@rn-primitives/slot": primitive("slot", "index.mjs"),
      "@rn-primitives/tabs": primitive("tabs", "tabs.web.mjs"),
      "lucide-react-native": fileURLToPath(new URL("./tests/mocks/lucide.tsx", import.meta.url)),
      "react-native": fileURLToPath(
        new URL("./node_modules/react-native-web/dist/index.js", import.meta.url),
      ),
    },
    extensions: [".web.tsx", ".web.ts", ".tsx", ".ts", ".jsx", ".js"],
  },
  ssr: {
    noExternal: [/^@rn-primitives\//, "react-native-web", "uniwind"],
  },
  test: {
    deps: {
      optimizer: {
        client: {
          enabled: true,
          include: ["@rn-primitives/checkbox", "@rn-primitives/slot", "@rn-primitives/tabs"],
          esbuildOptions: { loader: { ".js": "jsx", ".mjs": "jsx" } },
        },
      },
    },
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    server: {
      deps: {
        inline: [/^@rn-primitives\//],
      },
    },
  },
});
