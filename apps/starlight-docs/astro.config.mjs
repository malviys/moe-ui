// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import tailwindcss from "@tailwindcss/vite";
import { rnw } from "vite-plugin-rnw";
import { uniwind } from "uniwind/vite";
import { remarkDocGen, fileGenerator } from "fumadocs-docgen";

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Moe UI",
      customCss: ["./src/styles/global.css"],
      head: [
        {
          tag: "link",
          attrs: {
            rel: "preconnect",
            href: "https://fonts.googleapis.com",
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossorigin: true,
          },
        },
        {
          tag: "link",
          attrs: {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap",
          },
        },
      ],
      plugins: [],
      components: {
        Hero: "./src/components/Hero.astro",
      },
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/moe-ui/moe-ui",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "introduction" },
            { label: "Installation", slug: "installation" },
            { label: "CLI", slug: "cli" },
          ],
        },
        {
          label: "Components",
          autogenerate: { directory: "components" },
        },
        {
          label: "Resources",
          items: [
            { label: "Changelog", slug: "changelog" },
            { label: "Registry", slug: "registry" },
          ],
        },
      ],
    }),
    react(),
    mdx({
      remarkPlugins: [[remarkDocGen, { generators: [fileGenerator()] }]],
    }),
  ],
  vite: {
    ssr: {
      external: [
        "react-native",
        "react-native-web",
        "@moe/registry",
        "lucide-react-native",
        "react-native-reanimated",
        "react-native-safe-area-context",
        "react-native-svg",
      ],
    },
    resolve: {
      alias: {
        "@": new URL("./src", import.meta.url).pathname,
        "@moe/registry": new URL("../../packages/registry/src", import.meta.url)
          .pathname,
      },
    },
    plugins: [
      rnw().filter((plugin) => !Array.isArray(plugin)),
      tailwindcss(),
      uniwind({
        cssEntryFile: "./src/styles/global.css",
        dtsFile: "./uniwind-types.d.ts",
      }),
    ],
  },
});
