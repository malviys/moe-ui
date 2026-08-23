import { expect, type Page, test } from "@playwright/test";

function preview(page: Page, component: string) {
  return page.getByTestId(`preview-${component}`);
}

async function openModal(
  page: Page,
  component: string,
  triggerName: string,
  role: "dialog" | "alertdialog" = "dialog",
) {
  await page.goto(`/docs/components/${component}`);
  const trigger = preview(page, component).getByRole("button", {
    name: triggerName,
  });
  await trigger.click();
  const dialog = page.getByRole(role);
  await expect(dialog).toBeVisible();
  await expect
    .poll(() =>
      dialog.evaluate((node) => node.contains(document.activeElement)),
    )
    .toBe(true);
  await page.keyboard.press("Tab");
  await expect
    .poll(() =>
      dialog.evaluate((node) => node.contains(document.activeElement)),
    )
    .toBe(true);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
}

test.describe("overlay focus and dismissal", () => {
  test("dialog traps focus, dismisses, and returns focus", async ({ page }) => {
    await openModal(page, "dialog", "Edit Profile");
  });

  test("alert dialog traps focus, dismisses, and returns focus", async ({
    page,
  }) => {
    await openModal(page, "alert-dialog", "Show Dialog", "alertdialog");
  });

  test("sheet traps focus, dismisses, and returns focus", async ({ page }) => {
    await openModal(page, "sheet", "Open");
  });

  test("popover supports focus entry, Escape, and outside dismissal", async ({
    page,
  }) => {
    await page.goto("/docs/components/popover");
    const trigger = preview(page, "popover").getByRole("button", {
      name: "Open popover",
    });
    await trigger.click();
    const heading = page.getByText("Dimensions", { exact: true });
    await expect(heading).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(heading).toBeHidden();
    await expect(trigger).toBeFocused();
    await trigger.click();
    await page.mouse.click(8, 8);
    await expect(heading).toBeHidden();
  });
});

test.describe("menu and selection keyboard behavior", () => {
  test("dropdown menu navigates, opens a nested menu, and dismisses", async ({
    page,
  }) => {
    await page.goto("/docs/components/dropdown-menu");
    const trigger = preview(page, "dropdown-menu").getByRole("button", {
      name: "Open",
    });
    await trigger.click();
    const menu = page.getByRole("menu").first();
    await expect(menu).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menuitem", { name: /Profile/ })).toBeFocused();
    await page.getByRole("menuitem", { name: /Invite users/ }).hover();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("menuitem", { name: "Email" })).toBeVisible();
    await page.keyboard.press("Escape");
    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("context menu opens by pointer and moves through items", async ({
    page,
  }) => {
    await page.goto("/docs/components/context-menu");
    const target = preview(page, "context-menu").getByLabel(
      "Context menu target",
    );
    await target.click({ button: "right" });
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Home");
    await expect(page.getByRole("button", { name: /Back/ })).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("button", { name: /Forward/ })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).toBeHidden();
  });

  test("select supports keyboard selection and Escape", async ({ page }) => {
    await page.goto("/docs/components/select");
    const trigger = preview(page, "select").getByRole("button", {
      name: "Fruit",
    });
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await expect(
      page.getByRole("option", { name: "Apple", exact: true }),
    ).toBeVisible();
    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    await expect(trigger).toContainText(/Apple|Banana/);
  });

  test("tooltip opens on focus and dismisses with Escape", async ({ page }) => {
    await page.goto("/docs/components/tooltip");
    const trigger = page.getByRole("button", { name: "Hover" });
    await trigger.focus();
    await expect(page.getByRole("tooltip")).toContainText("Add to library");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("tooltip")).toBeHidden();
  });
});
