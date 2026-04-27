/** P1 route shells — no API. Run after P0 core commerce; see docs/frontend/TESTING.md */
import { test, expect } from "@playwright/test";

test.describe("storefront smoke (offline-tolerant)", () => {
  test("home renders", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { name: "Home", level: 1 })).toBeVisible();
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/en/auth/login");
    await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();
  });

  test("register page renders", async ({ page }) => {
    await page.goto("/en/auth/register");
    await expect(page.getByRole("heading", { name: "Create Account" })).toBeVisible();
  });

  test("empty cart page", async ({ page }) => {
    await page.goto("/en/cart");
    await expect(page.getByRole("heading", { name: /empty/i })).toBeVisible();
  });

  test("checkout shell renders", async ({ page }) => {
    await page.goto("/en/checkout");
    await expect(page.getByRole("heading", { name: "Checkout", level: 1 })).toBeVisible();
  });

  test("forgot password page renders", async ({ page }) => {
    await page.goto("/en/auth/forgot-password");
    await expect(page.getByRole("heading", { name: "Forgot Password" })).toBeVisible();
  });
});
