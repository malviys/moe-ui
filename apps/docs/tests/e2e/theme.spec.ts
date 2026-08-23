import { expect, test } from "@playwright/test";

const storageKey = "moe-ui-docs-theme";

test.describe("documentation themes", () => {
  test("light and dark preferences persist across docs and home", async ({
    page,
  }) => {
    await page.addInitScript((key) => {
      if (window.localStorage.getItem(key) === null) {
        window.localStorage.setItem(key, "light");
      }
    }, storageKey);
    await page.goto("/docs/components/button");

    const root = page.locator("html");
    const lightControl = page.locator('button[aria-label="light"]:visible');
    const darkControl = page.locator('button[aria-label="dark"]:visible');
    const systemControl = page.locator('button[aria-label="system"]:visible');

    await expect(lightControl).toBeVisible();
    await expect(darkControl).toBeVisible();
    await expect(systemControl).toBeVisible();
    await expect(root).toHaveClass(/light/);

    await darkControl.click();
    await expect(root).toHaveClass(/dark/);
    await expect(root).toHaveCSS("color-scheme", "dark");
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), storageKey))
      .toBe("dark");

    await page.reload();
    await expect(root).toHaveClass(/dark/);
    await page.goto("/");
    await expect(root).toHaveClass(/dark/);

    await page.locator('button[aria-label="light"]:visible').click();
    await expect(root).toHaveClass(/light/);
    await expect(root).toHaveCSS("color-scheme", "light");
    await expect
      .poll(() => page.evaluate((key) => localStorage.getItem(key), storageKey))
      .toBe("light");
  });
});
