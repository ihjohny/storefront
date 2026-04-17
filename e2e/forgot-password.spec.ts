/** P2 — account UX; not part of `test:e2e:core`. See docs/frontend/TESTING.md */
import { test, expect } from "@playwright/test";

test.describe("forgot password (API stubbed)", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("**/api/users/forgot-password", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "{}",
      });
    });
  });

  test("submitting identifier shows generic success copy", async ({ page }) => {
    await page.goto("/en/auth/forgot-password");
    await page.getByTestId("forgot-password-identifier").fill("customer@example.com");
    await page.getByRole("button", { name: "Send reset instructions" }).click();
    await expect(
      page.getByText(
        "If an account exists for that identifier, you will receive password reset instructions shortly.",
      ),
    ).toBeVisible();
  });
});
