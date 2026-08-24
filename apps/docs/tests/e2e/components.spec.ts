import AxeBuilder from "@axe-core/playwright";
import { expect, type Locator, type Page, test } from "@playwright/test";
import {
  themes,
  viewports,
  webTestManifest,
} from "../../lib/web-test-manifest";

const viewportSizes = {
  desktop: { width: 1440, height: 1000 },
  narrow: { width: 390, height: 844 },
} as const;

async function setTheme(page: Page, theme: "light" | "dark") {
  await page.evaluate((nextTheme: string) => {
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
  }, theme);
}

async function capturePreviewScreenshot(previewSection: Locator) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await expect(previewSection).toBeAttached();
      return await previewSection.screenshot({ animations: "disabled" });
    } catch (error) {
      const isTransientDetachment =
        error instanceof Error &&
        error.message.includes("Element is not attached to the DOM");

      if (!isTransientDetachment || attempt === 2) {
        throw error;
      }
    }
  }

  throw new Error("Unable to capture the preview screenshot");
}

test.describe("component documentation matrix", () => {
  for (const component of webTestManifest) {
    test(`${component.name} renders, remains accessible, and captures responsive states`, async ({
      page,
    }, testInfo) => {
      testInfo.setTimeout(
        testInfo.timeout + component.previewVariants.length * 15_000,
      );
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(component.route);
      await page.waitForLoadState("networkidle");
      const preview = page.locator(component.selector);
      await expect(preview).toBeVisible();
      for (const variant of component.previewVariants) {
        await expect(
          page.locator(
            `${component.previewSelector}[data-preview-variant="${variant.id}"]`,
          ),
        ).toBeVisible();
      }
      await expect(
        page.locator(`[data-testid="release-info-${component.name}"]`),
      ).toBeVisible();
      await expect(
        page.locator(`[data-testid="web-beta-status-${component.name}"]`),
      ).toBeVisible();
      expect(
        await page
          .locator(
            `[data-testid="web-beta-status-${component.name}"], [data-testid="install-source-${component.name}"]`,
          )
          .evaluateAll((elements) =>
            elements.map((element) => element.getAttribute("data-testid")),
          ),
      ).toEqual([
        `web-beta-status-${component.name}`,
        `install-source-${component.name}`,
      ]);

      if (component.name === "checkbox") {
        await expect(
          page.locator(`${component.previewSelector} [aria-checked]`),
        ).toHaveAttribute("role", "checkbox");
      }

      const accessibility = await new AxeBuilder({ page })
        .include(component.previewSelector)
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(accessibility.violations).toEqual([]);

      for (const viewport of viewports) {
        await page.setViewportSize(viewportSizes[viewport]);
        for (const theme of themes) {
          await setTheme(page, theme);
          const previewSections = page.locator(component.previewSelector);
          for (
            let index = 0;
            index < (await previewSections.count());
            index++
          ) {
            const previewSection = previewSections.nth(index);
            const screenshot = await capturePreviewScreenshot(previewSection);
            const variant = component.previewVariants[index];
            await testInfo.attach(
              `${component.name}-${variant?.id ?? "default"}-${viewport}-${theme}`,
              {
                body: screenshot,
                contentType: "image/png",
              },
            );
          }
        }
      }
    });
  }
});
