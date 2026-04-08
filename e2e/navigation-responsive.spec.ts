/** P1 — header vs mobile drawer; ensures no duplicate primary Cart link. See docs/frontend/TESTING.md */
import { test, expect } from "@playwright/test";

test.describe("responsive navigation (desktop)", () => {
  test.use({ viewport: { width: 1280, height: 720 } });

  test("toolbar cart is the only cart link in header; hamburger hidden", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeHidden();
    await expect(page.locator("header").getByRole("link", { name: /Cart \(\s*\d+\s*\)/ })).toHaveCount(1);
    await expect(
      page.getByRole("navigation", { name: "Primary navigation" }).getByRole("link", { name: /^Cart$/ }),
    ).toHaveCount(0);
  });
});

test.describe("responsive navigation (mobile)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("drawer holds shop links and cart; primary horizontal nav hidden", async ({ page }) => {
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toBeHidden();
    await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();

    await page.getByRole("button", { name: "Open navigation menu" }).click();
    const closeDrawer = page.getByRole("button", { name: "Close" });
    await expect(closeDrawer).toBeVisible({ timeout: 15_000 });
    const mobileNav = page.getByRole("navigation", { name: "Mobile menu" });
    await expect(mobileNav.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(page.getByRole("link", { name: /Cart \(\s*\d+\s*\)/ })).toHaveCount(1);

    await closeDrawer.click();
    await expect(closeDrawer).toBeHidden({ timeout: 10_000 });
  });
});
