import { expect, test } from "@playwright/test";
import { components } from "../../lib/registry";

test.describe("documentation experience", () => {
  test("catalog is generated from the registry and the legacy route redirects", async ({
    page,
  }) => {
    await page.goto("/docs/component-list");
    await expect(page).toHaveURL(/\/docs\/components$/);
    await expect(
      page.getByRole("heading", { name: "Components" }),
    ).toBeVisible();
    await expect(page.locator(".catalog-card")).toHaveCount(components.length);
    await expect(
      page.locator('.catalog-card[href="/docs/components/button"]'),
    ).toBeVisible();
  });

  test("component examples expose keyboard tabs and the actual example source", async ({
    page,
  }) => {
    await page.goto("/docs/components/button");
    const preview = page.getByTestId("preview-button");
    const previewTab = preview.getByRole("tab", { name: "Preview" });
    const codeTab = preview.getByRole("tab", { name: "Code" });

    await expect(previewTab).toHaveAttribute("aria-selected", "true");
    await previewTab.focus();
    await page.keyboard.press("ArrowRight");
    await expect(codeTab).toBeFocused();
    await expect(codeTab).toHaveAttribute("aria-selected", "true");
    await expect(preview.getByRole("tabpanel")).toContainText(
      "import { Button }",
    );
  });

  test("package-manager choice persists between component pages", async ({
    page,
  }) => {
    await page.goto("/docs/components/button");
    const install = page.getByTestId("install-source-button");
    await install.getByRole("button", { name: "bun" }).click();
    await expect(
      install.getByText("bunx @moe-ui/cli@beta add button"),
    ).toBeVisible();

    await page.goto("/docs/components/dialog");
    await expect(
      page
        .getByTestId("install-source-dialog")
        .getByText("bunx @moe-ui/cli@beta add dialog"),
    ).toBeVisible();
    await expect
      .poll(() =>
        page.evaluate(() =>
          localStorage.getItem("moe-ui-docs-package-manager"),
        ),
      )
      .toBe("bun");
  });

  test("mobile docs navigation remains usable without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/docs/components/button");
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);

    const sidebarTrigger = page.getByRole("button", { name: "Open Sidebar" });
    await sidebarTrigger.click();
    const drawer = page.locator("#nd-sidebar-mobile");
    await expect(drawer).toBeVisible();
    await expect(
      drawer.getByText("Components", { exact: true }).first(),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(sidebarTrigger).toBeFocused();
  });

  test("global search traps focus and restores it to the trigger", async ({
    page,
  }) => {
    await page.goto("/");
    const searchTrigger = page.locator("button[data-search-full]");
    await searchTrigger.click();

    const searchDialog = page.getByRole("dialog", { name: "Search" });
    const searchInput = searchDialog.getByPlaceholder("Search");
    await expect(searchInput).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(searchDialog).toContainText("ESC");
    await expect
      .poll(() =>
        searchDialog.evaluate((dialog) =>
          dialog.contains(document.activeElement),
        ),
      )
      .toBe(true);
    await page.keyboard.press("Escape");

    await expect(searchDialog).toBeHidden();
    await expect(searchTrigger).toBeFocused();
  });

  test("reduced motion disables homepage transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");

    const primaryAction = page.getByRole("link", { name: "Get started" });
    await expect(primaryAction).toBeVisible();
    const motion = await primaryAction.evaluate((node) => ({
      reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
      transitionDuration: getComputedStyle(node).transitionDuration,
    }));

    expect(motion.reduced).toBe(true);
    expect(Number.parseFloat(motion.transitionDuration)).toBeLessThan(0.001);
  });
});
