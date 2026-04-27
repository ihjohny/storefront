/** P1 — offline navigation & callback shells. Core buying path is P0 (catalog-live + checkout-happy-path-live). */
import { test, expect } from "@playwright/test";

/**
 * Offline-tolerant route coverage: shells and redirects without a live API.
 */
test.describe("navigation happy path (offline-tolerant)", () => {
  test("checkout callback pages render", async ({ page }) => {
    await page.goto("/en/checkout/success");
    await expect(page.getByRole("heading", { name: "Payment successful", level: 1 })).toBeVisible();

    await page.goto("/en/checkout/cancel");
    await expect(page.getByRole("heading", { name: "Payment cancelled", level: 1 })).toBeVisible();

    await page.goto("/en/checkout/failed");
    await expect(page.getByRole("heading", { name: "Payment failed", level: 1 })).toBeVisible();
  });

  test("verify-email page handles missing token", async ({ page }) => {
    await page.goto("/en/auth/verify-email");
    await expect(page.getByRole("heading", { name: "Verification failed", level: 1 })).toBeVisible();
  });

  test("account area redirects unauthenticated users to login", async ({ page }) => {
    await page.goto("/en/account", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveURL(/\/en\/auth\/login/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  test("header exposes primary destinations (cart only in toolbar, not duplicated in nav)", async ({
    page,
  }) => {
    await page.goto("/en");
    const nav = page.getByRole("navigation", { name: "Primary navigation" });
    await expect(nav.getByRole("link", { name: "Home" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Products" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Categories" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Cart", exact: true })).toHaveCount(0);
    await expect(page.locator("header").getByRole("link", { name: /Cart \(\s*\d+\s*\)/ })).toHaveCount(1);
  });
});
