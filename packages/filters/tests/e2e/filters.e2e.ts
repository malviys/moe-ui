/**
 * @moe-ui/filters E2E tests — Chromium, Firefox, WebKit
 *
 * Tests run against the minimal Vite app in e2e-app/ which renders the
 * ReactFilters component and exposes applied filters as JSON in a
 * `data-testid="output"` <pre> element.
 *
 * Scenarios:
 *   1. Initial render — Add filter button present, no chips
 *   2. Open / close composer
 *   3. Add a text filter (contains)
 *   4. Add a text filter with a different operator (starts_with)
 *   5. Add a select filter
 *   6. Add a multiselect filter (multiple values)
 *   7. Remove a filter chip
 *   8. Field search narrows the field list
 *   9. "No matching fields." shown for no-match search
 *  10. Operator selection
 *  11. Multiple filters sequential
 */

import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Navigate to the app and wait until the Add filter button is visible. */
async function gotoApp(page: Page) {
  await page.goto("/");
  await page.waitForSelector("text=Add filter");
}

/** Parse the JSON output element into an array of filter objects. */
async function getFilters(page: Page): Promise<Record<string, unknown>[]> {
  const text = await page.locator('[data-testid="output"]').innerText();
  return JSON.parse(text);
}

/** Click the "Add filter" button to open the composer. */
async function openComposer(page: Page) {
  await page.getByText("Add filter").click();
  // Wait for the field section header ("Field") to appear — exact match to avoid
  // matching "Search fields..." placeholder
  await page.waitForSelector("text=Field", { timeout: 5000 });
}

/**
 * Click a field button in the composer field list.
 * Using getByRole('button') with a name avoids matching text in other elements
 * (e.g. validation hint "\"Name\" expects a single value.").
 */
function fieldButton(page: Page, name: string) {
  // The field list items are rendered as clickable spans/divs. Use exact text match.
  return page.locator(`text="${name}"`).first();
}

// ---------------------------------------------------------------------------
// 1. Initial render
// ---------------------------------------------------------------------------

