/** P2 — search, locale, footer, stubbed login. Core commerce is P0. See docs/frontend/TESTING.md */
import { test, expect } from "@playwright/test";

test.describe("UX interactions (offline-tolerant)", () => {
  test("search submits to products with query string", async ({ page }) => {
    await page.goto("/en");
    const searchForm = page.locator("form").filter({ has: page.getByPlaceholder("Search products") }).first();
    await searchForm.getByPlaceholder("Search products").fill("earbuds");
    await searchForm.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/en\/products\?search=earbuds/);
  });

  test("empty search navigates to products index", async ({ page }) => {
    await page.goto("/en");
    const searchForm = page.locator("form").filter({ has: page.getByPlaceholder("Search products") }).first();
    await searchForm.getByRole("button", { name: "Search" }).click();
    await expect(page).toHaveURL(/\/en\/products$/);
  });

  test("Bengali locale route renders login with matching switcher", async ({ page }) => {
    await page.goto("/bn/auth/login", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
    await expect(page.getByTestId("locale-switcher-header")).toHaveValue("bn");
  });

  test("locale switcher in header navigates EN → BN", async ({ page }) => {
    await page.goto("/en/auth/login", { waitUntil: "load" });
    const localeSelect = page.getByTestId("locale-switcher-header");
    await expect(localeSelect).toBeVisible();
    await expect(localeSelect).toHaveValue("en");
    await localeSelect.selectOption({ value: "bn" });
    await expect(page).toHaveURL(/\/bn\/auth\/login/, { timeout: 20_000 });
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  test("login shows message when API rejects credentials", async ({ page }) => {
    await page.route("**/api/auth/login", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ errors: [{ message: "Invalid login" }] }),
      });
    });

    await page.goto("/en/auth/login");
    await page.getByLabel("Email or Phone").fill("nobody@example.com");
    await page.getByLabel("Password", { exact: true }).fill("wrong-password");
    await page.getByRole("button", { name: "Login" }).click();
    await expect(page.getByText("Invalid credentials or verification required.")).toBeVisible();
  });

  test("footer shop link reaches products", async ({ page }) => {
    await page.goto("/en");
    await page.getByRole("contentinfo").getByRole("link", { name: "Products" }).click();
    await expect(page).toHaveURL(/\/en\/products/);
  });
});
