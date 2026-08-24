import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

export default defineConfig([
  ...nextVitals,
  ...nextTypescript,
  {
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  prettier,
  globalIgnores([
    "**/.next/**",
    "**/.open-next/**",
    "**/.source/**",
    "**/.turbo/**",
    "**/coverage/**",
    "**/dist/**",
    "**/out/**",
    "**/playwright-report/**",
    "**/test-results/**",
    "apps/docs/content/docs/components/**",
    "apps/docs/public/r/**",
    "apps/docs/public/schema/**",
  ]),
]);
