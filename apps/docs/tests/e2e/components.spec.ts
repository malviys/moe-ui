import AxeBuilder from "@axe-core/playwright";
import { expect, type Page, test } from "@playwright/test";
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

test.describe("component documentation matrix", () => {
  for (const component of webTestManifest) {
    test(`${component.name} renders, remains accessible, and captures responsive states`, async ({
      page,
    }, testInfo) => {
      await page.goto(component.route);
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
            await previewSection.scrollIntoViewIfNeeded();
            const screenshot = await previewSection.screenshot({
              animations: "disabled",
            });
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
