import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [react(), vue()],
  test: {
    name: "filters-component",
    include: ["tests/react/**/*.test.{ts,tsx}", "tests/vue/**/*.test.{ts,tsx}"],
    environment: "jsdom",
    globals: true,
    pool: "vmForks",
    setupFiles: ["./tests/vitest.setup.ts"],
  },
});
