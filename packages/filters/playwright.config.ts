import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for @moe-ui/filters E2E tests.
 *
 * The minimal Vite app lives in e2e-app/ and is served via `vite e2e-app`.
 * Playwright starts it automatically before running the tests.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.e2e.ts",

  /* Fail fast in CI, full output locally */
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: "list",

  use: {
    /* Base URL for the local Vite dev server */
    baseURL: "http://127.0.0.1:5174",

    /* Collect trace only on failure for debugging */
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  /* Start the Vite dev server automatically before tests */
  webServer: {
    command:
      "bunx vite e2e-app --config e2e-app/vite.config.ts --host 127.0.0.1",
    url: "http://127.0.0.1:5174",
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
