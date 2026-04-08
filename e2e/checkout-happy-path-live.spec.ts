/**
 * P0 core commerce E2E: guest checkout through success (payment POST stubbed). Part of `yarn test:e2e:core`.
 * See docs/frontend/TESTING.md § E2E priority.
 */
import { test, expect } from "@playwright/test";
import { apiOrigin, isBackendReachable } from "./helpers/live-backend";

const storefrontOrigin = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3001";

let live = false;

test.describe("guest checkout happy path (live API + mocked payment)", () => {
  test.beforeAll(async () => {
    live = await isBackendReachable();
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!live, `Backend not reachable at ${apiOrigin} — start SV backend or set PLAYWRIGHT_API_ORIGIN`);

    await page.route("**/api/checkout/process", async (route) => {
      if (route.request().method() !== "POST") {
        await route.continue();
        return;
      }
      const body = {
        orderId: "e2e-order",
        orderNumber: "E2E-1",
        paymentRedirectUrl: `${storefrontOrigin}/en/checkout/success`,
        transaction: { id: "txn-e2e", status: "pending" },
      };
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(body),
      });
    });
  });

  test("add to cart, guest address → shipping → review → pay redirects to success", async ({ page }) => {
    await page.goto("/en/products/demo-wireless-earbuds", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Demo Wireless Earbuds", level: 1 })).toBeVisible({
      timeout: 60_000,
    });
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.getByRole("link", { name: /Cart \(\s*1\s*\)/ })).toBeVisible({ timeout: 30_000 });

    await page.goto("/en/checkout");
    await expect(page.getByRole("heading", { name: "Checkout", level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Guest Checkout Address" })).toBeVisible({
      timeout: 60_000,
    });

    await page.getByLabel("Email").fill("e2e-guest@example.com");
    await page.getByLabel("First name").fill("E2E");
    await page.getByLabel("Last name").fill("Shopper");
    await page.getByLabel("Street 1").fill("1 Automation Lane");
    await page.getByLabel("City").fill("Dhaka");
    await page.getByLabel("Postal code").fill("1200");
    await page.getByRole("button", { name: "Continue to Shipping" }).click();

    await expect(page.getByRole("button", { name: "Continue to Review" })).toBeVisible({ timeout: 30_000 });
    await page.getByRole("button", { name: "Continue to Review" }).click();

    await expect(page.getByRole("heading", { name: "Payment" })).toBeVisible();
    await page.getByRole("button", { name: "Pay Now" }).click();

    await page.waitForURL("**/en/checkout/success**", { timeout: 30_000 });
    await expect(page.getByRole("heading", { name: "Payment successful", level: 1 })).toBeVisible();
  });
});