test("shows Add filter button and no chips on initial load", async ({ page }) => {
  await gotoApp(page);

  await expect(page.getByText("Add filter")).toBeVisible();

  // No chips should be present yet — output should be empty array
  const filters = await getFilters(page);
  expect(filters).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 2. Open / close composer
// ---------------------------------------------------------------------------

test("opens the composer and shows field list", async ({ page }) => {
  await gotoApp(page);
  await openComposer(page);

  // "Field" is the section header — match exactly to avoid "Search fields"
  await expect(page.getByText("Field", { exact: true })).toBeVisible();
  await expect(page.getByText("Name", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Category", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Tags", { exact: true }).first()).toBeVisible();
  await expect(page.getByText("Apply")).toBeVisible();
  await expect(page.getByText("Cancel")).toBeVisible();
});

test("Cancel closes the composer without adding a filter", async ({ page }) => {
  await gotoApp(page);
  await openComposer(page);

  await page.getByText("Cancel").click();

  // Composer should be closed — no "Field" section header
  await expect(page.getByText("Field", { exact: true })).not.toBeVisible();

  // No filters applied
  const filters = await getFilters(page);
  expect(filters).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 3. Add a text filter (default operator: contains)
// ---------------------------------------------------------------------------

test("adds a text filter with the default 'contains' operator", async ({ page }) => {
  await gotoApp(page);
  await openComposer(page);

  // Click the "Name" field in the field list (exact match, first occurrence)
  await page.getByText("Name", { exact: true }).first().click();

  // Fill in the value input (last textbox on the page; first may be the search)
  const inputs = page.getByRole("textbox");
  await inputs.last().fill("Laptop");

  await page.getByText("Apply").click();

  // Chip should appear in the toolbar
  await expect(page.getByText(/Name/).first()).toBeVisible();

  // Output should reflect the applied filter
  const filters = await getFilters(page);
  expect(filters).toHaveLength(1);
  expect(filters[0]!["field"]).toBe("name");
  expect(filters[0]!["operator"]).toBe("contains");
  expect((filters[0]!["values"] as string[])).toContain("Laptop");
});

// ---------------------------------------------------------------------------
// 4. Text filter with a different operator (starts with)
// ---------------------------------------------------------------------------

test("adds a text filter with 'starts with' operator", async ({ page }) => {
  await gotoApp(page);
  await openComposer(page);

  await page.getByText("Name", { exact: true }).first().click();
  await page.getByText("starts with").click();

  const inputs = page.getByRole("textbox");
  await inputs.last().fill("Pro");

  await page.getByText("Apply").click();

  const filters = await getFilters(page);
  expect(filters[0]!["operator"]).toBe("starts_with");
  expect((filters[0]!["values"] as string[])).toContain("Pro");
});

// ---------------------------------------------------------------------------
// 5. Add a select filter
// ---------------------------------------------------------------------------

test("adds a select filter by choosing a single option", async ({ page }) => {
  await gotoApp(page);
  await openComposer(page);

  await page.getByText("Category", { exact: true }).first().click();
  await page.getByText("Electronics").click();
  await page.getByText("Apply").click();

  await expect(page.getByText(/Category/).first()).toBeVisible();

  const filters = await getFilters(page);
  expect(filters[0]!["field"]).toBe("category");
  expect((filters[0]!["values"] as string[])).toContain("electronics");
});

// ---------------------------------------------------------------------------
// 6. Add a multiselect filter
// ---------------------------------------------------------------------------

test("adds a multiselect filter with multiple values", async ({ page }) => {
  await gotoApp(page);
  await openComposer(page);

  await page.getByText("Tags", { exact: true }).first().click();
  await page.getByText("Sale").click();
  await page.getByText("New").click();
  await page.getByText("Apply").click();

  const filters = await getFilters(page);
  expect(filters[0]!["field"]).toBe("tags");
  const values = filters[0]!["values"] as string[];
  expect(values).toContain("sale");
  expect(values).toContain("new");
});

test("deselects a multiselect value when clicked again", async ({ page }) => {
  await gotoApp(page);
  await openComposer(page);

  await page.getByText("Tags", { exact: true }).first().click();
  await page.getByText("Sale").click(); // select
  await page.getByText("Sale").click(); // deselect
  await page.getByText("New").click();
  await page.getByText("Apply").click();

  const filters = await getFilters(page);
  const values = filters[0]!["values"] as string[];
  expect(values).not.toContain("sale");
  expect(values).toContain("new");
});

// ---------------------------------------------------------------------------
// 7. Remove a filter chip
// ---------------------------------------------------------------------------

test("removes a filter chip when the × button is clicked", async ({ page }) => {
  await gotoApp(page);
  await openComposer(page);

  await page.getByText("Category", { exact: true }).first().click();
  await page.getByText("Clothing").click();
  await page.getByText("Apply").click();

  // Chip is now visible
  await expect(page.getByText(/Category/).first()).toBeVisible();

  // Click the × remove button
  await page.getByText("×").click();

  // Chip should be gone
  await expect(page.getByText(/Category is/)).not.toBeVisible();

  const filters = await getFilters(page);
  expect(filters).toHaveLength(0);
});

// ---------------------------------------------------------------------------
// 8. Field search narrows the list
// ---------------------------------------------------------------------------

test("field search input filters the field list", async ({ page }) => {
  await gotoApp(page);
  await openComposer(page);

  const searchInput = page.getByPlaceholder("Search fields...");
  await searchInput.fill("tag");

  await expect(page.getByText("Tags", { exact: true }).first()).toBeVisible();

  // After filtering, the "Name" and "Category" buttons should not be in the list.
  // Use a locator scoped to the field list section to avoid false positives.
  // The field list only renders items that match the search — we check that
  // those buttons are gone from the accessible button list.
  const fieldButtons = page.getByRole("button", { name: "Name" });
  await expect(fieldButtons).toHaveCount(0);

  const categoryButtons = page.getByRole("button", { name: "Category" });
  await expect(categoryButtons).toHaveCount(0);
});

// ---------------------------------------------------------------------------
// 9. No matching fields
// ---------------------------------------------------------------------------

test("shows 'No matching fields.' when search has no results", async ({ page }) => {
  await gotoApp(page);
  await openComposer(page);

  const searchInput = page.getByPlaceholder("Search fields...");
  await searchInput.fill("zzznomatch");

  await expect(page.getByText("No matching fields.")).toBeVisible();
});

// ---------------------------------------------------------------------------
// 10. Operator selection persists in output
// ---------------------------------------------------------------------------

test("operator selection is reflected in the output", async ({ page }) => {
  await gotoApp(page);
  await openComposer(page);

  await page.getByText("Name", { exact: true }).first().click();

  // Confirm all operators are visible
  for (const op of ["contains", "is", "starts with", "ends with", "is empty", "is not empty"]) {
    await expect(page.getByText(op, { exact: true }).first()).toBeVisible();
  }

  // Choose "ends with" and apply a value
  await page.getByText("ends with").click();
  const inputs = page.getByRole("textbox");
  await inputs.last().fill("Pro");
  await page.getByText("Apply").click();

  const filters = await getFilters(page);
  expect(filters[0]!["operator"]).toBe("ends_with");
});

// ---------------------------------------------------------------------------
// 11. Multiple filters can be added sequentially
// ---------------------------------------------------------------------------

test("multiple filters can be added and each gets its own chip", async ({ page }) => {
  await gotoApp(page);

  // Add first filter
  await openComposer(page);
  await page.getByText("Name", { exact: true }).first().click();
  await page.getByRole("textbox").last().fill("Alpha");
  await page.getByText("Apply").click();

  // Add second filter
  await page.getByText("Add filter").click();
  await page.waitForSelector("text=Field");
  await page.getByText("Category", { exact: true }).first().click();
  await page.getByText("Books").click();
  await page.getByText("Apply").click();

  const filters = await getFilters(page);
  expect(filters).toHaveLength(2);
  expect(filters.map((f) => f["field"])).toContain("name");
  expect(filters.map((f) => f["field"])).toContain("category");
});
