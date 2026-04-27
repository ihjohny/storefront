/**
 * P0 core commerce E2E: catalog, PDP, cart (with API + seed). Run via `yarn test:e2e:core` first.
 * See docs/frontend/TESTING.md § E2E priority.
 */
import { test, expect } from "@playwright/test";
import { apiOrigin, isBackendReachable } from "./helpers/live-backend";

let catalogTestsEnabled = false;

test.describe("catalog + cart (live API)", () => {
  test.beforeAll(async () => {
    catalogTestsEnabled = await isBackendReachable();
  });

  test.beforeEach(() => {
    test.skip(
      !catalogTestsEnabled,
      `Backend not reachable at ${apiOrigin} — start SV backend or set PLAYWRIGHT_API_ORIGIN`,
    );
  });

  test("products listing loads", async ({ page }) => {
    await page.goto("/en/products");
    await expect(page.getByRole("heading", { name: "Products", level: 1 })).toBeVisible({
      timeout: 60_000,
    });
  });

  test("product detail and add to cart", async ({ page }) => {
    await page.goto("/en/products/demo-wireless-earbuds", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Demo Wireless Earbuds", level: 1 })).toBeVisible({
      timeout: 60_000,
    });
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.getByRole("link", { name: /Cart \(\s*1\s*\)/ })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("open seeded product from listing by name", async ({ page }) => {
    await page.goto("/en/products");
    await expect(page.getByRole("heading", { name: "Products", level: 1 })).toBeVisible({
      timeout: 60_000,
    });
    await page.getByRole("link", { name: "Demo Wireless Earbuds" }).first().click();
    await expect(page).toHaveURL(/\/en\/products\/demo-wireless-earbuds/);
    await expect(page.getByRole("heading", { name: "Demo Wireless Earbuds", level: 1 })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("seeded category page loads", async ({ page }) => {
    await page.goto("/en/categories/demo-electronics");
    await expect(page.getByRole("heading", { name: "Demo Electronics", level: 1 })).toBeVisible({
      timeout: 60_000,
    });
  });

  test("categories index loads", async ({ page }) => {
    await page.goto("/en/categories");
    await expect(page.getByRole("heading", { name: "Categories", level: 1 })).toBeVisible({
      timeout: 60_000,
    });
  });

  test("cart increases quantity from line controls", async ({ page }) => {
    await page.goto("/en/products/demo-wireless-earbuds", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Demo Wireless Earbuds", level: 1 })).toBeVisible({
      timeout: 60_000,
    });
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.getByRole("link", { name: /Cart \(\s*1\s*\)/ })).toBeVisible({ timeout: 30_000 });

    await page.goto("/en/cart");
    await expect(page.getByRole("heading", { name: "Shopping Cart", level: 1 })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.getByRole("link", { name: /Cart \(\s*2\s*\)/ })).toBeVisible({ timeout: 15_000 });
  });

  test("cart proceed to checkout link visible with items", async ({ page }) => {
    await page.goto("/en/products/demo-wireless-earbuds", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await page.goto("/en/cart");
    await expect(page.getByRole("link", { name: "Proceed to Checkout" })).toBeVisible({
      timeout: 30_000,
    });
  });

  test("unknown product slug shows not found UI", async ({ page }) => {
    await page.goto("/en/products/this-slug-should-not-exist-404");
    await expect(page.getByRole("heading", { name: "Page not found", level: 1 })).toBeVisible({
      timeout: 60_000,
    });
  });

  test("product search query surfaces demo product", async ({ page }) => {
    await page.goto("/en/products?search=Wireless");
    await expect(page.getByRole("heading", { name: "Products", level: 1 })).toBeVisible({
      timeout: 60_000,
    });
    await expect(page.getByRole("link", { name: "Demo Wireless Earbuds" }).first()).toBeVisible({
      timeout: 30_000,
    });
  });

  test("remove line empties cart", async ({ page }) => {
    await page.goto("/en/products/demo-wireless-earbuds", { waitUntil: "domcontentloaded" });
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.getByRole("link", { name: /Cart \(\s*1\s*\)/ })).toBeVisible({ timeout: 30_000 });

    await page.goto("/en/cart");
    await expect(page.getByRole("heading", { name: "Shopping Cart", level: 1 })).toBeVisible({
      timeout: 30_000,
    });
    await page.getByRole("button", { name: "Remove" }).click();
    await expect(page.getByRole("heading", { name: /empty/i })).toBeVisible({ timeout: 30_000 });
  });
});
