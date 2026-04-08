import { afterEach, describe, expect, it, vi } from "vitest";

describe("features config", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("reads feature flags from env", async () => {
    process.env.NEXT_PUBLIC_MULTIVENDOR_ENABLED = "true";
    process.env.NEXT_PUBLIC_GUEST_CHECKOUT_ENABLED = "false";
    process.env.NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED = "true";

    vi.resetModules();
    const { features } = await import("@/lib/config/features");
    expect(features.multivendor).toBe(true);
    expect(features.guestCheckout).toBe(false);
    expect(features.socialLogin).toBe(true);
  });

  it("uses defaults when env vars are unset", async () => {
    delete process.env.NEXT_PUBLIC_MULTIVENDOR_ENABLED;
    delete process.env.NEXT_PUBLIC_GUEST_CHECKOUT_ENABLED;
    delete process.env.NEXT_PUBLIC_SOCIAL_LOGIN_ENABLED;

    vi.resetModules();
    const mod = await import("@/lib/config/features");
    expect(mod.features.multivendor).toBe(false);
    expect(mod.features.guestCheckout).toBe(true);
    expect(mod.features.socialLogin).toBe(true);
  });
});
